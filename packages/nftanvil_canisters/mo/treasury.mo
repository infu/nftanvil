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
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 


shared({caller = _installer}) actor class Class() = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();


    private stable var _cycles_recieved : Nat = Cycles.balance();


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

    public query func stats() : async Cluster.StatsResponse {
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