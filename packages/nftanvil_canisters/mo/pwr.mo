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
import Tr "./type/tokenregistry_interface";
import Anvil "./type/anvil_interface";

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


  // Dex related ---- BEGIN


  public shared({caller}) func dex_create_pool(request: Pwr.CreatePoolRequest, user:Nft.User, subaccount: ?Nft.SubAccount) : async Anvil.CreatePoolResponse {

    let aid = Nft.User.toAccountIdentifier(user);
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, subaccount));
    if (caller_user != user) return #err("Unauthorized");

    let one_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_one);

    let two_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_two);

    let token_one_decimals: Nat8 = switch(one_meta.kind) {
      case (#normal) {
        one_meta.decimals;
      };
      case (#fractionless) {
        0
      }
    };

    let token_two_decimals: Nat8 = switch(two_meta.kind) {
      case (#normal) {
        two_meta.decimals;
      };
      case (#fractionless) {
        0
      }
    };

    let cost:Nat64 = 20 * 100000000;

    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost, _oracle.anvFee, #normal)) {
      case (#ok(deduced)) ();
      case (#err(e)) return #err(debug_show(e));
    };

    switch(await Cluster.anvil(_conf).create_pool({
      token_one = request.token_one;
      token_two = request.token_two;
      token_one_decimals;
      token_two_decimals;
      })) {
        case (#ok()) {
          ignore Cluster.history(_conf).add(#dex(#create_pool({ created = Time.now(); user = Nft.User.toAccountIdentifier(user); cost; token_one = request.token_one; token_two = request.token_two })));
          #ok();
        };
        case (#err(t)) {
          balanceAdd(Pwr.TOKEN_ICP, aid, cost, #normal);
          #err(t);
        };
    };

  };

    public shared({caller}) func dex_add_liquidity(request: Anvil.AddLiquidityRequest, user:Nft.User, subaccount: ?Nft.SubAccount) : async Anvil.AddLiquidityResponse {

    let aid = Nft.User.toAccountIdentifier(user);
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, subaccount));
    if (caller_user != user) return #err("Unauthorized");

    
    let one_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_one);

    let two_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_two);


    switch (balanceRem(request.token_one, aid, request.token_one_amount, one_meta.fee, one_meta.kind)) {
      case (#ok(deduced_one)) {

        switch (balanceRem(request.token_two, aid, request.token_two_amount, two_meta.fee, two_meta.kind)) {
          case (#ok(deduced_two)) {

              switch(await Cluster.anvil(_conf).add_liquidity(request)) {
                  case (#ok(lpt)) {

                    ignore Cluster.history(_conf).add(#dex(#add_liquidity({ created = Time.now(); user = Nft.User.toAccountIdentifier(user); token_one = request.token_one; token_two = request.token_two; token_one_amount = request.token_one_amount; token_two_amount = request.token_two_amount })));

                    #ok(lpt);
                  };
                  case (#err(t)) {
                    balanceAdd(request.token_one, aid, deduced_one, one_meta.kind);
                    balanceAdd(request.token_two, aid, deduced_two, two_meta.kind);
                    #err(t);
                  };
              };

          };
          case (#err(e)) {
            balanceAdd(request.token_one, aid, deduced_one, one_meta.kind);
            return #err(debug_show(e));
          };

        }
      };
      case (#err(e)) return #err(debug_show(e));
    };

  };


    public shared({caller}) func dex_rem_liquidity(request: Anvil.RemLiquidityRequest, user:Nft.User, subaccount: ?Nft.SubAccount) : async Anvil.RemLiquidityResponse {

    let aid = Nft.User.toAccountIdentifier(user);
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, subaccount));
    if (caller_user != user) return #err("Unauthorized");
    
    let one_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_one);

    let two_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_two);

    switch(await Cluster.anvil(_conf).rem_liquidity(request)) {
        case (#ok({one; two})) {

          balanceAddFull(request.token_one, aid, one, one_meta.kind);
          balanceAddFull(request.token_two, aid, two, two_meta.kind);

          ignore Cluster.history(_conf).add(#dex(#rem_liquidity({ created = Time.now(); user = Nft.User.toAccountIdentifier(user); token_one = request.token_one; token_two = request.token_two; token_one_amount = one; token_two_amount = two })));

          #ok({one; two});
        };
        case (#err(t)) {
        
          #err(t);
        };
    };
    
   };

  

    public shared({caller}) func dex_swap(request: Anvil.SwapRequest, user:Nft.User, subaccount: ?Nft.SubAccount) : async Anvil.SwapResponse {

    let aid = Nft.User.toAccountIdentifier(user);
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, subaccount));
    if (caller_user != user) return #err("Unauthorized");

    
    let one_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_one);
    let two_meta = await Cluster.tokenregistry(_conf).token_logistics(request.token_two);

    let {left; right} = switch(request.reverse) {
      case (false) {
        {
          left = {
            id = request.token_one;
            meta = one_meta;
            amount = request.amount;
          };
          right = {
            id = request.token_two;
            meta = two_meta;
            amount = request.amount_required;
          }
        }
      };
      case (true) {
        {
          right = {
            id = request.token_one;
            meta = one_meta;
            amount = request.amount_required;
          };
          left = {
            id = request.token_two;
            meta = two_meta;
            amount = request.amount;
          }
        }
      }
    };

    switch (balanceRem(left.id, aid, left.amount, left.meta.fee, left.meta.kind)) {
      case (#ok(deduced_one)) {

          switch(await Cluster.anvil(_conf).swap(request)) {
              case (#ok({refund; recieve})) {

                ignore Cluster.history(_conf).add(#dex(#swap({ created = Time.now(); user = Nft.User.toAccountIdentifier(user); token_one = request.token_one; token_two = request.token_two; amount=request.amount - refund; amount_recieved = recieve; reverse = request.reverse})));
                balanceAddFull(right.id, aid, recieve, right.meta.kind);
                if (refund > 0) balanceAddFull(left.id, aid, refund, left.meta.kind);

                #ok({refund; recieve});
              };
              case (#err(t)) {
                balanceAdd(left.id, aid, deduced_one, left.meta.kind);
                #err(t);
              };
          };

      };
      case (#err(e)) return #err(debug_show(e));
    };

  };


  // Dex related ---- END

  public shared({caller}) func ft_register(request: Pwr.FtMintRequest) : async Pwr.FtMintResponse {

    let aid = Nft.User.toAccountIdentifier(request.user);

    // check caller
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err("Unauthorized");

    
    let cost:Nat64 = (500 * Nat64.max(request.amount, 5000) * 10000) / 100000000;

    let {symbol; name; desc; decimals; transferable; fee; image; kind; origin; controller} = request.options;
    assert(controller == caller);
    assert(symbol.size() < 20);
    assert(name.size() < 125);
    assert(desc.size() < 255);
    assert(decimals == 8);
    assert(kind == #fractionless);
    assert(fee == 1);
    assert(image.size() <= 131072);
    assert(origin.size() < 255);

    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost, _oracle.anvFee, #normal)) {
      case (#ok(deduced)) ();
      case (#err(e)) return #err(debug_show(e));
    };

    switch(await Cluster.tokenregistry(_conf).register(request.options)) {
        case (#ok(id)) {


          switch(await Cluster.tokenregistry(_conf).mint({id; aid; amount = request.amount; mintable = false})) {
            case (#ok({transactionId})) {
                //balanceAdd(id, aid, request.amount, kind);

                ignore Cluster.history(_conf).add(#ft(#register({ token = id; created = Time.now(); user = aid; cost = cost })));

                #ok({transactionId; id});
            };
            case (#err(t)) {
              balanceAdd(Pwr.TOKEN_ICP, aid, cost, kind);
              return #err(t);
            }
          }

        };
        case (#err(t)) {
          balanceAdd(Pwr.TOKEN_ICP, aid, cost, kind);
          #err(t);
        };
    };

  };

  public shared ({ caller }) func ft_mint({ id : Pwr.FTokenId; aid : AccountIdentifier; amount : Balance; kind: Tr.FTKind }) : async () {
    assert (Cluster.pwr2slot(_conf, aid) == _slot);
    assert (Nft.APrincipal.toSlot(_conf.space, caller) == _conf.tokenregistry);

    balanceAdd(id, aid, amount, kind);
  };

  public shared ({ caller }) func balanceAddExternalProtected(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    kind : Tr.FTKind
  ) : async Result.Result<(), Text> {

    if (_exists(aid) == false) {
      //ignore Cluster.tokenregistry(_conf).track_usage(target, 1);
      // add one account
    };

    assert (Nft.APrincipal.isLegitimate(_conf.space, caller));

    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    balanceAdd(target, aid, amount, kind);

    #ok();
  };

  public shared ({ caller }) func balanceAddExternal(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    kind : Tr.FTKind
  ) : async () {

    assert (Nft.APrincipal.isLegitimate(_conf.space, caller));

    assert (Cluster.pwr2slot(_conf, aid) == _slot);

    balanceAdd(target, aid, amount, kind);
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

    let { transferable; fee; kind } = await Cluster.tokenregistry(_conf).token_logistics(token_id);
    if (transferable == false) return #err(#Rejected);


    if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch (_state.get(aid)) {
      case (?ac) {

        switch (balanceRem(token_id, aid, request.amount, fee, kind)) {
          case (#ok(deduced)) {

            switch (await Cluster.pwrFromAid(_conf, to_aid).balanceAddExternalProtected(token_id, to_aid, request.amount, kind)) {
              case (#ok()) {

              };
              case (#err(t)) {
                balanceAdd(token_id, aid, deduced, kind);
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
              let transactionId = await Cluster.history(_conf).add(#ft(#transfer({ token = token_id; created = Time.now(); from = Nft.User.toAccountIdentifier(request.from); to = Nft.User.toAccountIdentifier(request.to); memo = request.memo; amount = deduced })));
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
    
    let { transferable; fee; kind } = await Cluster.tokenregistry(_conf).token_logistics(request.token);
    var real_fee = fee;
    if (isAnvil) real_fee := 0;

    if (transferable == false) return #err(#Rejected);

    if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

    if (caller_user != request.from) return #err(#Unauthorized(aid));

    switch (_state.get(aid)) {
      case (?ac) {

        // resist small account creation
        if (kind == #normal) switch (Pwr.AccountRecordFindToken(ac, request.token)) {
          case (?tidx) {
            let amount_a = ac[tidx].1 - request.amount - real_fee;
            let amount_b = request.amount;
            if (amount_b != 0 and amount_a != 0) {
              // new account is getting created
              if (amount_a <= real_fee * 100) return #err(#Other("You need to leave at least 100 times the fee, or send everything"));
              if (amount_b <= real_fee * 100) return #err(#Other("You need to send at least 100 times the fee, or send everything"));
            };
          };
          case (null) {
            return #err(#InsufficientBalance);
          };
        };
  
        switch (balanceRem(request.token, aid, request.amount, real_fee, kind)) {
          case (#ok(deduced)) {

            switch (await Cluster.pwrFromAid(_conf, to_aid).balanceAddExternalProtected(request.token, to_aid, deduced, kind)) {
              case (#ok()) {

              };
              case (#err(t)) {
                balanceAdd(request.token, aid, deduced, kind);
                //refund
                return #err(#Other(t));
              };
            };

            _fees_charged += real_fee;
            // TODO separate counters or report back to

            if (isAnvil) {
              //This avoids adding two transactions for one operation like minting
              #ok({ transactionId = Blob.fromArray([]) });
            } else {
              let transactionId = await Cluster.history(_conf).add(#ft(#transfer({ token = request.token; created = Time.now(); from = Nft.User.toAccountIdentifier(request.from); to = Nft.User.toAccountIdentifier(request.to); memo = request.memo; amount = deduced })));
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
                balanceAdd(Pwr.TOKEN_ICP, to_aid, request.amount, #normal);
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
    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost, _oracle.pwrFee, #normal)) {
      case (#ok(deduced))();
      case (#err(e)) return #err(e);
    };

    switch (try { await nft.mint(request) } catch (e) { #err(#Rejected) }) {
      case (#ok(resp)) {

        _mint_accumulated += cost;

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(Pwr.TOKEN_ICP, aid, cost, #normal);
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

    let cost : Nat64 = request.amount + affiliate_amount;
    
    let { transferable; fee; kind } = await Cluster.tokenregistry(_conf).token_logistics(request.payment_token);
    if (transferable == false) return #err(#Rejected);
    if (request.payment_token_kind != kind) return #err(#Rejected);

    // take amount out
    let deduced = switch (balanceRem(request.payment_token, aid, cost, fee, kind)) {
      case (#ok(deduced)) { deduced };
      case (#err(e)) return #err(e);
    };

    _fees_charged += fee;

    switch (try { await nft.purchase(request) } catch (e) { #err(#Rejected) }) {
      case (#ok(resp)) {

        _purchases_accumulated += deduced;

        let purchase = resp.purchase;

        _recharge_accumulated += purchase.recharge;

        // distribute_purchase(resp.purchase);
        switch(kind) {
          case(#normal) {

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
              request.payment_token,
              NFTAnvil_profits,
              anvil_cut,
              #normal
            );

            // give to Author
            _distributed_author += author_cut;
            await Cluster.pwrFromAid(_conf, purchase.author.address).balanceAddExternal(
              request.payment_token,
              purchase.author.address,
              author_cut,
              #normal
            );

            // give to Marketplace
            switch (purchase.marketplace) {
              case (?marketplace) {
                _distributed_marketplace += marketplace_cut;
                await Cluster.pwrFromAid(_conf, marketplace.address).balanceAddExternal(
                  request.payment_token,
                  marketplace.address,
                  marketplace_cut,
                  #normal
                );
                // Debug.print("Marketplace cut " # debug_show (marketplace_cut) # " " # debug_show (marketplace));
              };
              case (null)();
            };

            // give to Affiliate
            switch (purchase.affiliate) {
              case (?affiliate) {
                _distributed_affiliate += affiliate.amount;
                await Cluster.pwrFromAid(_conf, affiliate.address).balanceAddExternal(
                  request.payment_token,
                  affiliate.address,
                  affiliate.amount,
                  #normal
                );
                // Debug.print("Affiliate cut " # debug_show (affiliate.amount) # " " # debug_show (affiliate));
              };
              case (null)();
            };

            // give to Seller
            _distributed_seller += seller_cut;

            await Cluster.pwrFromAid(_conf, purchase.seller).balanceAddExternal(
              request.payment_token,
              purchase.seller,
              seller_cut,
              #normal
            );

          };
          case (#fractionless) {
            // give to Seller
             await Cluster.pwrFromAid(_conf, purchase.seller).balanceAddExternal(
              request.payment_token,
              purchase.seller,
              deduced,
              kind
            );

          };
        };

        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(Pwr.TOKEN_ICP, aid, cost - _oracle.pwrFee, #normal);
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

  public shared ({ caller }) func promote(
    request : Pwr.PromoteRequest,
  ) : async Pwr.PromoteResponse {

    let aid = Nft.User.toAccountIdentifier(request.user);

    // check caller
    let caller_user : Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    if (caller_user != request.user) return #err(#Unauthorized);

    let cost : Nat64 = request.amount;

    let { transferable; fee; kind } = await Cluster.tokenregistry(_conf).token_logistics(request.payment_token);

    switch(kind) {
      case (#normal) {
        if (cost < 50000000) return #err(#InsufficientPayment(50000000));
      };
      case (#fractionless) {
        if (cost < 1) return #err(#InsufficientPayment(1));
      }
    };


    switch (balanceRem(request.payment_token, aid, cost, fee, kind)) {
      case (#ok(deduced))();
      case (#err(e)) return #err(e);
    };

    let transactionId = await Cluster.history(_conf).add(#ft(#promote({ created = Time.now(); payment_token = request.payment_token; user = Nft.User.toAccountIdentifier(request.user); amount = cost; target = request.target; location = request.location })));

    #ok({ transactionId });

  };
 

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
    switch (balanceRem(Pwr.TOKEN_ICP, aid, cost, _oracle.pwrFee, #normal)) {
      case (#ok(deduced))();
      case (#err(e)) return #err(e);
    };

    _fees_charged += _oracle.pwrFee;

    switch (try { await nft.recharge(request) } catch (e) { #err(#Rejected) }) {
      case (#ok(resp)) {

        _recharge_accumulated += cost;
        return #ok(resp);
      };
      case (#err(e)) {
        balanceAdd(Pwr.TOKEN_ICP, aid, cost, #normal);
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

        balanceAdd(Pwr.TOKEN_ICP, toUserAID, amount.e8s, #normal);
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

  private func balanceAddFull(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    kind : Tr.FTKind
  ) : () {
     switch(kind) {
            case (#normal) {
              balanceAdd(target, aid, amount, kind);
            };
            case (#fractionless) {
              balanceAdd(target, aid, amount, kind);
              // balanceAdd(target, aid, Pwr.Fractionless.encode(amount, amount*499), kind);
            };
          };
  };

  private func balanceAdd(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    kind : Tr.FTKind
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
        balanceAdd(target, aid, amount, kind);
      };
    };
  };

  private func balanceRem(
    target : Pwr.FTokenId,
    aid : AccountIdentifier,
    amount : Balance,
    fee : Nat64,
    kind : Tr.FTKind
  ) : Result.Result<Nat64, { #InsufficientBalance }> {

    var deduced = amount;
    switch (_state.get(aid)) {
      case (?ac) {

        switch (Pwr.AccountRecordFindToken(ac, target)) {

          case (?tidx) {

            deduced := switch(kind) {
              case (#normal) {
                if (ac[tidx].1 < (amount + fee)) return #err(#InsufficientBalance);
                
                ac[tidx] := (
                  ac[tidx].0,
                  ac[tidx].1 - (amount + fee),
                );

                amount
              };
              case (#fractionless) {
                if (ac[tidx].1 < (amount)) return #err(#InsufficientBalance);
                
                ac[tidx] := (
                  ac[tidx].0,
                  ac[tidx].1 - (amount),
                );

                amount
                // let {whole; charges} = Pwr.Fractionless.decode(ac[tidx].1);
                // if (charges <= 1) return #err(#InsufficientBalance);
                // if (whole < amount) return #err(#InsufficientBalance);
                // if (whole == amount) {
                //   let all = ac[tidx].1;
                //   ac[tidx] := (
                //     ac[tidx].0,
                //     0,
                //   );

                //   all - fee;
                // } else {
                //   let chargesPerOne = charges / whole;

                //   let amountDeduced = Pwr.Fractionless.encode(amount, chargesPerOne*amount);
                //   let wholeRemaining = whole - amount;
                //   ac[tidx] := (
                //     ac[tidx].0,
                //     Pwr.Fractionless.encode(wholeRemaining, Nat64.min(wholeRemaining*499, charges - chargesPerOne*amount)),
                //   );
                
                //   amountDeduced - fee;
                // }
              };
            };
            
          };
          case (null) {
            return #err(#InsufficientBalance);
          };
        };

        _state.put(aid, Pwr.AccountGarbageCollect(ac));

        #ok(deduced);
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
