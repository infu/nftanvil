import Nft "mo:anvil/type/nft_interface";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Cluster  "mo:anvil/type/Cluster";

import IF "./if";
import Anvil "mo:anvil/base/Anvil";
import TrieRecord "mo:anvil/lib/TrieRecord";
import PseudoRandom "mo:anvil/lib/PseudoRandom";


shared({caller = _installer}) actor class Class() : async IF.Interface = this {

  private stable var _tokens : [var ?Nft.TokenIdentifier] = Array.init<?Nft.TokenIdentifier>(100000, null);

  private stable var _tmpUsed: [(Nft.TransactionId, Bool)] = [];

  private var _used: TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool> = TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool>( _tmpUsed.vals(),  Blob.equal, Blob.hash, func (x) {x}, func (x) {x});

  private stable var _tmpAccount: [(Nft.AccountIdentifier, IF.AccountRecordSerialized)] = [];

  private var _account: TrieRecord.TrieRecord<Nft.AccountIdentifier, IF.AccountRecord, IF.AccountRecordSerialized> = TrieRecord.TrieRecord<Nft.AccountIdentifier, IF.AccountRecord, IF.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, IF.AccountRecordSerialize, IF.AccountRecordUnserialize);
  
  private var count_available: Nat = 0;

  private let anvil = Anvil.Anvil();

  var rand = PseudoRandom.PseudoRandom();

  system func preupgrade() {
      _tmpUsed := Iter.toArray(_used.serialize());
      _tmpAccount := Iter.toArray(_account.serialize());

  };

  system func postupgrade() {
      _tmpUsed := [];
      _tmpAccount := [];
  };

  public shared({caller}) func add(nft_id: Nft.TokenIdentifier) : async () {
    label lo loop {
      let rnd_slot = Nat32.toNat(rand.get(8)) % 100000;
      if (_tokens[rnd_slot] == null) {
        _tokens[rnd_slot] := ?nft_id;
        break lo;
        };
    };
  };

  public query func ownedTokens(aid : Nft.AccountIdentifier) : async Result.Result<IF.AccountRecordSerialized, Text> {
     switch(_account.get(aid)) {
       case (?a) #ok(IF.AccountRecordSerialize(a));
       case (_) return #err("Not existing address");
     };
  };

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

  private func give(aid: Nft.AccountIdentifier, count: Nat) : Result.Result<(), Text> {
    if (count_available < count) {
      return #err("Not enough nfts left in contract");
    };

    var nft_idx = 0;
    for (j in Iter.range(0, count - 1)) {
      label lo loop {
        
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

                    _tokens[nft_idx] := null;
                    break lo;
          
              };
              case (null) {

              };
            };
          
            nft_idx := nft_idx +1;
      }

    };

    #ok();
  };

  public shared({caller}) func check_tx(tx_id:  Nft.TransactionId) : async Result.Result<(), Text> {
    let scriptAccount = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), null);

    let tx = await anvil.getTransaction(tx_id);
    switch(tx) {
      case (?t) {
         switch (t.info) {
          case (#pwr(#transfer({amount; created; from; memo; to;}))) {
            if (to != scriptAccount) return #err("Wrong destination address");
            switch(amount) {
              case (40000) {
                switch(use(tx_id)) {
                  case (#ok()) {
                    switch(give(from, 2)) { //send 2 nfts to user
                      case (#ok()) {
                        #ok();
                      };
                      case (#err(e)) { // refund
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
                  case (#err(t)) return #err(t);
                };
              };
              case (_) {
                return #err("Amount is wrong");
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

};

