// Anvil NFT collection
import Anvil "./type/anvil_interface";
import Nft "./type/nft_interface";
import Cluster  "./type/Cluster";
import Pwr "./type/pwr_interface";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Int64 "mo:base/Int64";
import Nat8 "mo:base/Nat8";
import Float "mo:base/Float";
import Debug "mo:base/Debug";

import Cycles "mo:base/ExperimentalCycles";

import Map "./lib/zh/Map";


shared({caller = _installer}) actor class Class() : async Anvil.Interface = this {

    let { bhash } = Map; // different hash types

    let { lphash } = Anvil;

    let SWAP_FEE: Float =  0.01;

    type TokenIdentifier = Nft.TokenIdentifier;
    type LPKey = Anvil.LPKey;
    type FTokenId = Nft.FTokenId;

    public type LPStored = {
      var reserve_one : Nat64;
      token_one_decimals : Nat;
      var reserve_two : Nat64;
      token_two_decimals : Nat;
      var total : Float;
      providers : Map.Map<Nft.AccountIdentifier, Float>
    };

    let pools = Map.new<LPKey, LPStored>();

    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();


    public shared({caller}) func create_pool(request : Anvil.CreatePoolRequest) : async Anvil.CreatePoolResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));
        // check if it exists
        switch(Map.get(pools, lphash, (request.token_one, request.token_two))) {
            case (null)();
            case (?val) return #err("Already exists")
        };
        // check if reverse exists
        switch(Map.get(pools, lphash, (request.token_two, request.token_one))) {
            case (null)();
            case (?val) return #err("Already exists")
        };

        if (request.token_one_decimals == 0 and request.token_two_decimals == 0) return #err("Can't make a pool between two fractionless tokens");
        
        let lp : LPStored = {
            var reserve_one = 0;
            var reserve_two = 0;
            var total = 0;
            token_one_decimals = Nat8.toNat(request.token_one_decimals);
            token_two_decimals = Nat8.toNat(request.token_two_decimals);
            providers = Map.new<Nft.AccountIdentifier, Float>();
        };

        let lpkey = (request.token_one, request.token_two);

        Map.set(pools, lphash, lpkey, lp); 
        #ok();
    };


    public shared({caller}) func add_liquidity(request : Anvil.AddLiquidityRequest) : async Anvil.AddLiquidityResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        switch(Map.get(pools, lphash, (request.token_one, request.token_two))) {
            case (null) return #err("Doesn't exist");
            case (?lp) {

                let balance : Float = switch(Map.get(lp.providers, bhash, request.aid)) {
                    case (null) 0;
                    case (?bal) bal;
                };

                let f_one = Anvil.Nat64ToFloatDecimals( request.token_one_amount, lp.token_one_decimals);
                let f_two = Anvil.Nat64ToFloatDecimals( request.token_two_amount, lp.token_two_decimals);

                let minted_liquidity = Float.sqrt(f_one * f_two);
                lp.reserve_one += request.token_one_amount;
                lp.reserve_two += request.token_two_amount;
                lp.total += minted_liquidity;

                let fee_coef = Float.sqrt( Anvil.Nat64ToFloatDecimals( lp.reserve_one, lp.token_one_decimals ) * Anvil.Nat64ToFloatDecimals( lp.reserve_two, lp.token_two_decimals )) / lp.total;

                let new_balance = balance + minted_liquidity / fee_coef;

                // Debug.print("minted_liquidity " # debug_show(minted_liquidity));
                // Debug.print("fee_coef " # debug_show(fee_coef));
                // Debug.print("balance " # debug_show(balance));
                // Debug.print("f_one " # debug_show(f_one));
                // Debug.print("f_two " # debug_show(f_two));

                Map.set(lp.providers, bhash, request.aid, new_balance);

                #ok(new_balance);
            }
        };
    };

    public shared({caller}) func rem_liquidity(request: Anvil.RemLiquidityRequest) : async Anvil.RemLiquidityResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        switch(Map.get(pools, lphash, (request.token_one, request.token_two))) {
          case (null) return #err("Doesn't exist");
          case (?lp) {

            let my_liquidity : Float = switch(Map.get(lp.providers, bhash, request.aid)) {
                    case (null) return #err("You haven't added liquidity");
                    case (?bal) bal;
                };

            let share = my_liquidity / lp.total;
            var share_token_one = Anvil.FloatToNat64Decimals( Anvil.Nat64ToFloatDecimals(lp.reserve_one, lp.token_one_decimals) * share, lp.token_one_decimals);
            var share_token_two = Anvil.FloatToNat64Decimals( Anvil.Nat64ToFloatDecimals(lp.reserve_two, lp.token_two_decimals) * share, lp.token_two_decimals);

            if (share_token_one > lp.reserve_one) share_token_one := lp.reserve_one;
            if (share_token_two > lp.reserve_two) share_token_two := lp.reserve_two;

            lp.reserve_one := lp.reserve_one - share_token_one;
            lp.reserve_two := lp.reserve_two - share_token_two;

            lp.total -= my_liquidity;

            ignore Map.remove(lp.providers, bhash, request.aid);

            #ok({one = share_token_one; two = share_token_two});

          };
        };

    };

    public shared({caller}) func swap(request: Anvil.SwapRequest) : async Anvil.SwapResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        switch(Map.get(pools, lphash, (request.token_one, request.token_two))) {
            case (null) return #err("Doesn't exist");
            case (?lp) {

                switch(request.reverse) {
                    case (false) {
                        let rate_fwd: Float = Anvil.Nat64ToFloat(lp.reserve_one + request.amount) / Anvil.Nat64ToFloat(lp.reserve_two);
                        let rate_backward: Float = Anvil.Nat64ToFloat(lp.reserve_one ) / Anvil.Nat64ToFloat(lp.reserve_two - request.amount_required);

                        let amount_fwd = Anvil.Nat64ToFloat( request.amount );
                        let fee_fwd = amount_fwd * SWAP_FEE;
                        let afterfee_fwd = amount_fwd - fee_fwd;

                        let give_bwd = Anvil.FloatToNat64(Anvil.Nat64ToFloat(request.amount_required) * rate_backward);
                        if (give_bwd > request.amount) return #err("Your requirements aren't satisfied during backward swap");

                        let recieve_fwd = Anvil.FloatToNat64(afterfee_fwd / rate_fwd);

                        if (lp.reserve_two <= recieve_fwd + 1) return #err("Supply not enough");
                        if (recieve_fwd < request.amount_required) return #err("Your requirements aren't satisfied during forward swap");

                        if (request.amount_required == recieve_fwd) {
                            // check if we can pay less and get the same
                            if (give_bwd < request.amount) {
                                // yes we can
                                 lp.reserve_one += give_bwd;
                                 lp.reserve_two -= request.amount_required;
                                 let refund = request.amount - give_bwd;
                                 assert(refund >= 0);
                                 return #ok({refund; recieve = request.amount_required})
                            };
                        };

                        lp.reserve_one += request.amount;
                        lp.reserve_two -= recieve_fwd;

                        return #ok({refund=0; recieve = recieve_fwd});
                    };
                    case (true) {
                        let rate_fwd: Float = Anvil.Nat64ToFloat(lp.reserve_two + request.amount) / Anvil.Nat64ToFloat(lp.reserve_one);
                        let rate_backward: Float = Anvil.Nat64ToFloat(lp.reserve_two ) / Anvil.Nat64ToFloat(lp.reserve_one - request.amount_required);

                        let amount_fwd = Anvil.Nat64ToFloat( request.amount );
                        let fee_fwd = amount_fwd * SWAP_FEE;
                        let afterfee_fwd = amount_fwd - fee_fwd;

                        let give_bwd = Anvil.FloatToNat64(Anvil.Nat64ToFloat(request.amount_required) * rate_backward);
                        if (give_bwd > request.amount) return #err("Your requirements aren't satisfied during backward swap");

                        let recieve_fwd = Anvil.FloatToNat64(afterfee_fwd / rate_fwd);

                        if (lp.reserve_one <= recieve_fwd + 1) return #err("Supply not enough");
                        if (recieve_fwd < request.amount_required) return #err("Your requirements aren't satisfied during forward swap");

                        if (request.amount_required == recieve_fwd) {
                            // check if we can pay less and get the same
                            if (give_bwd < request.amount) {
                                // yes we can
                                 lp.reserve_two += give_bwd;
                                 lp.reserve_one -= request.amount_required;
                                 let refund = request.amount - give_bwd;
                                 assert(refund >= 0);
                                 return #ok({refund; recieve = request.amount_required})
                            };
                        };

                        lp.reserve_two += request.amount;
                        lp.reserve_one -= recieve_fwd;

                        return #ok({refund=0; recieve = recieve_fwd});
                    } ;
                };
                
            };
        };
    
    };

    public query func balance_liquidity(request: Anvil.BalanceLiquidityRequest) : async Anvil.BalanceLiquidityResponse {
        
         switch(Map.get(pools, lphash, (request.token_one, request.token_two))) {
          case (null) return #err("Doesn't exist");
          case (?lp) {

            let liquidity : Float = switch(Map.get(lp.providers, bhash, request.aid)) {
                    case (null) return #err("You haven't added liquidity");
                    case (?bal) bal;
                };

            #ok(liquidity);
          };
         }
    };

    public query func get_pools(request: Anvil.PoolsRequest) : async Anvil.PoolsResponse {
         Iter.toArray(Iter.map<(LPKey, LPStored), Anvil.PoolPublic>(Map.entries(pools), func(id, v)  { 

            let balance : Float = switch(Map.get(v.providers, bhash, request.aid)) {
                case (null) 0;
                case (?x) x;
            };

            {
                balance;
                id;
                reserve_one = v.reserve_one;
                token_one_decimals = Nat8.fromNat(v.token_one_decimals);
                reserve_two  = v.reserve_two;
                token_two_decimals = Nat8.fromNat(v.token_two_decimals);
                total = v.total;
            }
        }));
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };

    public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
    };

    public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
    };

}

