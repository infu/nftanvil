import Nft "mo:anvil/type/nft_interface";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Cluster  "mo:anvil/type/Cluster";

import IF "./if";
import Anvil "mo:anvil/base/Anvil";
import TrieRecord "mo:anvil/lib/TrieRecord";

shared({caller = _installer}) actor class Class() : async IF.Interface = this {


  private stable var _tmpUsed: [(Nft.TransactionId, Bool)] = [];
  private var _used: TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool> = TrieRecord.TrieRecord<Nft.TransactionId, Bool, Bool>( _tmpUsed.vals(),  Blob.equal, Blob.hash, func (x) {x}, func (x) {x});

  private var count_available: Nat = 0;

  private let anvil = Anvil.Anvil();
  
  system func preupgrade() {
      _tmpUsed := Iter.toArray(_used.serialize());
  };

  system func postupgrade() {
      _tmpUsed := [];
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



  private func give(count: Nat) : Result.Result<(), Text> {
    if (count_available < count) {
      return #err("Not enough nfts left in contract");
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
                    switch(give(2)) {
                      case (#ok()) {
                        #ok();
                      };
                      case (#err(e)) {
                          // refund
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


// import Pwr "mo:anvil/type/pwr_interface";
// import TrieRecord "mo:anvil/lib/TrieRecord";

// import Array "mo:base/Array";
// import Iter "mo:base/Iter";
// import Time "mo:base/Time";
// import Blob "mo:base/Blob";
// import Debug "mo:base/Debug";