import Nft "./type/nft_interface";
import Pwr "./type/pwr_interface";
import Ledger  "./type/ledger_interface";

import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Array_ "./lib/Array";

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";


shared({caller = _installer}) actor class Class() : async Pwr.Interface = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();

  public type Balance = Nft.Balance;
  public type AccountIdentifier = Nft.AccountIdentifier;
  public type TokenIdentifier = Nft.TokenIdentifier;

  private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [];
  private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash);
  


  private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

  system func preupgrade() {
    //_tmpBalance := Iter.toArray(_balance.entries());
    _tmpBalance := [(Nft.AccountIdentifier.fromText("f24380db6b95c504626c9e827c61e4ff46ce5e064f4e012585640868d831c61f"), 100000000), (Nft.AccountIdentifier.fromText("9753428aee3376d3738ef8e94767608f37c8ae675c38acb80884f09efaa99b32"),100000000)];
    ignore 1
  };

  system func postupgrade() {
    // TODO: Remove in production
    ignore 3;
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

  public query func dumpBalances() : async [(AccountIdentifier, Balance)] {
     Iter.toArray(_balance.entries());
  };


  public query func balance(request: Pwr.BalanceRequest) : async Pwr.BalanceResponse {
    
    let aid = Nft.User.toAccountIdentifier(request.user);

    switch(_balance.get(aid)) {
        case (?a) a;
        case (_) 0;
     };
  };

  public shared({caller}) func transfer(request: Pwr.TransferRequest) : async Pwr.TransferResponse {
    let aid = Nft.User.toAccountIdentifier(request.from);

    let isAnvil = Nft.APrincipal.isLegitimate(_conf.space, caller); // Checks if caller is from Anvil principal space
    let caller_user:Nft.User = switch(isAnvil) {
      case (true) {
        #address(Nft.User.toAccountIdentifier(request.from))
      };
      case (false) {
         #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
      };
    }; 

    if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch(_balance.get(aid)) {
          case (?bal) {

            if (bal < (request.amount + _oracle.pwrFee)) return #err(#InsufficientBalance);

            let to_aid = Nft.User.toAccountIdentifier(request.to);

            let new_balance = bal - request.amount - _oracle.pwrFee;
            if (new_balance > _oracle.pwrFee) {
              _balance.put(aid, new_balance);
            } else {
              _balance.delete(aid); // Will free memory of empty accounts
            };

            balanceAdd(to_aid, request.amount);

            if (isAnvil) {
              //This avoids adding two transactions for one operation like minting
              #ok({transactionId=Blob.fromArray([])});
            } else {
              let transactionId = await Cluster.history(_conf).add(#pwr(#transfer({created=Time.now(); from=Nft.User.toAccountIdentifier(request.from); to=Nft.User.toAccountIdentifier(request.to); memo=request.memo; amount=request.amount})));
              #ok({transactionId});
            }
            

          };
          case (_) return #err(#InsufficientBalance);
      };
  };

  public shared({caller}) func purchase_intent(request: Pwr.PurchaseIntentRequest) : async Pwr.PurchaseIntentResponse {
  
        let toUserAID = Nft.User.toAccountIdentifier(request.user);

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
        assert(caller_user == request.user);

        let (purchaseAccountId,_) = Nft.AccountIdentifier.purchaseAccountId(Principal.fromActor(this), 0, toUserAID);
        
        #ok(purchaseAccountId);
  };

  public shared({caller}) func purchase_claim(request: Pwr.PurchaseClaimRequest) : async Pwr.PurchaseClaimResponse {
        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
        assert(caller_user == request.user);

        let NFTAnvil_PWR_ICP_address = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?Nft.SubAccount.fromNat(1));

        let toUserAID = Nft.User.toAccountIdentifier(request.user);
        
        let (purchaseAccountId, purchaseSubAccount) = Nft.AccountIdentifier.purchaseAccountId(Principal.fromActor(this), 0, toUserAID);
        
        let {e8s = payment} = await ledger.account_balance({
            account = purchaseAccountId
        });

        if (payment <= _oracle.icpFee) return #err(#PaymentTooSmall);

        let amount = {e8s = payment - _oracle.icpFee};

        let transfer : Ledger.TransferArgs = {
            memo = 0;
            amount;
            fee = {e8s = _oracle.icpFee};
            from_subaccount = ?purchaseSubAccount;
            to = NFTAnvil_PWR_ICP_address;
            created_at_time = null;
            };

        switch(await ledger.transfer(transfer)) {
            case (#Ok(blockIndex)) {

                balanceAdd(toUserAID, 100000 * (amount.e8s - _oracle.icpFee)); // This 1000 is here for demo only
                
                let transactionId = await Cluster.history(_conf).add(#pwr(#mint({created=Time.now(); user=Nft.User.toAccountIdentifier(request.user); amount=amount.e8s})));

                #ok({transactionId});
            };
            case (#Err(e)) {
                //TODO: ADD to QUEUE for later transfer attempt
                return #err(#Ledger(e));
            };
        };
        
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