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
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Int "mo:base/Int";

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
    private stable var _cycles_recieved : Nat = Cycles.balance();

    public type CanisterSlot = Nft.CanisterSlot;

    private var _wasm_nft : [Nat8] = [];
    private var _wasm_account : [Nat8] = [];
    private var _wasm_pwr : [Nat8] = [];
    private var _wasm_history : [Nat8] = [];
    private var _wasm_anvil : [Nat8] = [];
    private var _wasm_treasury : [Nat8] = [];
    private var _wasm_tokenregistry : [Nat8] = [];

    private var _job_processing : Bool = false;
 
    private var _jobs : List.List<Job> = List.nil<Job>();
    //private stable var _purchases : List.List<Nft.NFTPurchase> = List.nil<Nft.NFTPurchase>();

    private var _refuel : Nat = 0;
    private var _next_refuel : Time.Time = Time.now() + Cluster.TIME_BETWEEN_REFUELS; 
    private var _jobs_success : Nat = 0;
    private var _jobs_fail : Nat = 0;

    private var _log : List.List<Cluster.LogEvent> = List.nil<Cluster.LogEvent>(); 
    private var _log_size : Nat = 0;

    private var _maintenance : Bool = true;

    public type Job = {
        #install_code : Job_Install_Code;
        #canister_start : Job_Canister_Start;
        #canister_stop : Job_Canister_Stop;
        #oracle_set : Job_Oracle_Set;
        #config_set : Job_Config_Set;
        #refuel : Job_Refuel;
        #callback : Job_Callback;
    };

     public type Job_Install_Code = {
        slot : CanisterSlot;
        wasm : {#nft; #account; #pwr; #history; #anvil; #treasury; #tokenregistry};
        mode : {#reinstall; #upgrade; #install};
    };

    public type Job_Oracle_Set = {
        slot : CanisterSlot;
        oracle : Cluster.Oracle;
    };

    public type Job_Config_Set = {
        slot : CanisterSlot;
        config : Cluster.Config;
    };

    public type Job_Refuel = {
        slot : CanisterSlot;
    };

    public type Job_Canister_Start = {
        slot : CanisterSlot;
    };

    public type Job_Canister_Stop = {
        slot : CanisterSlot;
    };

    public type Job_Callback =  {
        callback : () -> async ();
        msg : Text
    };


    system func heartbeat() : async () {

        if (_job_processing) return ();

        if (Time.now() > _next_refuel) {
            _next_refuel := Time.now() + Cluster.TIME_BETWEEN_REFUELS; // 4 hours
            refuel_all();
        };

        if (List.size(_jobs) > 0) {

            let (jobMaybe, newList) = List.pop(_jobs);
            switch(jobMaybe) {
                case (?job) {
                    _jobs := newList;
                    _job_processing := true;

                    try {
                        await job_run(job);
                        _jobs_success += 1;
                    } catch (e) { 
                        log("job error " #debug_show(Error.message(e)));
                        _jobs_fail += 1;
                    };
                    
                    _job_processing := false;
                };
                case (null) {
                    ()
                }
            }
           
        };

    };

    public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
        _cycles_recieved += accepted;
    };


    public shared({caller}) func refuel_unoptimised() : async () {
        assert(caller == _installer);

        ignore Array_.amap<()>(Nat64.toNat(_conf.space[0][1] - _conf.space[0][0]), func (index: Nat) : () {
                let slot = Nat64.fromNat(index);
                job_add(#refuel({slot;}));
        })
    };


    public shared({caller}) func refuel() : async () {
        assert(caller == _installer);

        refuel_all();
    };

    private func refuel_all() : () {
        ignore Cluster.Slots.installed_all(_conf, func (slot: CanisterSlot) {
            job_add(#refuel({slot}));   
        });
    };

    public shared({caller}) func reinstall() : async () {
        assert(caller == _installer);

        ignore Cluster.Slots.installed_nft<()>(_conf, func (slot: CanisterSlot) {
            job_add(#install_code({
                slot;
                wasm = #nft;
                mode = #reinstall;
                }));
            
            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));
        });

        

        // create all pwr canisters
        ignore Cluster.Slots.installed_pwr<()>(_conf, func (slot: CanisterSlot) {

            job_add(#install_code({
                slot;
                wasm = #pwr;
                mode = #reinstall;
                }));

            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));
        });



        // create anvil canister
        job_add(#install_code({
            slot = _conf.anvil;
            wasm = #anvil;
            mode = #reinstall;
        }));
        // job_add(#oracle_set({slot = _conf.anvil; oracle = _oracle}));
        // job_add(#config_set({slot = _conf.anvil; config = _conf}));

        // create treasury canister
        job_add(#install_code({
            slot = _conf.treasury;
            wasm = #treasury;
            mode = #reinstall;
        }));

        job_add(#install_code({
            slot = _conf.tokenregistry;
            wasm = #tokenregistry;
            mode = #reinstall;
        }));

        // job_add(#oracle_set({slot = _conf.treasury; oracle = _oracle}));
        // job_add(#config_set({slot = _conf.treasury; config = _conf}));

        ignore Cluster.Slots.installed_history<()>(_conf, func (slot: CanisterSlot) {
             job_add(#install_code({
                slot;
                wasm = #history;
                mode = #reinstall;
            }));

            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));
        });
  

        // create all account canisters
        ignore Cluster.Slots.installed_account<()>(_conf, func (slot: CanisterSlot) {

            job_add(#install_code({
                slot;
                wasm = #account;
                mode = #reinstall;
                }));

            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));
        });

    };



    public shared({caller}) func upgrade() : async () {
        assert(caller == _installer);

        // all nft canisters with installed code. There are a lot which don't have installed code and their cycles should stay 100_000_000_000
        ignore Cluster.Slots.installed_nft<()>(_conf, func (slot: CanisterSlot) {
            job_add(#install_code({
                slot;
                wasm = #nft;
                mode = #upgrade;
                }));
        });
     
        // upgrade all pwr canisters
        ignore Cluster.Slots.installed_pwr<()>(_conf, func (slot: CanisterSlot) {
            job_add(#install_code({
                slot;
                wasm = #pwr;
                mode = #upgrade;
                }));

            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));
        });

       

        // create anvil canister
        job_add(#install_code({
            slot = _conf.anvil;
            wasm = #anvil;
            mode = #upgrade;
        }));
        // job_add(#oracle_set({slot = _conf.anvil; oracle = _oracle}));
        // job_add(#config_set({slot = _conf.anvil; config = _conf}));


        // create treasury canister
        job_add(#install_code({
            slot = _conf.treasury;
            wasm = #treasury;
            mode = #upgrade;
        }));

        job_add(#install_code({
            slot = _conf.tokenregistry;
            wasm = #tokenregistry;
            mode = #upgrade;
        }));

        // job_add(#oracle_set({slot = _conf.treasury; oracle = _oracle}));
        // job_add(#config_set({slot = _conf.treasury; config = _conf}));

        ignore Cluster.Slots.installed_history<()>(_conf, func (slot: CanisterSlot) {
            job_add(#install_code({
                slot;
                wasm = #history;
                mode = #upgrade;
            }));

            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));

        });
        

        // upgrade all account canisters
        ignore Cluster.Slots.installed_account<()>(_conf, func (slot: CanisterSlot) {
            job_add(#install_code({
                slot;
                wasm = #account;
                mode = #upgrade;
                }));

            // job_add(#oracle_set({slot; oracle = _oracle}));
            // job_add(#config_set({slot; config = _conf}));
        });

    };

    private func job_add(j: Job) : () {
        _jobs := List.append(_jobs, List.fromArray<Job>([j]));
    };
 
    private func job_run(j: Job) : async () {
        switch(j) {
            case (#install_code(x)) await job_install_code(x);
            case (#canister_start(x)) await job_canister_start(x);
            case (#canister_stop(x)) await job_canister_stop(x);
            case (#oracle_set(x)) await job_oracle_set(x);
            case (#config_set(x)) await job_conf_set(x);
            case (#refuel(x)) await job_refuel(x);
            case (#callback(x)) await job_callback(x);
        };
    };



    private func job_oracle_set({slot; oracle}: Job_Oracle_Set) : async () {
        log("oracle_set " # debug_show({slot; oracle}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;

        let re = await can.oracle_set(oracle);

        // log("job_oracle_set result" #debug_show(re));

    };    


    private func job_callback({msg; callback}: Job_Callback) : async () {
        log(msg);
        await callback();
    };
    
    private func job_refuel({slot}: Job_Refuel) : async () {

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let stats = await IC.canister_status({canister_id});
        
        //log("job_refuel can status " #debug_show(stats));

        //let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;
        switch(stats.module_hash) {
            case (?installed) {
                 if (stats.cycles < (Cluster.MGR_MIN_ACTIVE_CAN_CYCLES - Cluster.MGR_IGNORE_CYCLES)) {
                      let amount = Cluster.MGR_MIN_ACTIVE_CAN_CYCLES - stats.cycles;
                      //await IC.deposit_cycles({canister_id});

                      let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;
                      Cycles.add( amount );
                      await can.wallet_receive();
                      let added = amount - Cycles.refunded();

                      _refuel += added;

                      log("refuel " # debug_show({slot}) # " added " #debug_show(added));
                };
            };
            case (null) {
                if (stats.cycles < (Cluster.MGR_MIN_INACTIVE_CAN_CYCLES - Cluster.MGR_IGNORE_CYCLES)) {
                      let amount = Cluster.MGR_MIN_INACTIVE_CAN_CYCLES - stats.cycles;
                      
                      let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;
                      Cycles.add( amount );
                      await can.wallet_receive();
                      let added = amount - Cycles.refunded();

                      _refuel += added;

                      log("refuel " # debug_show({slot}) # "added  " #debug_show(added));
                };
            };
        };

    };    




    private func job_conf_set({slot; config}: Job_Config_Set) : async () {
        log("conf_set " # debug_show({slot; config}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let can = actor(Principal.toText(canister_id)) : Cluster.CommonActor;

        let re = await can.config_set(config);

        //log("job_conf_set result" #debug_show(re));

    };    

    private func job_canister_start({slot}: Job_Canister_Start) : async () {
        log("canister_start " # debug_show({slot;}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let re = await IC.start_canister({canister_id = canister_id});
    };

    private func job_canister_stop({slot}: Job_Canister_Stop) : async () {
        log("canister_stop " # debug_show({slot;}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let re = await IC.stop_canister({canister_id = canister_id});
    };

    private func job_install_code({slot; wasm; mode}: Job_Install_Code) : async () {
        log("install_code " # debug_show({slot; wasm; mode}));

        let canister_id = Nft.APrincipal.fromSlot(_conf.space, slot);

        let re = await IC.install_code({
              arg = [];
              wasm_module = switch(wasm) {
                  case (#nft) _wasm_nft;
                  case (#account) _wasm_account;
                  case (#pwr) _wasm_pwr;
                  case (#history) _wasm_history;
                  case (#anvil) _wasm_anvil;
                  case (#treasury) _wasm_treasury;
                  case (#tokenregistry) _wasm_tokenregistry;


              };
              mode;
              canister_id = canister_id;
            });

        //log("job_install_code result" #debug_show(re));
    };

    private func log(msg: Text) : () {
        let p: Cluster.LogEvent = {
            time = Nat32.fromIntWrap(Int.div(Time.now(), 1000000000));
            msg
        };

        Debug.print(msg);

        _log := List.append(_log, List.fromArray<Cluster.LogEvent>([p]));
        _log_size += 1;

        if (_log_size > 500) {
            _log := List.drop(_log, 10);
            _log_size -= 10;
            };
        
    };
    
    public query func log_get() : async [Cluster.LogEvent] {
        let re = List.toArray(_log);
        return re;
    };


    // This func is only for local development because sequential ids aren't guaranteed on IC network yet.
    public shared ({caller}) func create_local_canisters() : async () {
            assert(caller == _installer);

            var cnt = 0;
            let max = 50;
            var start : ?Nat64 = null;
            var end : ?Nat64 = null;

            while (cnt < max) {
                Cycles.add(200_000_000_000);
  
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
                                    router = Principal.fromActor(this);
                                    nft = (0,20);
                                    nft_avail = [0,1,2];
                                    account = (21,22);
                                    pwr = (27,29);
                                    anvil = 26;
                                    treasury = 25;
                                    tokenregistry = 24;
                                    history = 30;
                                    history_range = (30,50);
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

    public shared({caller}) func event_history_full() : async () {
        switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
            case (?slot) {
                assert(slot == _conf.history);
                log("event_history_full " # debug_show({slot}) );
    
                job_add(#callback({
                    msg = "history canister switching";
                    callback = func () : async () {
                    
                    let new_history_slot = _conf.history + 1;

                    await job_install_code({slot = new_history_slot; wasm = #history; mode= #install});
                    await job_canister_start({slot = new_history_slot});
                    //await job_oracle_set({slot = new_history_slot; oracle = _oracle});
                    await job_conf_set({slot = new_history_slot; config = _conf});

                    let {nft; nft_avail; account; router; pwr; anvil; treasury; tokenregistry; history; history_range; space} = _conf;
                    _conf := {nft; nft_avail; account; router; pwr;  anvil; treasury;  tokenregistry; history=new_history_slot; history_range; space};
                    
                    //job_add(#callback( func () : async () {
                        ignore Cluster.Slots.installed_all(_conf, func (slot: CanisterSlot) {
                            job_add(#config_set({slot; config=_conf}));   
                        });
                    //}));
                    
                 }}));

               
            };
            case (null) {
                ();
            }
        }
    };

    public shared({caller}) func event_nft_full(x: Principal) : async () {

        let target = switch(caller == _installer) {
            case (true) x;
            case (false) caller;
        };

        switch(Nft.APrincipal.toSlot(_conf.space, target)) {
            case (?slot) {
                log("event_nft_full " # debug_show({slot}) );
    
                job_add(#callback({msg="Nft canister switching"; callback = func () : async () {
                    
                    let nft_end = _conf.nft_avail[ Array_.size(_conf.nft_avail) - 1 ];
                    let new_nft = nft_end + 1;
                    let new_nft_avail =  Array.append(Array.filter(_conf.nft_avail, func (x: CanisterSlot) : Bool {
                            x != slot
                        }),[new_nft]);

                    await job_install_code({slot = new_nft; wasm = #nft; mode= #install});
                    await job_canister_start({slot = new_nft});
                    await job_oracle_set({slot = new_nft; oracle = _oracle});
                    await job_conf_set({slot = new_nft; config = _conf});
                    job_add(#refuel({slot = new_nft;}));


                    let {nft; nft_avail; account; router; pwr; anvil; treasury; tokenregistry; history; history_range; space} = _conf;
                    _conf := {nft; nft_avail = new_nft_avail; account; router; pwr; anvil; treasury; tokenregistry; history; history_range; space};
                 }}));


            };
            case (null) {
                ();
            }
        }
    };

    public shared({caller}) func wasm_set({name: Text; wasm:[Nat8]}) : async () {
        assert(caller == _installer);
        switch(name) {
            case ("nft") _wasm_nft := wasm;
            case ("account") _wasm_account := wasm;
            case ("pwr") _wasm_pwr := wasm;
            case ("history") _wasm_history := wasm;
            case ("anvil") _wasm_anvil := wasm;
            case ("treasury") _wasm_treasury := wasm;
            case ("tokenregistry") _wasm_tokenregistry := wasm;


            case (_) { assert(false); (); }
        }
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };


    public query func config_get() : async Cluster.Config {
        return _conf;
    };

    public query func settings_get() : async (Nft.Config, Nft.Oracle) {
        return (_conf, _oracle);
    };

    public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle;
        ignore Cluster.Slots.installed_all(_conf, func (slot: CanisterSlot) {
            job_add(#oracle_set({slot; oracle = oracle}));   
            });
    };
 
    public shared({caller}) func start_all() : async () {
        assert(caller == _installer);

        ignore Cluster.Slots.installed_history<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_start({slot}));
            });

        ignore Cluster.Slots.installed_account<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_start({slot}));
            });

        ignore Cluster.Slots.installed_nft<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_start({slot}));
            });

        ignore Cluster.Slots.installed_pwr<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_start({slot}));
            });

        job_add(#canister_start({slot = _conf.treasury}));
        job_add(#canister_start({slot = _conf.tokenregistry}));
        job_add(#canister_start({slot = _conf.anvil}));

        job_add(#callback({msg="Cluster started"; callback = func () : async () { 
            _maintenance := false;
        }}));

        ignore Cluster.Slots.installed_all(_conf, func (slot: CanisterSlot) {
            job_add(#config_set({slot; config = _conf}));   
            job_add(#oracle_set({slot; oracle = _oracle}));   
            });

    };

    public shared({caller}) func stop_all() : async () {
        assert(caller == _installer);
        
        _maintenance := true;
        
        // Order is important
        job_add(#canister_stop({slot = _conf.treasury}));
        job_add(#canister_stop({slot = _conf.tokenregistry}));
        job_add(#canister_stop({slot = _conf.anvil}));

        ignore Cluster.Slots.installed_pwr<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_stop({slot}));   
            });

        ignore Cluster.Slots.installed_nft<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_stop({slot}));   
            });

        ignore Cluster.Slots.installed_account<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_stop({slot}));   
            });

        ignore Cluster.Slots.installed_history<()>(_conf, func (slot: CanisterSlot) {
            job_add(#canister_stop({slot}));   
            });

        job_add(#callback({msg="Cluster stopped"; callback = func () : async () {  }}));
    };
 

    public query func stats() : async (Cluster.StatsResponse and {
        refuel : Nat;
        jobs_success : Nat;
        jobs_fail : Nat;
        maintenance : Bool;
    }) {
        {
            maintenance = _maintenance;
            refuel = _refuel;
            jobs_success = _jobs_success;
            jobs_fail = _jobs_fail;
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