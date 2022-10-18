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
import Nat16 "mo:base/Nat16";

import IF "./usewin_interface";
import Anvil "mo:anvil/base/Anvil";
import TrieRecord "mo:anvil/lib/TrieRecord";
import PseudoRandom "mo:anvil/lib/PseudoRandom";

// Contract #2
// Demonstration of NFT use function


shared({caller = _installer}) actor class Class() : async IF.Interface = this {

  // EDITABLE
  private let MAX_TOKENS = 10000;
  private let ALLOWED_USE_COLLECTION = Nft.AccountIdentifier.fromText("a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda");

  // Edit whats bellow only if you know what you are doing
  private let MAX_TOKEN_SPACE = MAX_TOKENS * 10;
  
  public type Basket = IF.Basket;

  private stable var randomNumber : Nat = 0; // unknown to the public. While the pseudo random sequence is known, this number isn't. Along with the complexity of asyncroneous calls & unknown internal nft memory, this will make sure nobody can cherry-pick nfts.

  private stable var _tokens : [var ?Nft.TokenIdentifier] = Array.init<?Nft.TokenIdentifier>(MAX_TOKEN_SPACE, null); // keep this 10 times bigger than max nft count


  // memory with used transactions - to avoid double spending attack
  private stable var _tmpUsed: [(Nft.TransactionId, Bool)] = [];
  private var _used: TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool> = TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool>( _tmpUsed.vals(),  Blob.equal, Blob.hash, func (x) {x}, func (x) {x});

  // temporary memory with account - purchased tokens. We can't send all purchased tokens in one call, so we need to store them
  private stable var _tmpAccount: [(Nft.AccountIdentifier, IF.AccountRecordSerialized)] = [];
  private var _account: TrieRecord.TrieRecord<Nft.AccountIdentifier, IF.AccountRecord, IF.AccountRecordSerialized> = TrieRecord.TrieRecord<Nft.AccountIdentifier, IF.AccountRecord, IF.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, IF.AccountRecordSerialize, IF.AccountRecordUnserialize);


  // Count of available nfts
  private stable var count_available: Nat = 0;
  private stable var count_total_added: Nat = 0;
  private stable var last_given_idx: Nat = 0;

  // Anvil object has various functions and provides anvil.conf and anvil.oracle. Without them communication with Anvil protocol wont be meaningful
  private let anvil = Anvil.Anvil();


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
  } {
    return {
      total = MAX_TOKENS;
      available = count_available;
      added = count_total_added;

    }
  };



  // Query all internally owned nfts by a certain AccountIdentifier
  public query func owned(aid : Nft.AccountIdentifier) : async Result.Result<IF.AccountRecordSerialized, Text> {
     switch(_account.get(aid)) {
       case (?a) #ok(IF.AccountRecordSerialize(a));
       case (_) return #err("Not existing address");
     };
  };

  // Marks a transaction as used, if its already used - returns error
  private func mark_tx(tx_id: Nft.TransactionId) :  Result.Result<(), Text> {
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
  private func give(aid: Nft.AccountIdentifier, count: Nat) : Result.Result<Basket, Text> {
    if (count_available < count) {
      return #err("Not enough nfts left in contract");
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


  public shared({caller}) func use_tx(tx_id:  Nft.TransactionId, subaccount: ?Nft.SubAccount) : async Result.Result<Basket, Text> {
    return #err("Inactive");

    let scriptAccount = getScriptAccount();
    let caller_aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);

    let tx = await anvil.getTransaction(tx_id);
    switch(tx) {
      case (?t) {
         switch (t.info) {
          case (#nft(#use({use; created; user; memo; token;}))) {
            if (use != #cooldown(10080)) return #err("Bad cooldown");
            if (caller_aid != user) return #err("Unauthorized");
          
            switch(await Cluster.nftFromTid(anvil.conf, token).metadata(token)) {
              case (#ok({data})) {
                if (data.author != ALLOWED_USE_COLLECTION) return #err("Nft not part of the collection required for this contract");
             
                let attr = data.attributes;

                let boost = Array.foldRight(attr, 1, func ((a:Text, c:Nat16), b:Nat) : Nat {
                  if (a == "luck") return b + Nat16.toNat(c);
                  if (a == "airdrops") return b + Nat16.toNat(c);
                  return b;
                });

                switch(mark_tx(tx_id)) {
                case (#ok()) {

                    let chance = (randomNumber + Nat32.toNat(rand.get(32))) % (300 / boost);
                    
                    if (chance != 0) return #ok([]);

                    switch(give(user, 1)) { //send 2 nfts to user
                        case (#ok(basket)) {
                          #ok(basket);
                        };
                        case (#err(e)) { // refund
                          #err(e);
                        };
                    };
                };
                case (#err(e)) {
                  return #err(e);
                };
             };
             
              };
              case (#err(e)) return #err("Token metadata error " # debug_show(e));
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

  public query func get_script_address() : async Text {
    return Nft.AccountIdentifier.toText(getScriptAccount());
  };

  public shared({caller}) func init_random() : async () {
    assert(caller == _installer);
    
    // get a random number
    let rnn = Random.Finite(await Random.blob());
    switch(rnn.range(64)) {
      case(?n) randomNumber := n;
      case(null) {assert(false)} // shouldn't happen
    }
  };


  public shared({caller}) func init_inventory(page: Nat) : async () {
    assert(caller == _installer);
    
    let scriptAccount = getScriptAccount();
    if (anvil.needsUpdate()) await anvil.update();

    let tokens = await Cluster.accountFromAid(anvil.conf, scriptAccount).list(scriptAccount, 0+(page*100), 100+(page*100));
    
    for (tid in tokens.vals()) {
      if (tid != 0) ignore add(tid);
    };
  };

  private func add(nft_id: Nft.TokenIdentifier) : Result.Result<(), Text> {

    if (findToken(nft_id) != #err()) return #err("Token already added");

    let scriptAccount = getScriptAccount();

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


  // check the icp balance of script address  (admin only)
  public shared({caller}) func icp_balance() : async Result.Result<Nft.Balance, Text> {

    assert(caller == _installer);
    if (anvil.needsUpdate()) await anvil.update();

    let scriptAccount = getScriptAccount();

    let res = await Cluster.pwrFromAid(anvil.conf, scriptAccount).balance({user = #address(scriptAccount)});

    #ok(res.pwr);
  };

  // transfer icp from script address to destination (admin only)
  public shared({caller}) func icp_transfer(to: Nft.AccountIdentifier, amount: Nft.Balance) : async Result.Result<Blob, Text> {
    
    assert(caller == _installer);
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

