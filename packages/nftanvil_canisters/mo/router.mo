import Array  "mo:base/Array";
import Array_ "./lib/Array";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import HashMap "mo:base/HashMap";
import Cluster  "./type/Cluster";

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

    public query func getAvailable() : async [Text] {
          Iter.toArray(Iter.map(Iter.fromArray(_conf.nft_avail), func(x:Principal) : Text { Principal.toText(x); }));
    };

    public query func fetchNFTCanisters() : async [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_conf.nft), func(x:Principal) : Text { Principal.toText(x); }));
    };

    private func getAccountCanisters() : [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_conf.account), func(x:Principal) : Text { Principal.toText(x); }));
    };

    public query func fetchNFTCan(slot: Nat) : async Text {
        Principal.toText(_conf.nft[slot]);
    };

    public query func isLegitimate(can: Principal) : async Bool {
       Array_.exists(_conf.nft, can, Principal.equal)
    };

    public query func fetchSetup() : async {acclist: [Text];anv:Text;pwr:Text;history:Text;treasury:Text} {
         {
         acclist = getAccountCanisters();
         anv = Principal.toText(_conf.anv);
         pwr = Principal.toText(_conf.pwr);
         history = Principal.toText(_conf.history);
         treasury = Principal.toText(_conf.treasury);
         }
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