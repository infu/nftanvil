import Nft "./type/nft_interface";
import Pwr "./type/pwr_interface";
import Ledger  "./type/ledger_interface";

import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import SHA256 "mo:sha/SHA256";
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

  public type Balance = Nft.Balance;
  public type AccountIdentifier = Nft.AccountIdentifier;
  public type TokenIdentifier = Nft.TokenIdentifier;

  private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [];
  private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash);
  
  private stable var _fee:Nat64 = 10000;
  private stable var _feePwr:Nat64 = 10000;


  private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

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

  public query func dumpBalances() : async [(AccountIdentifier, Balance)] {
     Iter.toArray(_balance.entries());
  };

  private func myTokenId() : TokenIdentifier {
    Nft.TokenIdentifier.encode( Principal.fromActor(this), 0);
  };

  public query func tokenId() : async TokenIdentifier {
    myTokenId();
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
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch(_balance.get(aid)) {
          case (?bal) {

            if (bal < (request.amount + _feePwr)) return #err(#InsufficientBalance);

            let to_aid = Nft.User.toAccountIdentifier(request.to);

            let new_balance = bal - request.amount - _feePwr;
            if (new_balance > _feePwr) {
              _balance.put(aid, new_balance);
            } else {
              _balance.delete(aid);
            };

            balanceAdd(to_aid, request.amount);
            #ok(new_balance);

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

        if (payment <= _fee) return #err(#PaymentTooSmall);

        let amount = {e8s = payment - _fee};

        let transfer : Ledger.TransferArgs = {
            memo = 0;
            amount;
            fee = {e8s = _fee};
            from_subaccount = ?purchaseSubAccount;
            to = NFTAnvil_PWR_ICP_address;
            created_at_time = null;
            };

        switch(await ledger.transfer(transfer)) {
            case (#Ok(blockIndex)) {

                balanceAdd(toUserAID, amount.e8s );
                
                #ok();
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