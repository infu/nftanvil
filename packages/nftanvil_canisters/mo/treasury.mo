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
      //TODO: make sure caller is nft canister

      let total:Nat64 = request.amount.e8s;
      let anvil_cut:Nat64 = total * Nat64.fromNat(Nft.Share.NFTAnvilShare) / Nat64.fromNat(Nft.Share.Max); // 0.5%
      let minter_cut:Nat64= total * Nat64.fromNat(Nft.Share.limit(request.minter.share, Nft.Share.LimitMinter)) / Nat64.fromNat(Nft.Share.Max);
      let marketplace_cut:Nat64 = total * Nat64.fromNat(Nft.Share.limit(request.marketplace.share, Nft.Share.LimitMarketplace)) / Nat64.fromNat(Nft.Share.Max);
      let seller_cut:Nat64 = total - anvil_cut - minter_cut - marketplace_cut;

      assert(total > 0);
      assert((seller_cut + marketplace_cut + minter_cut + anvil_cut) == total);

      let NFTAnvil_treasury_address = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?Nft.SubAccount.fromNat(1) );
      // give to NFTAnvil
      balanceAdd(NFTAnvil_treasury_address, anvil_cut);

      // give to Minter
      balanceAdd(request.minter.address, minter_cut);

      // give to Marketplace
      balanceAdd(request.marketplace.address, marketplace_cut);

      // give to Seller
      balanceAdd(request.seller, seller_cut);

  };

  private func balanceAdd(aid:AccountIdentifier, bal: Balance) : () {
      let current:Balance = switch(_balance.get(aid)) {
        case (?a) a;
        case (_) 0;
      };

      _balance.put(aid, current + bal);
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