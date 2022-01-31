import Nft "./type/nft_interface";
import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import SHA224 "./lib/SHA224";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Anv "./type/anv_interface";
import Cluster  "./type/Cluster";

shared({caller = _installer}) actor class Class() : async Anv.Interface = this {
    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();

    public type Balance = Nft.Balance;
    public type AccountIdentifier = Nft.AccountIdentifier;
    public type TokenIdentifier = Nft.TokenIdentifier;
  
    private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [];
    private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash);
    
    public type TransactionAmount = Nft.Balance;
    public type TransactionFrom = AccountIdentifier;
    public type TransactionTo = AccountIdentifier;

    system func preupgrade() {
      _tmpBalance := Iter.toArray(_balance.entries());
    };

    system func postupgrade() {
      _tmpBalance := [];
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };

    public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
          assert(caller == _installer);
          _oracle := oracle
    };

    public query func balance(request: Anv.BalanceRequest) : async Anv.BalanceResponse {
      
      let aid = Nft.User.toAccountIdentifier(request.user);
      switch(_balance.get(aid)) {
          case (?a) a;
          case (_) 0;
      };
    };


    public shared({caller}) func transfer(request: Anv.TransferRequest) : async Anv.TransferResponse {
      let aid = Nft.User.toAccountIdentifier(request.from);
      let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

      if (caller_user != request.from) return #err(#Unauthorized(aid));

      switch(_balance.get(aid)) {
            case (?bal) {

              if (bal < (request.amount + _oracle.anvFee)) return #err(#InsufficientBalance);

              let to_aid = Nft.User.toAccountIdentifier(request.to);

              let new_balance = bal - request.amount - _oracle.anvFee;
              if (new_balance > _oracle.anvFee) {
                _balance.put(aid, new_balance);
              } else {
                _balance.delete(aid);
              };

              balanceAdd(to_aid, request.amount);

              let transactionId = await Cluster.history(_conf).add(#anv(#transfer({created=Time.now(); from=Nft.User.toAccountIdentifier(request.from); to=Nft.User.toAccountIdentifier(request.to); memo=request.memo; amount=request.amount})));
              #ok({transactionId});

            };
            case (_) return #err(#InsufficientBalance);
        };
    };


    public query func dumpBalances() : async [(AccountIdentifier, Balance)] {
        Iter.toArray(_balance.entries());
    };

 

    public shared({caller}) func adminAllocate({user:Nft.User; amount:TransactionAmount}) : async () {
        
        assert(caller == _installer);

        let aid = Nft.User.toAccountIdentifier(user);

        let current:Nat64 = switch(_balance.get(aid)) {
            case (?a) a;
            case (_) 0;
        };

        let newBalance : Balance = current + amount;

        _balance.put(aid, newBalance);

    };


     private func balanceAdd(aid:AccountIdentifier, bal: Balance) : () {
      if (bal == 0) return ();
      let current:Balance = switch(_balance.get(aid)) {
        case (?a) a;
        case (_) 0;
      };

      _balance.put(aid, current + bal);
    };
  
}