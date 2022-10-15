import Nft "./type/nft_interface";
import Pwr "./type/pwr_interface";
import Ledger "./type/ledger_interface";

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
import Cluster "./type/Cluster";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim";
import TrieRecord "./lib/TrieRecord";
import Debug "mo:base/Debug";
import HashArray "./lib/HashArray";

shared ({ caller = _installer }) actor class Class() : async Pwr.Interface = this {

  type AccountIdentifier = Nft.AccountIdentifier;
  type TokenIdentifier = Nft.TokenIdentifier;
  type TokenIndex = Nft.TokenIndex;
  type Slot = Nft.CanisterSlot;

  type TransactionAmount = Nft.Balance;
  type TransactionFrom = AccountIdentifier;
  type TransactionTo = AccountIdentifier;
  type Balance = Nft.Balance;

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
  private stable var _cycles_recieved : Nat = Cycles.balance();
  private stable var _slot : Nft.CanisterSlot = 0;

  private stable var _tmpAccount: [(AccountIdentifier, Pwr.Old.AccountRecordSerialized)] = [];

  private stable var _total_accounts : Nat = 0;

  private var _account: TrieRecord.TrieRecord<AccountIdentifier, Pwr.Old.AccountRecord, Pwr.Old.AccountRecordSerialized> = TrieRecord.TrieRecord<AccountIdentifier, Pwr.Old.AccountRecord, Pwr.Old.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Pwr.Old.AccountRecordSerialize, Pwr.Old.AccountRecordUnserialize);

  type AccountRecord = Pwr.AccountRecord;
  private let HAsize = 4000000;
  stable let _stored_1 = HashArray.init<AccountIdentifier, AccountRecord>(HAsize);
  let _state = HashArray.HashArray(
    HAsize,
    _stored_1,
    Nft.AccountIdentifier.hash,
    Nft.AccountIdentifier.equal,
  );

  // upgrade logic
  // for ((k, v) in _account.serialize()) {
  //   let {pwr; anv} = v;
  //   let pwr_id : Pwr.FTokenId = 1;
  //   let anv_id : Pwr.FTokenId = 2;
  //   let acc : Pwr.AccountRecordSerialized = [(pwr_id, pwr), (anv_id, anv)];
  //   _state.put(k, ?Pwr.AccountRecordUnserialize(acc));
  // };

  // delete old
  //_account := TrieRecord.TrieRecord<AccountIdentifier, Pwr.AccountRecord, Pwr.AccountRecordSerialized>( Iter.fromArray<(Pwr.AccountIdentifier, Pwr.AccountRecordSerialized)>([]),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Pwr.AccountRecordSerialize, Pwr.AccountRecordUnserialize);

  private let ledger : Ledger.Interface = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

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

  public shared ({ caller }) func config_set(conf : Cluster.Config) : async () {
    assert (caller == _installer);
    assert (switch (Nft.APrincipal.toSlot(conf.space, Principal.fromActor(this))) { case (?slot) { _slot := slot; true }; case (null) { false } });
    // current principal is not in space, which means configuration is wrong or canister principal is not correct
    _conf := conf;
  };

  public shared ({ caller }) func oracle_set(oracle : Cluster.Oracle) : async () {
    assert (caller == _installer);
    _oracle := oracle;
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

  public query func exists(aid : Nft.AccountIdentifier) : async Bool {
    _exists(aid);
  };

  private func _exists(aid : Nft.AccountIdentifier) : Bool {
    switch (_state.get(aid)) {
      case (?ac) true;
      case (_) false;
    };
  };

  public query func balance(request : Pwr.BalanceRequest) : async Pwr.BalanceResponse {
    let aid = Nft.User.toAccountIdentifier(request.user);
    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    switch (_state.get(aid)) {
      case (?ac) {
        {
          ft = Pwr.AccountRecordSerialize(ac);
          pwr = Pwr.AccountRecordGetTokenBalance(ac, 1);
          anv = Pwr.AccountRecordGetTokenBalance(ac, 2);
          oracle = _oracle;
        };
      };
      case (_) {
        {
          ft = [];
          pwr = 0;
          anv = 0;
          oracle = _oracle;
        };
      };
    };
  };

  public shared ({ caller }) func ft_mint({ id : Pwr.FTokenId; aid : AccountIdentifier; amount : Balance }) : async () {
    assert (Cluster.pwr2slot(_conf, aid) == _slot);
    assert (Nft.APrincipal.toSlot(_conf.space, caller) == _conf.tokenregistry);

    balanceAdd(id, aid, amount);
  };

  public shared ({ caller }) func balanceAddExternalProtected(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    account_creation_allowed : Bool,
  ) : async Result.Result<(), Text> {

    if (_exists(aid) == false) {
      if (account_creation_allowed == false) return #err("Account creation not allowed for this token");
      ignore Cluster.tokenregistry(_conf).track_usage(target, 1);
      // add one account
    };

    assert (Nft.APrincipal.isLegitimate(_conf.space, caller));

    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    balanceAdd(target, aid, amount);

    #ok();
  };

  public shared ({ caller }) func balanceAddExternal(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
  ) : async () {

    assert (Nft.APrincipal.isLegitimate(_conf.space, caller));

    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    balanceAdd(target, aid, amount);
  };

  // deprecated start
  public shared ({ caller }) func pwr_transfer(request : Pwr.TransferOldRequest) : async Pwr.TransferOldResponse {
    let aid = Nft.User.toAccountIdentifier(request.from);
    let to_aid = Nft.User.toAccountIdentifier(request.to);
    let token_id : Nat64 = 1;
    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    let isAnvil = Nft.APrincipal.isLegitimate(_conf.space, caller);
    // Checks if caller is from Anvil principal space
    let caller_user : Nft.User = switch (isAnvil) {
      case (true) {
        #address(Nft.User.toAccountIdentifier(request.from));
      };
      case (false) {
        #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
      };
    };

    let { transferable; fee; account_creation_allowed } = await Cluster.tokenregistry(_conf).token_logistics(token_id);
    if (transferable == false) return #err(#Rejected);

    if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch (_state.get(aid)) {
      case (?ac) {

        switch (balanceRem(token_id, aid, request.amount + fee, fee)) {
          case (#ok()) {

            switch (await Cluster.pwrFromAid(_conf, to_aid).balanceAddExternalProtected(token_id, to_aid, request.amount, account_creation_allowed)) {
              case (#ok()) {

              };
              case (#err(t)) {
                balanceAdd(token_id, aid, request.amount + fee);
                //refund
                return #err(#Other(t));
              };
            };

            _fees_charged += fee;
            // TODO separate counters or report back to

            if (isAnvil) {
              //This avoids adding two transactions for one operation like minting
              #ok({ transactionId = Blob.fromArray([]) });
            } else {
              let transactionId = await Cluster.history(_conf).add(#ft(#transfer({ token = token_id; created = Time.now(); from = Nft.User.toAccountIdentifier(request.from); to = Nft.User.toAccountIdentifier(request.to); memo = request.memo; amount = request.amount })));
              #ok({ transactionId });
            }

          };
          case (#err(e)) return #err(e);
        };

      };
      case (_) return #err(#InsufficientBalance);
    };
  };
  // deprecated end

  public shared ({ caller }) func transfer(request : Pwr.TransferRequest) : async Pwr.TransferResponse {
    let aid = Nft.User.toAccountIdentifier(request.from);
    let to_aid = Nft.User.toAccountIdentifier(request.to);

    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    let isAnvil = Nft.APrincipal.isLegitimate(_conf.space, caller);
    // Checks if caller is from Anvil principal space
    let caller_user : Nft.User = switch (isAnvil) {
      case (true) {
        #address(Nft.User.toAccountIdentifier(request.from));
      };
      case (false) {
        #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
      };
    };

    let { transferable; fee; account_creation_allowed } = await Cluster.tokenregistry(_conf).token_logistics(request.token);
    if (transferable == false) return #err(#Rejected);

    if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch (_state.get(aid)) {
      case (?ac) {

        // check if there is enough
        if (fee != 0) switch (Pwr.AccountRecordFindToken(ac, request.token)) {
          case (?tidx) {
            let amount_a = ac[tidx].1 - request.amount - fee;
            let amount_b = request.amount;
            if (amount_b != 0 and amount_a != 0) {
              // new account is getting created
              if (amount_a <= fee * 100) return #err(#Other("You need to leave at least 100 times the fee, or send everything"));
              if (amount_b <= fee * 100) return #err(#Other("You need to send at least 100 times the fee, or send everything"));
            };
          };
          case (null) {
            return #err(#InsufficientBalance);
          };
        };

        switch (balanceRem(request.token, aid, request.amount + fee, fee)) {
          case (#ok()) {

            switch (await Cluster.pwrFromAid(_conf, to_aid).balanceAddExternalProtected(request.token, to_aid, request.amount, account_creation_allowed)) {
              case (#ok()) {

              };
              case (#err(t)) {
                balanceAdd(request.token, aid, request.amount + fee);
                //refund
                return #err(#Other(t));
              };
            };

            _fees_charged += fee;
            // TODO separate counters or report back to

            if (isAnvil) {
              //This avoids adding two transactions for one operation like minting
              #ok({ transactionId = Blob.fromArray([]) });
            } else {
              let transactionId = await Cluster.history(_conf).add(#ft(#transfer({ token = request.token; created = Time.now(); from = Nft.User.toAccountIdentifier(request.from); to = Nft.User.toAccountIdentifier(request.to); memo = request.memo; amount = request.amount })));
              #ok({ transactionId });
            }

          };
          case (#err(e)) return #err(e);
        };

      };
      case (_) return #err(#InsufficientBalance);
    };
  };

  public shared ({ caller }) func pwr_withdraw(request : Pwr.WithdrawRequest) : async Pwr.WithdrawResponse {
    let aid = Nft.User.toAccountIdentifier(request.from);

    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch (_state.get(aid)) {
      case (?ac) {

        switch (Pwr.AccountRecordFindToken(ac, Pwr.TOKEN_ICP)) {
          case (?tidx) {

            if (ac[tidx].1 < (request.amount + _oracle.icpFee)) return #err(#InsufficientBalance);

            let to_aid = Nft.User.toAccountIdentifier(request.to);

            ac[tidx] := (
              ac[tidx].0,
              ac[tidx].1 - request.amount - _oracle.pwrFee,
            );

            // ac.pwr := ac.pwr - request.amount - _oracle.icpFee;

            switch (try { await Cluster.treasury(_conf).pwr_withdraw(request) } catch (e) { #Err() }) {
              case (#Ok(blockIndex)) {
                try {
                  _icp_withdrawn += request.amount + _oracle.icpFee;

                  let transactionId = await Cluster.history(_conf).add(#pwr(#withdraw({ created = Time.now(); from = Nft.User.toAccountIdentifier(request.from); to = Nft.User.toAccountIdentifier(request.to); amount = request.amount })));

                  #ok({ transactionId });
                } catch (e) {
                  return #err(#Other("Operation executed, but adding transaction to history failed"));
                }

              };

              case (#Err(e)) {
                // Return balance to user
                balanceAdd(Pwr.TOKEN_ICP, to_aid, request.amount);
                #err(#Rejected);
              };
            };

          };

          case (null) {
            return #err(#InsufficientBalance);
          };
        };

      };
      case (_) return #err(#InsufficientBalance);
    };

  };

  public shared ({ caller }) func nft_mint(
    slot : Nft.CanisterSlot,
    request : Nft.MintRequest,
  ) : async Nft.MintResponse {
    assert (Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    let aid = Nft.User.toAccountIdentifier(request.user);

    let nft = Cluster.nft(_conf, slot);

    // check caller
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    let opsCost : Nat64 = Cluster.Oracle.cycle_to_pwr(
      _oracle,
      Nft.MetadataInput.priceOps(request.metadata),
    );
    let storageCost : Nat64 = Cluster.Oracle.cycle_to_pwr(
      _oracle,
      Nft.MetadataInput.priceStorage(request.metadata),
    );
    let cost : Nat64 = storageCost + opsCost;
    // calculate it here

    // _fees_charged += _oracle.pwrFee;

    // take amount out
    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost, _oracle.pwrFee)) {
      case (#ok())();
      case (#err(e)) return #err(e);
    };

    switch (try { await nft.mint(request) } catch (e) { #err(#Rejected) }) {
      case (#ok(resp)) {

        _mint_accumulated += cost;

        balanceAdd(Pwr.TOKEN_ANV, aid, cost);

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(Pwr.TOKEN_ICP, aid, cost);
        // return because of fail TODO: Do not return pwrFee if error was intentional (if that is possible)

        return #err(e);
      };
    };
    // if fail then return amount
  };

  public shared ({ caller }) func nft_purchase(
    slot : Nft.CanisterSlot,
    request : Nft.PurchaseRequest,
  ) : async Nft.PurchaseResponse {
    assert (Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    let aid = Nft.User.toAccountIdentifier(request.user);

    // check caller
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    let nft = Cluster.nft(_conf, slot);

    let affiliate_amount : Nat64 = switch (request.affiliate) {
      case (?affiliate) {
        affiliate.amount;
      };
      case (null) {
        0;
      };
    };

    let cost : Nat64 = request.amount + _oracle.pwrFee + affiliate_amount;

    // take amount out
    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost, _oracle.pwrFee)) {
      case (#ok())();
      case (#err(e)) return #err(e);
    };

    _fees_charged += _oracle.pwrFee;

    switch (try { await nft.purchase(request) } catch (e) { #err(#Rejected) }) {
      case (#ok(resp)) {

        _purchases_accumulated += cost;

        let purchase = resp.purchase;

        _recharge_accumulated += purchase.recharge;

        // distribute_purchase(resp.purchase);

        let total : Nat64 = purchase.amount;

        let anvil_cut : Nat64 = total * Nat64.fromNat(Nft.Share.NFTAnvilShare) / Nat64.fromNat(Nft.Share.Max);
        // 0.5%
        let author_cut : Nat64 = total * Nat64.fromNat(Nft.Share.limit(purchase.author.share, Nft.Share.LimitMinter)) / Nat64.fromNat(Nft.Share.Max);

        let marketplace_cut : Nat64 = switch (purchase.marketplace) {
          case (?marketplace) {
            total * Nat64.fromNat(Nft.Share.limit(marketplace.share, Nft.Share.LimitMarketplace)) / Nat64.fromNat(Nft.Share.Max);
          };
          case (null) {
            0;
          };
        };

        let seller_cut : Nat64 = total - anvil_cut - author_cut - marketplace_cut;

        assert (total > 0);
        assert ((seller_cut + marketplace_cut + author_cut + anvil_cut) == total);

        let NFTAnvil_profits = Cluster.profits_address(_conf);

        // give to NFTAnvil
        _distributed_anvil += anvil_cut;
        await Cluster.pwrFromAid(_conf, NFTAnvil_profits).balanceAddExternal(
          Pwr.TOKEN_ICP,
          NFTAnvil_profits,
          anvil_cut,
        );

        // give to Author
        _distributed_author += author_cut;
        await Cluster.pwrFromAid(_conf, purchase.author.address).balanceAddExternal(
          Pwr.TOKEN_ICP,
          purchase.author.address,
          author_cut,
        );

        // give to Marketplace
        switch (purchase.marketplace) {
          case (?marketplace) {
            _distributed_marketplace += marketplace_cut;
            await Cluster.pwrFromAid(_conf, marketplace.address).balanceAddExternal(
              Pwr.TOKEN_ICP,
              marketplace.address,
              marketplace_cut,
            );
            Debug.print("Marketplace cut " # debug_show (marketplace_cut) # " " # debug_show (marketplace));
          };
          case (null)();
        };

        // give to Affiliate
        switch (purchase.affiliate) {
          case (?affiliate) {
            _distributed_affiliate += affiliate.amount;
            await Cluster.pwrFromAid(_conf, affiliate.address).balanceAddExternal(
              Pwr.TOKEN_ICP,
              affiliate.address,
              affiliate.amount,
            );
            Debug.print("Affiliate cut " # debug_show (affiliate.amount) # " " # debug_show (affiliate));
          };
          case (null)();
        };

        // give to Seller
        _distributed_seller += seller_cut;

        await Cluster.pwrFromAid(_conf, purchase.seller).balanceAddExternal(
          Pwr.TOKEN_ICP,
          purchase.seller,
          seller_cut,
        );

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(Pwr.TOKEN_ICP, aid, cost - _oracle.pwrFee);
        // return because of fail.

        return #err(e);
      };
    };
  };

  //   private func distribute_purchase(purchase: Nft.NFTPurchase) : () {
  //     let total:Nat64 = purchase.amount;

  //     let anvil_cut:Nat64 = total * Nat64.fromNat(Nft.Share.NFTAnvilShare) / Nat64.fromNat(Nft.Share.Max); // 0.5%
  //     let author_cut:Nat64= total * Nat64.fromNat(Nft.Share.limit(purchase.author.share, Nft.Share.LimitMinter)) / Nat64.fromNat(Nft.Share.Max);

  //     let marketplace_cut:Nat64 = switch(purchase.marketplace) {
  //       case (?marketplace) {
  //         total * Nat64.fromNat(Nft.Share.limit(marketplace.share, Nft.Share.LimitMarketplace)) / Nat64.fromNat(Nft.Share.Max);
  //       };
  //       case (null) {
  //         0;
  //       }
  //     };

  //     let seller_cut:Nat64 = total - anvil_cut - author_cut - marketplace_cut ;

  //     assert(total > 0);
  //     assert((seller_cut + marketplace_cut  + author_cut + anvil_cut) == total);

  //     let NFTAnvil_profits = Cluster.profits_address(_conf);

  //     // give to NFTAnvil
  //     _distributed_anvil += anvil_cut;
  //     await Cluster.pwrFromAid(_conf, NFTAnvil_profits).balanceAddExternal(#pwr, NFTAnvil_profits, anvil_cut);

  //     // give to Author
  //     _distributed_author += author_cut;
  //     await Cluster.pwrFromAid(_conf, purchase.author.address).balanceAddExternal(#pwr, purchase.author.address, author_cut);

  //     // give to Marketplace
  //     switch(purchase.marketplace) {
  //       case (?marketplace) {
  //         _distributed_marketplace += marketplace_cut;
  //         await Cluster.pwrFromAid(_conf, marketplace.address).balanceAddExternal(#pwr, marketplace.address, marketplace_cut);
  //         Debug.print("Marketplace cut " # debug_show(marketplace_cut) # " " # debug_show(marketplace));
  //       };
  //       case (null) ();
  //     };

  //     // give to Affiliate
  //     switch(purchase.affiliate) {
  //       case (?affiliate) {
  //         _distributed_affiliate += affiliate.amount;
  //         await Cluster.pwrFromAid(_conf, affiliate.address).balanceAddExternal(#pwr, affiliate.address, affiliate.amount);
  //         Debug.print("Affiliate cut " # debug_show(affiliate.amount) # " " # debug_show(affiliate));
  //       };
  //       case (null) ();
  //     };

  //     // give to Seller
  //     _distributed_seller += seller_cut;

  //     await Cluster.pwrFromAid(_conf, purchase.seller).balanceAddExternal(#pwr, purchase.seller, seller_cut);
  // };

  public shared ({ caller }) func nft_recharge(
    slot : Nft.CanisterSlot,
    request : Nft.RechargeRequest,
  ) : async Nft.RechargeResponse {
    assert (Nft.APrincipal.isLegitimateSlot(_conf.space, slot));
    let aid = Nft.User.toAccountIdentifier(request.user);

    // check caller
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    let nft = Cluster.nft(_conf, slot);
    let cost : Nat64 = request.amount;

    // take amount out
    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost + _oracle.pwrFee, _oracle.pwrFee)) {
      case (#ok())();
      case (#err(e)) return #err(e);
    };

    _fees_charged += _oracle.pwrFee;

    switch (try { await nft.recharge(request) } catch (e) { #err(#Rejected) }) {
      case (#ok(resp)) {

        _recharge_accumulated += cost;
        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(Pwr.TOKEN_ICP, aid, cost);
        // return because of fail

        return #err(e);
      };
    };
  };

  // take ICP out and send them to some address
  public shared ({ caller }) func pwr_purchase_intent(request : Pwr.PurchaseIntentRequest) : async Pwr.PurchaseIntentResponse {

    let toUserAID = Nft.User.toAccountIdentifier(request.user);

    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    assert (caller_user == request.user);

    let (purchaseAccountId, _) = Nft.AccountIdentifier.purchaseAccountId(
      Principal.fromActor(this),
      0,
      toUserAID,
    );

    #ok(purchaseAccountId);
  };

  public shared ({ caller }) func pwr_purchase_claim(request : Pwr.PurchaseClaimRequest) : async Pwr.PurchaseClaimResponse {
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    assert (caller_user == request.user);

    let toUserAID = Nft.User.toAccountIdentifier(request.user);

    assert (Cluster.pwr2slot(_conf, toUserAID) == _slot);

    let (purchaseAccountId, purchaseSubAccount) = Nft.AccountIdentifier.purchaseAccountId(
      Principal.fromActor(this),
      0,
      toUserAID,
    );

    let { e8s = payment } = await ledger.account_balance({ account = purchaseAccountId });

    if (payment <= _oracle.icpFee) return #err(#PaymentTooSmall);

    let amount = { e8s = payment - _oracle.icpFee };

    let transfer : Ledger.TransferArgs = {
      memo = 0;
      amount;
      fee = { e8s = _oracle.icpFee };
      from_subaccount = ?purchaseSubAccount;
      to = Cluster.treasury_address(_conf);
      created_at_time = null;
    };

    switch (await ledger.transfer(transfer)) {
      case (#Ok(blockIndex)) {

        _icp_deposited += amount.e8s;

        balanceAdd(Pwr.TOKEN_ICP, toUserAID, amount.e8s);
        // TODO: This 1000 is here for demo only

        let transactionId = await Cluster.history(_conf).add(#pwr(#mint({ created = Time.now(); user = Nft.User.toAccountIdentifier(request.user); amount = amount.e8s })));

        #ok({ transactionId });
      };
      case (#Err(e)) {
        //TODO: ADD to QUEUE for later transfer attempt
        return #err(#Ledger(e));
      };
    };

  };

  private func balanceAdd(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
  ) : () {

    if (amount == 0) return ();

    switch (_state.get(aid)) {
      case (?ac) {

        switch (Pwr.AccountRecordFindToken(ac, target)) {
          case (?tidx) {

            ac[tidx] := (
              ac[tidx].0,
              ac[tidx].1 + amount,
            );

            ();
          };
          case (null) {

            _state.put(
              aid,
              ?Array.thaw(Array.append(Array.freeze(ac), [(target, amount)])),
            );

          };
        };

      };
      case (_) {
        _total_accounts += 1;
        let newobj = Pwr.AccountRecordBlank();
        _state.put(aid, ?newobj);
        balanceAdd(target, aid, amount);
      };
    };
  };

  private func balanceRem(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    fee : Nat64,
  ) : Result.Result<(), { #InsufficientBalance }> {

    switch (_state.get(aid)) {
      case (?ac) {

        switch (Pwr.AccountRecordFindToken(ac, target)) {

          case (?tidx) {

            if (ac[tidx].1 < amount) return #err(#InsufficientBalance);

            ac[tidx] := (
              ac[tidx].0,
              ac[tidx].1 - amount,
            );

          };
          case (null) {
            return #err(#InsufficientBalance);
          };
        };

        _state.put(aid, Pwr.AccountGarbageCollect(ac));

        #ok();
        // TODO: get this back
        // if ((ac.anv == 0< _oracle.anvFee) and (ac.pwr < _oracle.pwrFee)) {
        //   _account.delete(aid);
        // };

        //

      };
      case (_) return #err(#InsufficientBalance);
    };
  };

  public query func stats() : async (Cluster.StatsResponse and { recharge_accumulated : Nat64; mint_accumulated : Nat64; purchases_accumulated : Nat64; fees_charged : Nat64; icp_deposited : Nat64; icp_withdrawn : Nat64; distributed_seller : Nat64; distributed_affiliate : Nat64; distributed_marketplace : Nat64; distributed_author : Nat64; distributed_anvil : Nat64; total_accounts : Nat }) {
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
    };
  };

};
