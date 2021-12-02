import Ext "../lib/ext.std/src/Ext";
import Interface "../lib/ext.std/src/Interface";
import Blob_ "../lib/vvv/src/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import SHA256 "mo:sha/SHA256";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import TRE "./treasury_interface";

shared({caller = _installer}) actor class TREASURY({_admin: Principal; _router: Principal}) = this {


  public type Balance = Ext.Balance;
  public type AccountIdentifier = Ext.AccountIdentifier;
 
  private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [];
  private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Ext.AccountIdentifier.equal, Ext.AccountIdentifier.hash);
  
  private stable var _fee:Nat64 = 10000;

  system func preupgrade() {
    _tmpBalance := Iter.toArray(_balance.entries());
  };

  system func postupgrade() {
    _tmpBalance := [];
  };

  public query func dumpBalances() : async [(AccountIdentifier, Balance)] {
      Iter.toArray(_balance.entries());
  };

  public query func balance(request: TRE.BalanceRequest) : async TRE.BalanceResponse {
    
    let aid = Ext.User.toAccountIdentifier(request.user);
    switch(_balance.get(aid)) {
        case (?a) #ok(a);
        case (_) #ok(0);
     };
  };

  public shared({caller}) func notifyTransfer(request: TRE.NotifyTransferRequest): async TRE.NotifyTransferResponse {
      // give to NFTAnvil 
      // give to Author
      // give to Marketplace
      // give to Seller
  };

  public shared({caller}) func withdraw(request: TRE.WithdrawRequest) : async TRE.WithdrawResponse {
    let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));

    let aid = Ext.User.toAccountIdentifier(request.user);

    switch(_balance.get(aid)) {
        case (?bal) {

            if (bal <= _fee) return #err(#NotEnoughForTransfer);
            let amount = bal - _fee;
            _balance.delete(aid);

            let transfer : Ledger.TransferArgs = {
                memo = 0;
                amount;
                fee = {e8s = _fee};
                from_subaccount = null;
                to = aid;
                created_at_time = null;
                };

            switch(await ledger.transfer(transfer)) {
                case (#Ok(blockIndex)) {
                    #ok(amount)
                };

                case (#Err(e)) {
                    _balance.put(aid, bal);
                     #err(#TransferFailed);
                }
            };
        };
        case (_) #ok(0);
    };


  };
}