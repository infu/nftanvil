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
import TrieRecord "./lib/TrieRecord";
import Debug "mo:base/Debug";


shared({caller = _installer}) actor class Class() : async Pwr.Interface = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
  private stable var _cycles_recieved : Nat = Cycles.balance();
  private stable var _slot : Nft.CanisterSlot = 0;

  private stable var _tmpAccount: [(AccountIdentifier, Pwr.AccountRecordSerialized)] = [];

  private stable var _total_accounts : Nat = 0;

  private var _account: TrieRecord.TrieRecord<AccountIdentifier, Pwr.AccountRecord, Pwr.AccountRecordSerialized> = TrieRecord.TrieRecord<AccountIdentifier, Pwr.AccountRecord, Pwr.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Pwr.AccountRecordSerialize, Pwr.AccountRecordUnserialize);
  
  private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

  type AccountIdentifier = Nft.AccountIdentifier;
  type TokenIdentifier = Nft.TokenIdentifier;
  type TokenIndex = Nft.TokenIndex;
  type Slot = Nft.CanisterSlot;

  type TransactionAmount = Nft.Balance;
  type TransactionFrom = AccountIdentifier;
  type TransactionTo = AccountIdentifier;
  type Balance = Nft.Balance;


  //Handle canister upgrades
  system func preupgrade() {
      _tmpAccount := Iter.toArray(_account.serialize());
  };

  system func postupgrade() {
      _tmpAccount := [];

      _cycles_recieved := Cycles.balance();

  };

  public func wallet_receive() : async () {
      let available = Cycles.available();
      let accepted = Cycles.accept(available);
      assert (accepted == available);
      _cycles_recieved += accepted;
  };

  // public shared({caller}) func anv_transfer(request: Anv.TransferRequest) : async Anv.TransferResponse {
  //     let aid = Nft.User.toAccountIdentifier(request.from);
  //     let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

  //     if (caller_user != request.from) return #err(#Unauthorized(aid));

  //     switch(_account.get(aid)) {
  //           case (?ac) {

  //             if (ac.anv < (request.amount + _oracle.anvFee)) return #err(#InsufficientBalance);

  //             let to_aid = Nft.User.toAccountIdentifier(request.to);

  //             ac.anv := ac.anv - request.amount - _oracle.anvFee;
              
  //             balanceAdd( #anv, to_aid, request.amount);

  //             let transactionId = await Cluster.history(_conf).add(#anv(#transfer({created=Time.now(); from=Nft.User.toAccountIdentifier(request.from); to=Nft.User.toAccountIdentifier(request.to); memo=request.memo; amount=request.amount})));
  //             #ok({transactionId});

  //           };
  //           case (_) return #err(#InsufficientBalance);
  //       };
  //   };


    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        assert(switch(Nft.APrincipal.toSlot(conf.space, Principal.fromActor(this))) {
            case (?slot) {
                _slot := slot;
                true;
            };
            case (null) {
                false; // current principal is not in space, which means configuration is wrong or canister principal is not correct
            }
        });
        _conf := conf
    }; 


    
    public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
    };

    private stable var _recharge_accumulated : Nat64 = 0;
    private stable var _mint_accumulated : Nat64 = 0;
    private stable var _purchases_accumulated : Nat64 = 0;
    private stable var _fees_charged : Nat64 = 0;

    private stable var _icp_deposited : Nat64 = 0;
    private stable var _icp_withdrawn : Nat64 = 0;
    private stable var _distributed_seller : Nat64 = 0;
    private stable var _distributed_affiliate : Nat64 = 0;
    private stable var _distributed_marketplace : Nat64 = 0;
    private stable var _distributed_author : Nat64 = 0;
    private stable var _distributed_anvil : Nat64 = 0;



    public query func balance(request: Pwr.BalanceRequest) : async Pwr.BalanceResponse {
        switch(_account.get(Nft.User.toAccountIdentifier(request.user))) {
            case (?ac) {
                {
                    pwr = ac.pwr;
                    anv = ac.anv;
                    oracle = _oracle;
                }
            };
            case (_) {
              {
                pwr = 0;
                anv = 0;
                oracle = _oracle;
              }
            }
        };
    };

  public shared({caller}) func faucet({aid: AccountIdentifier; amount :Balance}) : async () {
    balanceAdd(#pwr, aid, amount); //TODO: Remove in production
  };

  public shared({caller}) func pwr_transfer(request: Pwr.TransferRequest) : async Pwr.TransferResponse {
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

    switch(_account.get(aid)) {
          case (?ac) {

            if (ac.pwr < (request.amount + _oracle.pwrFee)) return #err(#InsufficientBalance);

            let to_aid = Nft.User.toAccountIdentifier(request.to);

            ac.pwr :=  ac.pwr - request.amount - _oracle.pwrFee;

            _fees_charged += _oracle.pwrFee;
             
            balanceAdd(#pwr, to_aid, request.amount);

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


  public shared({caller}) func pwr_withdraw(request: Pwr.WithdrawRequest) : async Pwr.WithdrawResponse {
    let aid = Nft.User.toAccountIdentifier(request.from);
    let NFTAnvil_PWR_ICP_subaccount = ?Nft.SubAccount.fromNat(1);
    //let NFTAnvil_PWR_ICP_address = Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), NFTAnvil_PWR_ICP_subaccount);

    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    
    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch(_account.get(aid)) {
          case (?ac) {

            if (ac.pwr < (request.amount + _oracle.icpFee)) return #err(#InsufficientBalance);

            let to_aid = Nft.User.toAccountIdentifier(request.to);

            ac.pwr := ac.pwr - request.amount - _oracle.icpFee;

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

                        _icp_withdrawn += request.amount + _oracle.icpFee; 
                        let transactionId = await Cluster.history(_conf).add(#pwr(#withdraw({created=Time.now(); from=Nft.User.toAccountIdentifier(request.from);to=Nft.User.toAccountIdentifier(request.to); amount=request.amount})));

                        #ok({transactionId});

                  };

                  case (#Err(e)) {
                       // Return balance to user
                       balanceAdd(#pwr, to_aid, request.amount); // TODO: Check what happens to the fee and return it to user if we aren't charged

                       #err(#Rejected);
                  }
              };

            
          };
          case (_) return #err(#InsufficientBalance);
      };
  };


  public shared({caller}) func nft_mint(slot: Nft.CanisterSlot, request: Nft.MintRequest) : async Nft.MintResponse {
    assert(Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    let aid = Nft.User.toAccountIdentifier(request.user);

    let nft = Cluster.nft(_conf, slot);

    // check caller 
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);


    let opsCost: Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceOps(request.metadata));
    let storageCost: Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceStorage(request.metadata));
    let cost:Nat64 = storageCost + opsCost + _oracle.pwrFee; // calculate it here

    _fees_charged += _oracle.pwrFee;

    // take amount out
    switch(balanceRem(#pwr, aid, cost )) {
      case (#ok()) ();
      case (#err(e)) return #err(e)
    };

    switch(await nft.mint(request)) {
      case (#ok(resp)) {

        _mint_accumulated += cost;

        balanceAdd(#anv, aid, cost);

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(#pwr, aid, cost); // return because of fail TODO: Do not return pwrFee if error was intentional (if that is possible)

        return #err(e);
      }
    }
    // if fail then return amount
  };

  public shared({caller}) func nft_purchase(slot: Nft.CanisterSlot, request: Nft.PurchaseRequest) : async Nft.PurchaseResponse {
    assert(Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    let aid = Nft.User.toAccountIdentifier(request.user);

    // check caller 
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    
    let nft = Cluster.nft(_conf, slot);

    let affiliate_amount:Nat64 = switch(request.affiliate) {
        case (?affiliate) {
          affiliate.amount;
        };
        case (null) {
          0;
        }
      };

    let cost:Nat64 = request.amount + _oracle.pwrFee + affiliate_amount;

    // take amount out
    switch(balanceRem(#pwr, aid, cost)) {
      case (#ok()) ();
      case (#err(e)) return #err(e)
    };

    _fees_charged += _oracle.pwrFee;

   switch(await nft.purchase(request)) {
      case (#ok(resp)) {

        _purchases_accumulated += cost;
        distribute_purchase(resp.purchase);

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(#pwr, aid, cost - _oracle.pwrFee); // return because of fail. 

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



      let seller_cut:Nat64 = total - anvil_cut - author_cut - marketplace_cut ;

      assert(total > 0);
      assert((seller_cut + marketplace_cut  + author_cut + anvil_cut) == total);

      let NFTAnvil_PWR_earnings_subaccount = Cluster.treasury_address(_conf);
      
      
      // give to NFTAnvil
      _distributed_anvil += anvil_cut;
      balanceAdd(#pwr, NFTAnvil_PWR_earnings_subaccount, anvil_cut);

      // give to Author
      _distributed_author += author_cut;
      balanceAdd(#pwr, purchase.author.address, author_cut);


      // give to Marketplace
      switch(purchase.marketplace) {
        case (?marketplace) {
          _distributed_marketplace += marketplace_cut;
          balanceAdd(#pwr, marketplace.address, marketplace_cut);
          Debug.print("Marketplace cut " # debug_show(marketplace_cut) # " " # debug_show(marketplace));
        };
        case (null) ();
      };

      // give to Affiliate
      switch(purchase.affiliate) {
        case (?affiliate) {
          _distributed_affiliate += affiliate.amount;
          balanceAdd(#pwr, affiliate.address, affiliate.amount);
          Debug.print("Affiliate cut " # debug_show(affiliate.amount) # " " # debug_show(affiliate));
        };
        case (null) ();
      };

      // give to Seller
      _distributed_seller += seller_cut;

      balanceAdd(#pwr, purchase.seller, seller_cut);
  };

  public shared({caller}) func nft_recharge(slot: Nft.CanisterSlot, request: Nft.RechargeRequest) : async Nft.RechargeResponse {
    assert(Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    let aid = Nft.User.toAccountIdentifier(request.user);


    // check caller 
    let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    
    let nft = Cluster.nft(_conf, slot);
    let cost:Nat64 = request.amount;

    // take amount out
    switch(balanceRem(#pwr, aid, cost + _oracle.pwrFee)) {
      case (#ok()) ();
      case (#err(e)) return #err(e)
    };

    _fees_charged += _oracle.pwrFee;

    switch(await nft.recharge(request)) {
      case (#ok(resp)) {

        _recharge_accumulated += cost;
        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(#pwr, aid, cost); // return because of fail

        return #err(e);
      }
    }
  };

  // take ICP out and send them to some address
  public shared({caller}) func pwr_purchase_intent(request: Pwr.PurchaseIntentRequest) : async Pwr.PurchaseIntentResponse {
  
        let toUserAID = Nft.User.toAccountIdentifier(request.user);

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
        assert(caller_user == request.user);

        let (purchaseAccountId,_) = Nft.AccountIdentifier.purchaseAccountId(Principal.fromActor(this), 0, toUserAID);
        
        #ok(purchaseAccountId);
  };

  public shared({caller}) func pwr_purchase_claim(request: Pwr.PurchaseClaimRequest) : async Pwr.PurchaseClaimResponse {
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

                _icp_deposited += amount.e8s;

                balanceAdd(#pwr, toUserAID, amount.e8s); // TODO: This 1000 is here for demo only
                
                let transactionId = await Cluster.history(_conf).add(#pwr(#mint({created=Time.now(); user=Nft.User.toAccountIdentifier(request.user); amount=amount.e8s})));

                #ok({transactionId});
            };
            case (#Err(e)) {
                //TODO: ADD to QUEUE for later transfer attempt
                return #err(#Ledger(e));
            };
        };
        
  };




  private func balanceAdd(target : {#anv; #pwr}, aid:AccountIdentifier, amount: Balance) : () {

      if (amount == 0) return ();

     switch(_account.get(aid)) {
            case (?ac) {
                
                switch(target) {
                  case (#anv) {
                    ac.anv := ac.anv + amount;
                  };
                  case (#pwr) {
                    ac.pwr := ac.pwr + amount;
                  };
                };
                
            };
            case (_) { 
                 _total_accounts += 1;
                 let newobj = Pwr.AccountRecordBlank();
                 _account.put(aid, newobj); 

                 switch(target) {
                  case (#anv) {
                    newobj.anv := newobj.anv + amount;
                  };
                  case (#pwr) {
                    newobj.pwr := newobj.pwr + amount;
                  };
                };

             }
        };
  };

  private func balanceRem(target : {#anv; #pwr}, aid:AccountIdentifier, amount: Balance) : Result.Result<(), {#InsufficientBalance}> {

       switch(_account.get(aid)) {
            case (?ac) {

                if (ac.pwr < amount) return #err(#InsufficientBalance);

                let new_balance = ac.pwr - amount;

                ac.pwr := new_balance;

                #ok();

            };
            case (_) return #err(#InsufficientBalance);
        };
  };

  public query func stats () : async (Cluster.StatsResponse and { 
        recharge_accumulated : Nat64;
        mint_accumulated : Nat64;
        purchases_accumulated : Nat64;
        fees_charged : Nat64;
        icp_deposited : Nat64;
        icp_withdrawn : Nat64;
        distributed_seller : Nat64;
        distributed_affiliate : Nat64;
        distributed_marketplace : Nat64;
        distributed_author : Nat64;
        distributed_anvil : Nat64;
        total_accounts: Nat;
    }) {
        {
            total_accounts = _total_accounts;
            recharge_accumulated = _recharge_accumulated;
            mint_accumulated = _mint_accumulated;
            purchases_accumulated = _purchases_accumulated;
            fees_charged = _fees_charged;
            icp_deposited = _icp_deposited;
            icp_withdrawn = _icp_withdrawn;
            distributed_seller = _distributed_seller;
            distributed_affiliate = _distributed_affiliate;
            distributed_marketplace = _distributed_marketplace;
            distributed_author = _distributed_author;
            distributed_anvil = _distributed_anvil;
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