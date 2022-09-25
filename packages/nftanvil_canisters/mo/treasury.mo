import Nft "./type/nft_interface";
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
import Debug "mo:base/Debug";
import Treasury "./type/treasury_interface";


shared({caller = _installer}) actor class Class() : async Treasury.Interface = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
  private stable var _cycles_recieved : Nat = Cycles.balance();
  private stable var _slot : Nft.CanisterSlot = 0;

  private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

  public shared({caller}) func pwr_withdraw(request: Treasury.WithdrawRequest) : async Treasury.WithdrawIntermediateResponse {

    assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

    let aid = Nft.User.toAccountIdentifier(request.from);

    assert(Cluster.pwr2slot(_conf, aid) == Nft.APrincipal.toSlot(_conf.space, caller));

    let to_aid = Nft.User.toAccountIdentifier(request.to);


    let transfer : Ledger.TransferArgs = {
        memo = 0;
        amount = {e8s = request.amount};
        fee = {e8s = _oracle.icpFee};
        from_subaccount = null;
        to = to_aid;
        created_at_time = null;
        };

    return await ledger.transfer(transfer);

    };


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

    public query func stats () : async (Cluster.StatsResponse and {}) {
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