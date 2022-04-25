import Nft "mo:anvil/type/nft_interface";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Random "mo:base/Random";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Cluster  "mo:anvil/type/Cluster";
import SHA224 "mo:anvil/lib/SHA224";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";

import IF "./ito_interface";
import Anvil "mo:anvil/base/Anvil";
import TrieRecord "mo:anvil/lib/TrieRecord";
import PseudoRandom "mo:anvil/lib/PseudoRandom";

// Contract #1
// Initial Token Offering contract using Anvil protocol
//
// SETUP: Use `npx anvil ito` to set it up
// 0) Edit this contract initial parameters. Scroll down to "EDITABLE" and then deploy it on the IC network
// 1) `npx anvil ito init` will set admin principal
// 2) `npx anvil ito add 0 1000 will add minted nfts to this contract
// 3) `npx anvil ito airdrop 500` will generate 500 airdrop codes

// ITO: The way it works for end users:
// purchase and airdrop functions are available once ITO starts (after START_TIMESTAMP)
// 
// Option 1) purchase a package
// Frontend makes wrapped icp (pwr) transfer to this contract and sends it the "tx"
// tx is checked and nfts given internally
// frontend claims each nft
//
// Option 2) airdrop code
// Users have a code which they send to this contract instead of paying icp
// The rest is the same
//
// END:
// 1) use `npx anvil ito balance` to get contract icp balance
// 2) use `npx anvil ito transfer-icp` to send icp
// 

