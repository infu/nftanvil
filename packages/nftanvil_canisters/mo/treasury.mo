import Nft "./type/nft_interface";
import Treasury "./type/treasury_interface";
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
import Blob "mo:base/Blob";


shared({caller = _installer}) actor class Class({_admin: Principal; _router: Principal}) = this {

  public type Balance = Nft.Balance;
  public type AccountIdentifier = Nft.AccountIdentifier;
 
  private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [];
  private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash);
  
  private stable var _fee:Nat64 = 10000;

  private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

  system func preupgrade() {
    _tmpBalance := Iter.toArray(_balance.entries());
  };

  system func postupgrade() {
    _tmpBalance := [];
  };

  public query func dumpBalances() : async [(AccountIdentifier, Balance)] {
      Iter.toArray(_balance.entries());
  };

  public query func balance(request: Treasury.BalanceRequest) : async Treasury.BalanceResponse {
    
    let aid = Nft.User.toAccountIdentifier(request.user);

    switch(_balance.get(aid)) {
        case (?a) a;
        case (_) 0;
     };
  };

  public shared({caller}) func notifyTransfer(request: Treasury.NotifyTransferRequest): async Treasury.NotifyTransferResponse {
      
      let total:Nat64 = request.amount.e8s;
      let anvil_share:Nat64 = total * 50 / 100; // 0.5%
      let minter_share:Nat64= total * request.minter.share / 100;
      let marketplace_share:Nat64 = total * request.marketplace.share / 100;
      let seller_share:Nat64 = total - anvil_share - minter_share - marketplace_share;

      assert(total > 0);
      assert((seller_share + marketplace_share + minter_share + anvil_share) == total);

      // give to NFTAnvil
      // give to Author
      // give to Marketplace
      // give to Seller
      #ok();
  };

  public shared({caller}) func withdraw(request: Treasury.WithdrawRequest) : async Treasury.WithdrawResponse {
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

    let aid = Nft.User.toAccountIdentifier(request.user);

    switch(_balance.get(aid)) {
        case (?bal) {

            if (bal <= _fee) return #err(#NotEnoughForTransfer);
            let amount = bal - _fee;
            _balance.delete(aid); // If we don't do that, async requests may sneak in

            let transfer : Ledger.TransferArgs = {
                memo = 0;
                amount = {e8s = amount};
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
                    _balance.put(aid, bal - _fee); // Its uknown if Ledger wont take us the fee even after returning error.
                     #err(#TransferFailed);
                }
            };
        };
        case (_) #ok(0);
    };


  };
}