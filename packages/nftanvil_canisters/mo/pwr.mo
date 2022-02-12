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
import Result "mo:base/Result";

import Array "mo:base/Array";
import Array_ "./lib/Array";

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 


shared({caller = _installer}) actor class Class() : async Pwr.Interface = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
    private stable var _cycles_recieved : Nat = Cycles.balance();

  public type Balance = Nft.Balance;
  public type AccountIdentifier = Nft.AccountIdentifier;
  public type TokenIdentifier = Nft.TokenIdentifier;

  private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [(Nft.AccountIdentifier.fromText("a00b7d95d24e463793ebf91e459b48c27cb9b208e2e9ff2f2ec8b60d17ffa411"), 100000000), (Nft.AccountIdentifier.fromText("9753428aee3376d3738ef8e94767608f37c8ae675c38acb80884f09efaa99b32"),100000000), (Nft.AccountIdentifier.fromText("a00974c489e1a7e98fafe92cebd40ee99d5864faf53fc21e555860bc0b48d6c4"),1000000000), (Nft.AccountIdentifier.fromText("7f966c0efdc84e116ae2638fed07b2bf999f3f57a7aacde579f641b177baa891"),1000000000) ]; //[];
  
  private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash);

  private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

  system func preupgrade() {
    _tmpBalance := Iter.toArray(_balance.entries());
  };

  system func postupgrade() {
     _tmpBalance := [];
  };


  public func wallet_receive() : async () {
      let available = Cycles.available();
      let accepted = Cycles.accept(available);
      assert (accepted == available);
      _cycles_recieved += accepted;
  };


  public shared({caller}) func config_set(conf : Cluster.Config) : async () {
      assert(caller == _installer);
      _conf := conf
  };

  public query func config_get() : async Cluster.Config {
      return _conf;
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

    let balance : Balance = switch(_balance.get(aid)) {
        case (?a) a;
        case (_) 0;
     };
     return {balance; oracle = _oracle}
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


  public shared({caller}) func withdraw(request: Pwr.WithdrawRequest) : async Pwr.WithdrawResponse {
    let aid = Nft.User.toAccountIdentifier(request.from);
    let NFTAnvil_PWR_ICP_subaccount = ?Nft.SubAccount.fromNat(1);
    //let NFTAnvil_PWR_ICP_address = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), NFTAnvil_PWR_ICP_subaccount);

    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    
    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch(_balance.get(aid)) {
          case (?bal) {

            if (bal < (request.amount + _oracle.icpFee)) return #err(#InsufficientBalance);

            let to_aid = Nft.User.toAccountIdentifier(request.to);

            let new_balance = bal - request.amount - _oracle.icpFee;
            if (new_balance > _oracle.icpFee) {
              _balance.put(aid, new_balance);
            } else {
              _balance.delete(aid); // Will free memory of empty accounts
            };

            // IC ledger transfer
            let transfer : Ledger.TransferArgs = {
                  memo = 0;
                  amount = {e8s = request.amount};
                  fee = {e8s = _oracle.icpFee};
                  from_subaccount = NFTAnvil_PWR_ICP_subaccount;
                  to = to_aid;
                  created_at_time = null;
                  };

              switch(await ledger.transfer(transfer)) {
                  case (#Ok(blockIndex)) {
                      // #ok(amount)

                        let transactionId = await Cluster.history(_conf).add(#pwr(#withdraw({created=Time.now(); from=Nft.User.toAccountIdentifier(request.from);to=Nft.User.toAccountIdentifier(request.to); amount=request.amount})));

                        #ok({transactionId});

                  };

                  case (#Err(e)) {
                       // Return balance to user
                       balanceAdd(to_aid, request.amount); // TODO: Check what happens to the fee and return it to user if we aren't charged

                       #err(#Rejected);
                  }
              };

            
          };
          case (_) return #err(#InsufficientBalance);
      };
  };


  public shared({caller}) func nft_mint(slot: Nft.CanisterSlot, request: Nft.MintRequest) : async Nft.MintResponse {
    assert(Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    
    let nft = Cluster.nft(_conf, slot);

    // check caller 
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    let aid = Nft.User.toAccountIdentifier(request.user);

    let opsCost: Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceOps(request.metadata));
    let storageCost: Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceStorage(request.metadata));
    let cost:Nat64 = storageCost + opsCost; // calculate it here

    // take amount out
    switch(balanceRem(aid, cost + _oracle.pwrFee)) {
      case (#ok()) ();
      case (#err(e)) return #err(e)
    };

    switch(await nft.mint(request)) {
      case (#ok(resp)) {

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(aid, cost); // return because of fail

        return #err(e);
      }
    }
    // if fail then return amount
  };

  public shared({caller}) func nft_purchase(slot: Nft.CanisterSlot, request: Nft.PurchaseRequest) : async Nft.PurchaseResponse {
    assert(Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    
    // check caller 
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    
    let nft = Cluster.nft(_conf, slot);
    let aid = Nft.User.toAccountIdentifier(request.user);
    let cost:Nat64 = request.amount;

    // take amount out
    switch(balanceRem(aid, cost + _oracle.pwrFee)) {
      case (#ok()) ();
      case (#err(e)) return #err(e)
    };

   switch(await nft.purchase(request)) {
      case (#ok(resp)) {

        distribute_purchase(resp.purchase);

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(aid, cost); // return because of fail

        return #err(e);
      }
    }
  };
  
  private func distribute_purchase(purchase: Nft.NFTPurchase) : () {
      let total:Nat64 = purchase.amount;

      let anvil_cut:Nat64 = total * Nat64.fromNat(Nft.Share.NFTAnvilShare) / Nat64.fromNat(Nft.Share.Max); // 0.5%
      let author_cut:Nat64= total * Nat64.fromNat(Nft.Share.limit(purchase.author.share, Nft.Share.LimitMinter)) / Nat64.fromNat(Nft.Share.Max);
     
      let marketplace_cut:Nat64 = switch(purchase.marketplace) {
        case (?marketplace) {
          total * Nat64.fromNat(Nft.Share.limit(marketplace.share, Nft.Share.LimitMarketplace)) / Nat64.fromNat(Nft.Share.Max);
        };
        case (null) {
          0;
        }
      };

      let affiliate_cut:Nat64 = switch(purchase.affiliate) {
        case (?affiliate) {
          total * Nat64.fromNat(Nft.Share.limit(affiliate.share, Nft.Share.LimitAffiliate)) / Nat64.fromNat(Nft.Share.Max);
        };
        case (null) {
          0;
        }
      };

      let seller_cut:Nat64 = total - anvil_cut - author_cut - marketplace_cut - affiliate_cut;

      assert(total > 0);
      assert((seller_cut + marketplace_cut + affiliate_cut + author_cut + anvil_cut) == total);

      let NFTAnvil_PWR_earnings_subaccount = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?Nft.SubAccount.fromNat(10) );
      
      // give to NFTAnvil
      balanceAdd(NFTAnvil_PWR_earnings_subaccount, anvil_cut);

      // give to Minter
      balanceAdd(purchase.author.address, author_cut);

      // give to Marketplace
      switch(purchase.marketplace) {
        case (?marketplace) {
          balanceAdd(marketplace.address, marketplace_cut);
        };
        case (null) ();
      };

      // give to Affiliate
      switch(purchase.affiliate) {
        case (?affiliate) {
          balanceAdd(affiliate.address, affiliate_cut);
        };
        case (null) ();
      };

      // give to Seller
      balanceAdd(purchase.seller, seller_cut);
  };

  public shared({caller}) func nft_recharge(slot: Nft.CanisterSlot, request: Nft.RechargeRequest) : async Nft.RechargeResponse {
    assert(Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    
    // check caller 
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    
    let nft = Cluster.nft(_conf, slot);
    let aid = Nft.User.toAccountIdentifier(request.user);
    let cost:Nat64 = request.amount;

    // take amount out
    switch(balanceRem(aid, cost + _oracle.pwrFee)) {
      case (#ok()) ();
      case (#err(e)) return #err(e)
    };

    switch(await nft.recharge(request)) {
      case (#ok(resp)) {

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(aid, cost); // return because of fail

        return #err(e);
      }
    }
  };

  // take ICP out and send them to some address
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

                balanceAdd(toUserAID, amount.e8s); // TODO: This 1000 is here for demo only
                
                let transactionId = await Cluster.history(_conf).add(#pwr(#mint({created=Time.now(); user=Nft.User.toAccountIdentifier(request.user); amount=amount.e8s})));

                #ok({transactionId});
            };
            case (#Err(e)) {
                //TODO: ADD to QUEUE for later transfer attempt
                return #err(#Ledger(e));
            };
        };
        
  };

  private func balanceAdd(aid:AccountIdentifier, amount: Balance) : () {

      if (amount == 0) return ();

      let current:Balance = switch(_balance.get(aid)) {
        case (?bal) bal;
        case (_) 0;
      };

      _balance.put(aid, current + amount);
  };

  private func balanceRem(aid:AccountIdentifier, amount: Balance) : Result.Result<(), {#InsufficientBalance}> {
      
      switch(_balance.get(aid)) {

          case (?bal) {

            if (bal < amount) return #err(#InsufficientBalance);

            let new_balance = bal - amount;
            
            if (new_balance >= _oracle.pwrFee) {

              _balance.put(aid, new_balance);

            } else {
              _balance.delete(aid); // Will free memory of empty accounts
            };

            #ok();

          };
          case (_) return #err(#InsufficientBalance);
      };

  };

  public query func stats () : async (Cluster.StatsResponse and { 
    }) {
        {
            cycles = Cycles.balance();
            cycles_recieved = _cycles_recieved;
            rts_version = Prim.rts_version();
            rts_memory_size = Prim.rts_memory_size();
            rts_heap_size = Prim.rts_heap_size();
            rts_total_allocation = Prim.rts_total_allocation();
            rts_reclaimed = Prim.rts_reclaimed();
            rts_max_live_size = Prim.rts_max_live_size();
        }
    };

}