shared({caller = _installer}) actor class Class() : async IF.Interface = this {

  // EDITABLE
  private let MAX_TOKENS = 10000;
  private let MAX_CODES = 10000;
  private stable var LEFT_AIRDROP : Nat = 3000;
  private stable var LEFT_PURCHASE : Nat = 6000;
  private let START_TIMESTAMP : Nat32 = 1651089600; //1654951047

  // Edit whats bellow only if you know what you are doing
  private let MAX_TOKEN_SPACE = MAX_TOKENS * 10;
  
  public type Basket = IF.Basket;

  private stable var randomNumber : Nat = 0; // unknown to the public. While the pseudo random sequence is known, this number isn't. Along with the complexity of asyncroneous calls & unknown internal nft memory, this will make sure nobody can cherry-pick nfts.

  private stable var _tokens : [var ?Nft.TokenIdentifier] = Array.init<?Nft.TokenIdentifier>(MAX_TOKEN_SPACE, null); // keep this 10 times bigger than max nft count

  private stable var _codes : [var ?Blob] = Array.init<?Blob>(MAX_CODES, null);

  // memory with used transactions - to avoid double spending attack
  private stable var _tmpUsed: [(Nft.TransactionId, Bool)] = [];
  private var _used: TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool> = TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool>( _tmpUsed.vals(),  Blob.equal, Blob.hash, func (x) {x}, func (x) {x});

  // temporary memory with account - purchased tokens. We can't send all purchased tokens in one call, so we need to store them
  private stable var _tmpAccount: [(Nft.AccountIdentifier, IF.AccountRecordSerialized)] = [];
  private var _account: TrieRecord.TrieRecord<Nft.AccountIdentifier, IF.AccountRecord, IF.AccountRecordSerialized> = TrieRecord.TrieRecord<Nft.AccountIdentifier, IF.AccountRecord, IF.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, IF.AccountRecordSerialize, IF.AccountRecordUnserialize);

  private stable var airdrop_codes: Nat = 0;

  // Count of available nfts
  private stable var count_available: Nat = 0;
  private stable var count_total_added: Nat = 0;
  private stable var last_given_idx: Nat = 0;

  // Anvil object has various functions and provides anvil.conf and anvil.oracle. Without them communication with Anvil protocol wont be meaningful
  private let anvil = Anvil.Anvil();

  private stable var admin : Principal = Principal.fromText("aaaaa-aa");

  // Pseudo random which can be shuffled with IC Random to become real random
  private let rand = PseudoRandom.PseudoRandom();

  // preupgrade & postupgrade functions are called during canister upgrade
  system func preupgrade() {
      _tmpUsed := Iter.toArray(_used.serialize());
      _tmpAccount := Iter.toArray(_account.serialize());
  };

  system func postupgrade() {
      _tmpUsed := [];
      _tmpAccount := [];
  };

  public query func stats() : async {
    available: Nat;
    total: Nat;
    added: Nat;
    airdrop: Nat;
    purchase: Nat;
  } {
    return {
      total = MAX_TOKENS;
      available = count_available;
      added = count_total_added;
      airdrop = LEFT_AIRDROP;
      purchase = LEFT_PURCHASE;
    }
  };

  // Users can get their airdrop by providing a code
  public shared({caller}) func airdrop_use(aid : Nft.AccountIdentifier, key: Blob) : async Result.Result<Basket, Text> {

    if (now() < START_TIMESTAMP) return #err("hasn't started yet");

    assert(key.size() == 20);
    let keyHash = Blob.fromArray(SHA224.sha224(Blob.toArray(key)));
    var idx: Nat = 0;
    label lo loop {
      if (_codes[idx] == ?keyHash) {
        switch(give(aid, 1, #airdrop)) {
          case (#ok(basket)) {
            _codes[idx] := null; // deleting code
            return #ok(basket);
          };
          case (#err(e)) {
            return #err("Couldn't give drop " # debug_show(e));
          }
        }; 

        break lo;
      };

      idx += 1;
      if (idx >= MAX_CODES) break lo;
    };

    #err("Code not found or already used")
  };


  // Query all internally owned nfts by a certain AccountIdentifier
  public query func owned(aid : Nft.AccountIdentifier) : async Result.Result<IF.AccountRecordSerialized, Text> {
     switch(_account.get(aid)) {
       case (?a) #ok(IF.AccountRecordSerialize(a));
       case (_) return #err("Not existing address");
     };
  };

  // Marks a transaction as used, if its already used - returns error
  private func use(tx_id: Nft.TransactionId) :  Result.Result<(), Text> {
      switch(_used.get(tx_id)) {
        case (?a) {
          return #err("TX already used");
        };
        case (_) {
          _used.put(tx_id, true);
          return #ok();
        }
      }
  };

  // Claim your nfts from internal memory
  public shared({caller}) func claim(aid:Nft.AccountIdentifier, subaccount:?Nft.SubAccount, tid:Nft.TokenIdentifier) : async Result.Result<(), Text> {
    let caller_aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);

    if (aid != caller_aid) return #err("Unauthorized");

    let r = switch(_account.get(aid)) {
        case (?ac) ac;
        case (_) {
            return #err("Nothing to claim");
        };
    };

    switch(r.tokens.indexOf(tid)) {
      case (?idx) {
          switch(await Cluster.nftFromTid(anvil.conf, tid).transfer({
            from = #address(getScriptAccount());
            to = #address(aid);
            token = tid;
            memo = Blob.fromArray([]);
            subaccount = null;
            })) {
              case (#ok({transactionId})) {
                r.tokens.rem(tid);

                return #ok();
              };
              case (#err(e)) {
                return #err("Error transfering. " # debug_show(e) # ". Try again")
              }
            };
            
      };
      case (null) {
        return #err("Token not found in your temporary token list");
      }
    };
      
  };

  // We move nfts from _tokens to _account internally. Later their new owner can claim them
  // where they get finally transfered
  private func give(aid: Nft.AccountIdentifier, count: Nat, pool : {#buy; #airdrop}) : Result.Result<Basket, Text> {
    if (count_available < count) {
      return #err("Not enough nfts left in contract");
    };

    if ((pool == #buy) and (LEFT_PURCHASE < count)) {
      return #err("Not enough left for purchase");
    };
    
    if ((pool == #airdrop) and (LEFT_AIRDROP < count)) {
      return #err("Not enough left for airdrop");
    };

    var basket : [var ?Nft.TokenIdentifier] = Array.init<?Nft.TokenIdentifier>(count, null); 

    var nft_idx = last_given_idx;
    for (j in Iter.range(0, count - 1)) {
      label lo loop {
          if (nft_idx >= MAX_TOKEN_SPACE) return #err("Integrity error. No more tokens left in contract");
          switch(_tokens[nft_idx]) {
            case (?tid) {
                let r = switch(_account.get(aid)) {
                    case (?ac) ac;
                    case (_) {
                        let blank = IF.AccountRecordBlank();
                        _account.put(aid, blank);  
                        blank;
                    };
                };

                r.tokens.add(tid);
                basket[j] := ?tid;

                _tokens[nft_idx] := null;
                count_available -= 1;
                if (pool == #buy) LEFT_PURCHASE -= 1;
                if (pool == #airdrop) LEFT_AIRDROP -= 1;
                break lo;
        
            };
            case (null) {

            };
          };
        
          nft_idx := nft_idx + 1;
          
      };

    };

    last_given_idx := nft_idx;

    #ok(Array.freeze(basket));
  };


  // Returns the address of this script. Can hold ICP, wrapped ICP and Anvil NFTs
  private func getScriptAccount() : Nft.AccountIdentifier {
    Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), null)
  };

  // Returns unix timestamp in seconds
  private func now() : Nat32 {
      return  Nat32.fromIntWrap(Int.div(Time.now(), 1000000000)); 
  };

  // Takes anvil transaction and checks if its going to the right place
  // Dependent on the amount sent, we give different amount of nfts
  // Transactions get stored so they can't be used for second time
  // If there are not enough nfts in contract, we will refund
  public shared({caller}) func buy_tx(tx_id:  Nft.TransactionId, subaccount: ?Nft.SubAccount) : async Result.Result<Basket, Text> {

    

    let scriptAccount = getScriptAccount();
    let caller_aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);

    let tx = await anvil.getTransaction(tx_id);
    switch(tx) {
      case (?t) {
         switch (t.info) {
          case (#pwr(#transfer({amount; created; from; memo; to;}))) {
            if (to != scriptAccount) return #err("Wrong destination address");
            if (caller_aid != from) return #err("Unauthorized");
            switch(switch(amount) {
              // pricing option one (its written verbose because different packages may give more things differently)
              case (29940120) {
                switch(use(tx_id)) {
                  case (#ok()) {
                    if (now() < START_TIMESTAMP) { #refund("Hasn't started yet"); }
                    else switch(give(from, 1, #buy)) { //send 2 nfts to user
                      case (#ok(basket)) {
                        #ok(basket);
                      };
                      case (#err(e)) { // refund
                        #refund(e);
                      };
                    };
                  };
                  case (#err(t)) return #err(t); // directly exits without refunding
                };
              };
              // pricing option two
              case (134730539) {
                switch(use(tx_id)) {
                  case (#ok()) {
                    if (now() < START_TIMESTAMP) { #refund("Hasn't started yet"); }
                    else switch(give(from, 5, #buy)) {
                      case (#ok(basket)) {
                        #ok(basket);
                      };
                      case (#err(e)) { 
                        #refund(e);
                      };
                    };
                  };
                  case (#err(t)) return #err(t); // directly exits without refunding
                };
              };
              // pricing option three
              case (479041916) {
                switch(use(tx_id)) {
                   case (#ok()) {
                    if (now() < START_TIMESTAMP) { #refund("Hasn't started yet"); }
                    else switch(give(from, 20, #buy)) { 
                      case (#ok(basket)) {
                        #ok(basket);
                      };
                      case (#err(e)) { 
                        #refund(e);
                      };
                    };
                  };
                  case (#err(t)) return #err(t); // directly exits without refunding
                };
              };
              case (_) {
                return #err("Amount is wrong");
              };
            }) {
              case (#ok(basket)) #ok(basket);
              case (#refund(e)) {
                switch(await Cluster.pwrFromAid(anvil.conf, scriptAccount).pwr_transfer({from = #address(scriptAccount); to=#address(from); amount = amount - anvil.oracle.pwrFee; memo=Blob.fromArray([]); subaccount=null})) {
                    case (#ok({transactionId})) {
                      return #err(e # ". Refunded");
                    };
                    case (#err(e)) {
                      return #err(debug_show(e))
                    }
                  }
              };

            };
          };
          case _ { return #err("Wrong type of tx");}
        };
      };
      case (null) {
        return (#err("Tx not found"))
      };
    }; 
 
  };

  // Finds the location of a certain nft_id inside our internal memory
  private func findToken(nft_id: Nft.TokenIdentifier) : Result.Result<Nat, ()> {
    var idx: Nat = 0;

    label lo loop {
      if (idx >= MAX_TOKEN_SPACE) return #err();
      if (_tokens[idx] == ?nft_id) {
        return #ok(idx);
      };
      idx += 1;
    };

    #err();
  };

  // --------- ADMIN FUNCTIONS -----------


  // Installer sets an admin, which can add nfts (admin only)
  public shared({caller}) func set_params({purchase:Nat; airdrop: Nat}) : () {
    assert((caller == admin) or (caller == _installer));

    LEFT_PURCHASE := purchase;
    LEFT_AIRDROP := airdrop;
  };

  // Installer sets an admin, which can add nfts (admin only)
  public shared({caller}) func set_admin(x: Principal) : () {
    assert(caller == _installer);
    admin := x;
  };

  // For local test purposes. Comment out in production contract
  public shared({caller}) func set_anvil_config(conf : Cluster.Config) : async () {
    assert(caller == admin);
    anvil.conf := conf;
    await anvil.update();

    // get a random number
    let rnn = Random.Finite(await Random.blob());
    switch(rnn.range(64)) {
      case(?n) randomNumber := n;
      case(null) {assert(false)} // shouldn't happen
    }
    
  };

  // NFTs are minted at NFTAnvil then added to this contract. The added tokens need to be owned by the contract, or it wont be able to transfer them. (admin only)
  public shared({caller}) func add(nft_id: Nft.TokenIdentifier) : async Result.Result<(), Text> {
    assert(caller == admin);

    if (findToken(nft_id) != #err()) return #err("Token already added");

    let scriptAccount = getScriptAccount();

    // make sure contract owns the nft before adding it to internal memory
    switch(await Cluster.nftFromTid(anvil.conf, nft_id).bearer(nft_id)) {
      case (#ok(bearer)) {
        if (bearer != scriptAccount) return #err("You can't add a token which is not owned by this contract");
      };
      case (#err(e)) return #err("Token error " # debug_show(e));
    };
    

    label lo loop {
      let rnd_slot = (randomNumber + count_available + Nat32.toNat(rand.get(32))) % MAX_TOKEN_SPACE;
      if (_tokens[rnd_slot] == null) {
        _tokens[rnd_slot] := ?nft_id;
        count_available += 1;
        count_total_added += 1;
        break lo;
        };
    };

    #ok();

  };


  // We are adding hash from two pieces. (admin only)
  public shared({caller}) func airdrop_add(hash: Blob) : async Result.Result<(), Text> {
    assert(caller == admin);
    assert(hash.size() <= 32);
    _codes[airdrop_codes] := ?hash;
    airdrop_codes += 1;
    #ok();
  };
  
  // check the icp balance of script address  (admin only)
  public shared({caller}) func icp_balance() : async Result.Result<Nft.Balance, Text> {

    assert((caller == admin) or (caller == _installer));
    if (anvil.needsUpdate()) await anvil.update();

    let scriptAccount = getScriptAccount();

    let res = await Cluster.pwrFromAid(anvil.conf, scriptAccount).balance({user = #address(scriptAccount)});

    #ok(res.pwr);
  };

  // transfer icp from script address to destination (admin only)
  public shared({caller}) func icp_transfer(to: Nft.AccountIdentifier, amount: Nft.Balance) : async Result.Result<Blob, Text> {
    
    assert((caller == admin) or (caller == _installer));
    if (anvil.needsUpdate()) await anvil.update();
    
    let scriptAccount = getScriptAccount();

    switch(await Cluster.pwrFromAid(anvil.conf, scriptAccount).pwr_withdraw({from = #address(scriptAccount); to=#address(to); amount = amount - anvil.oracle.pwrFee; subaccount=null})) {
          case (#ok({transactionId})) {
            #ok(transactionId)
          };
          case (#err(e)) {
            return #err(debug_show(e))
          }
        };
  };


};

