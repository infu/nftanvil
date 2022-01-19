import Nft "./type/nft_interface";
import Treasury "./type/treasury_interface";
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


shared({caller = _installer}) actor class Class() = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();

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

  public shared({caller}) func config_set(conf : Cluster.Config) : async () {
      assert(caller == _installer);
      _conf := conf
  };

 
  public shared({caller}) func notify_NFTPurchase(request: Treasury.NFTPurchase): async Treasury.NFTPurchaseResponse {
      //make sure caller is nft canister
      
      if ( Nft.APrincipal.isLegitimate(_conf.space, caller) == false ) return #err("Unauthorized");

      // if (Array_.exists(_conf.nft, caller, Principal.equal) == false) return #err("Unauthorized");

      let total:Nat64 = request.amount.e8s;
      let anvil_cut:Nat64 = total * Nat64.fromNat(Nft.Share.NFTAnvilShare) / Nat64.fromNat(Nft.Share.Max); // 0.5%
      let author_cut:Nat64= total * Nat64.fromNat(Nft.Share.limit(request.author.share, Nft.Share.LimitMinter)) / Nat64.fromNat(Nft.Share.Max);
     
      let marketplace_cut:Nat64 = switch(request.marketplace) {
        case (?marketplace) {
          total * Nat64.fromNat(Nft.Share.limit(marketplace.share, Nft.Share.LimitMarketplace)) / Nat64.fromNat(Nft.Share.Max);
        };
        case (null) {
          0;
        }
      };

      let affiliate_cut:Nat64 = switch(request.affiliate) {
        case (?affiliate) {
          total * Nat64.fromNat(Nft.Share.limit(affiliate.share, Nft.Share.LimitAffiliate)) / Nat64.fromNat(Nft.Share.Max);
        };
        case (null) {
          0;
        }
      };

      let seller_cut:Nat64 = total - anvil_cut - author_cut - marketplace_cut;

      if (total <= 0) return #err("Can't be 0");
      if ((seller_cut + marketplace_cut + affiliate_cut + author_cut + anvil_cut) != total) return #err("It's a zero sum game");

      let NFTAnvil_treasury_address = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?Nft.SubAccount.fromNat(1) );
      // give to NFTAnvil
      balanceAdd(NFTAnvil_treasury_address, anvil_cut);

      // give to Minter
      balanceAdd(request.author.address, author_cut);

      // give to Marketplace
      switch(request.marketplace) {
        case (?marketplace) {
          balanceAdd(marketplace.address, marketplace_cut);
        };
        case (null) ();
      };

      // give to Affiliate
      switch(request.affiliate) {
        case (?affiliate) {
          balanceAdd(affiliate.address, affiliate_cut);
        };
        case (null) ();
      };

      // give to Seller
      balanceAdd(request.seller, seller_cut);
      #ok();
  };

  private func balanceAdd(aid:AccountIdentifier, bal: Balance) : () {
      if (bal == 0) return ();
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
                    // #ok(amount)

                     let transactionId = await Cluster.history(_conf).add(#treasury(#withdraw({created=Time.now(); user=Nft.User.toAccountIdentifier(request.user); amount=amount})));
                     #ok({transactionId});

                };

                case (#Err(e)) {
                    _balance.put(aid, bal - _fee); // Its uknown if Ledger wont take us the fee even after returning error.
                     #err(#TransferFailed);
                }
            };
        };
        case (_) #err(#NotEnoughForTransfer);
    };


  };
}