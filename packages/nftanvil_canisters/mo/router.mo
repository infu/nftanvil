import Debug "mo:base/Debug";

import Array  "mo:base/Array";
import Array_ "./lib/Array";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Error "mo:base/Error";

import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";

import HashMap "mo:base/HashMap";
import Cluster  "./type/Cluster";
import Nft "./type/nft_interface";

import AAA "./type/aaa_interface";

shared({caller = _installer}) actor class Router() = this {

    let IC = actor "aaaaa-aa" : AAA.Interface;
    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();


    private stable var _wasm_nft : [Nat8] = [];
    private stable var _wasm_account : [Nat8] = [];
    private stable var _wasm_pwr : [Nat8] = [];
    private stable var _wasm_history : [Nat8] = [];
    private stable var _wasm_anv : [Nat8] = [];

    private stable var _job_processing : Bool = false;

    private stable var _jobs : List.List<Job> = List.nil<Job>();

    public type Job = {
            #install_code : Job_Install_Code;
            #oracle_set : Job_Oracle_Set;
            #config_set : Job_Config_Set;

    };

    public type Job_Install_Code = {
        slot : Nft.CanisterSlot;
        wasm : {#nft; #account; #pwr; #history; #anv};
        mode : {#reinstall; #upgrade; #install};
    };

    public type Job_Oracle_Set = {
        slot : Nft.CanisterSlot;
        oracle : Cluster.Oracle;
    };

    public type Job_Config_Set = {
        slot : Nft.CanisterSlot;
        config : Cluster.Config;
    };

    public shared({caller}) func reportOutOfMemory() : async () {
        //TODO
    };

    public shared({caller}) func wasm_set({name: Text; wasm:[Nat8]}) : async () {
        assert(caller == _installer);
        switch(name) {
            case ("nft") _wasm_nft := wasm;
            case ("account") _wasm_account := wasm;
            case ("pwr") _wasm_pwr := wasm;
            case ("history") _wasm_history := wasm;
            case ("anv") _wasm_anv := wasm;
            case (_) { assert(false); (); }
        }
    };

    system func heartbeat() : async () {
       
        if (_job_processing) return ();

        if (List.size(_jobs) > 0) {

            let (jobMaybe, newList) = List.pop(_jobs);
            switch(jobMaybe) {
                case (?job) {
                    _jobs := newList;
                    _job_processing := true;

                    Debug.print("job" #debug_show(job));
                    try await job_run(job) catch (e) { Debug.print("job error " #debug_show(Error.message(e)));  };
                    _job_processing := false;
                };
                case (null) {
                    ()
                }
            }
           
        };

    };

    public shared({caller}) func reinstall() : async () {
     
        // create all nft canisters
        ignore Array_.amap<()>(Nat64.toNat(_conf.nft.1 - _conf.nft.0), func (index: Nat) : () { 
            let slot = _conf.nft.0 + Nat64.fromNat(index);

            job_add(#install_code({
                slot;
                wasm = #nft;
                mode = #reinstall;
                }));
            
            job_add(#oracle_set({slot; oracle = _oracle}));
            job_add(#config_set({slot; config = _conf}));
        });

        

        // create pwr canister
        job_add(#install_code({
            slot = _conf.pwr;
            wasm = #pwr;
            mode = #reinstall;
        }));


        job_add(#oracle_set({slot = _conf.pwr; oracle = _oracle}));
        job_add(#config_set({slot = _conf.pwr; config = _conf}));



        // create anv canister
        job_add(#install_code({
            slot = _conf.anv;
            wasm = #anv;
            mode = #reinstall;
        }));

        job_add(#oracle_set({slot = _conf.anv; oracle = _oracle}));
        job_add(#config_set({slot = _conf.anv; config = _conf}));


        // create history canister
        job_add(#install_code({
            slot = _conf.history;
            wasm = #history;
            mode = #reinstall;
        }));

        job_add(#oracle_set({slot = _conf.history; oracle = _oracle}));
        job_add(#config_set({slot = _conf.history; config = _conf}));

        // create account canisters
        ignore Array_.amap<()>(Nat64.toNat(_conf.account.1 - _conf.account.0), func (index: Nat) : () {
            let slot = _conf.account.0 + Nat64.fromNat(index);
            job_add(#install_code({
                slot;
                wasm = #account;
                mode = #reinstall;
                }));

            job_add(#oracle_set({slot; oracle = _oracle}));
            job_add(#config_set({slot; config = _conf}));
        });

    };

    private func job_add(j: Job) : () {
        _jobs := List.append(_jobs, List.fromArray<Job>([j]));
    };
 
    private func job_run(j: Job) : async () {
        switch(j) {
            case (#install_code(x)) await job_install_code(x);
            case (#oracle_set(x)) await job_oracle_set(x);
            case (#config_set(x)) await job_conf_set(x);

        };
    };



    private func job_oracle_set({slot; oracle}: Job_Oracle_Set) : async () {
        Debug.print("job_oracle_set " # debug_show({slot; oracle}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;

        let re = await can.oracle_set(oracle);

        Debug.print("job_oracle_set result" #debug_show(re));

    };    


    private func job_conf_set({slot; config}: Job_Config_Set) : async () {
        Debug.print("job_conf_set " # debug_show({slot; config}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;

        let re = await can.config_set(config);

        Debug.print("job_conf_set result" #debug_show(re));

    };    

    private func job_install_code({slot; wasm; mode}: Job_Install_Code) : async () {
        Debug.print("job_install_code " # debug_show({slot; wasm; mode}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let re = await IC.install_code({
              arg = [];
              wasm_module = switch(wasm) {
                  case (#nft) _wasm_nft;
                  case (#account) _wasm_account;
                  case (#pwr) _wasm_pwr;
                  case (#history) _wasm_history;
                  case (#anv) _wasm_anv;
              };
              mode;
              canister_id = canister_id;
            });

        Debug.print("job_install_code result" #debug_show(re));
    };


    // This func is only for local development
    public shared ({caller}) func create_local_canisters() : async () {
            assert(caller == _installer);
            Cycles.add(200_000_000_000);

            var cnt = 0;
            let max = 20;
            var start : ?Nat64 = null;
            var end : ?Nat64 = null;

            while (cnt < max) {
                let {canister_id} = await IC.create_canister({settings = ?{
                    controllers = ?[_installer, Principal.fromActor(this)];
                    compute_allocation = null;
                    memory_allocation = null; 
                    freezing_threshold = ?31_540_000
                }});
                if (cnt == 0) start := Nft.APrincipal.toIdx(canister_id);
                if (cnt == max - 1) end := Nft.APrincipal.toIdx(canister_id);
                cnt += 1;
            };

            switch(start) {
                case (?range_start) {


                    switch(end) {
                        case (?range_end) {

                            _conf := {
                                    nft = (0,5);
                                    nft_avail = [0,1,2];
                                    account = (11,12);
                                    router = 14;
                                    pwr = 15;
                                    anv = 16;
                                    treasury = 17;
                                    history = 6;
                                    space = [[range_start, range_end]]
                                };

                            };
                            case (null) {
                                assert(false);
                            };
                        };
                

                };
                case (null) {
                    assert(false);
                };
            };


            ();

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