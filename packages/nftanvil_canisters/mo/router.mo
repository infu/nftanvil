import Array  "mo:base/Array";
import Array_ "./lib/Array";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import HashMap "mo:base/HashMap";
import Cluster  "./type/Cluster";
import Nft "./type/nft_interface";

//import AAA "./type/aaa_interface";

shared({caller = _installer}) actor class Router() = this {

//    let IC = actor "aaaaa-aa" : AAA.Interface;
    private stable var _conf : Cluster.Config = Cluster.Config.default();

    public shared({caller}) func reportOutOfMemory() : async () {
        //TODO
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };

    public query func config_get() : async Cluster.Config {
        return _conf;
    };

    public type StatsResponse = {
        cycles: Nat;
        rts_version:Text;
        rts_memory_size:Nat;
        rts_heap_size:Nat;
        rts_total_allocation:Nat;
        rts_reclaimed:Nat;
        rts_max_live_size:Nat;
    };


    public query func stats() : async StatsResponse {
        {
            cycles = Cycles.balance();
            rts_version = Prim.rts_version();
            rts_memory_size = Prim.rts_memory_size();
            rts_heap_size = Prim.rts_heap_size();
            rts_total_allocation = Prim.rts_total_allocation();
            rts_reclaimed = Prim.rts_reclaimed();
            rts_max_live_size = Prim.rts_max_live_size();
        }
    };


}