import Array  "mo:base/Array";
import Iter "mo:base/Iter";

import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import HashMap "mo:base/HashMap";


import AAA "./aaa_interface";
import NFT "./nft";
import AccessControl "./access";

import Account "./account";

import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 

import Treasury "./treasury";


shared({caller = owner}) actor class Router() = this {

    private let cyclesForNewCanister = 600_000_000_000;
                                        
    private stable var _nft_canisters : [NFT.Class] = [];
    private stable var _account_canisters : [Account.Account] = [];

    private stable var _access_canisters : [AccessControl.AccessControl] = [];

    private stable var _treasury_canisters : [Treasury.Class] = [];

    let IC = actor "aaaaa-aa" : AAA.Interface;

    private stable var _nft_canisters_next_id:Nat32 = 0;
    private stable var _account_canisters_next_id:Nat32 = 0;
    private stable var _access_canisters_next_id:Nat32 = 0;

    private stable var _tmpNftAvailability : [(Principal, Bool)] = [];
    private var _nft_availability : HashMap.HashMap<Principal, Bool> = HashMap.fromIter(_tmpNftAvailability.vals(), 0, Principal.equal, Principal.hash);

    system func preupgrade() {
        _tmpNftAvailability := Iter.toArray(_nft_availability.entries());
    };

    system func postupgrade() {
        _tmpNftAvailability := [];
    };

 
    public shared({caller}) func debug_reset() : async () {
        assert(caller == owner);

        _nft_canisters := [];
        _nft_canisters_next_id := 0;

        _account_canisters := [];
        _account_canisters_next_id := 0;

        _nft_availability := HashMap.fromIter(Iter.fromArray([]), 0, Principal.equal, Principal.hash);
        _access_canisters_next_id := 0;
        _access_canisters := [];

        await addTreasuryCanister();
        await addAccessCanister();
        // await addAccessCanister();
        // await addAccessCanister();

        // create account canisters 
        var can = 0; 
        while(can < 1) {
            await addAccountCanister();
            can := can + 1;
        };

        // create one NFT canister
        var nftcan = 0; 
        while(nftcan < 1) {
            await addNFTCanister();
            nftcan := nftcan + 1;
        };
    };

    
    public shared({caller}) func setNFTOut(can : Principal) : async () {
        assert(caller == owner);
        switch(_nft_availability.get(can)) {
            case (?a) {
                _nft_availability.put(can, false);
            };
            case (_) {
                ()
            }
        }
    };

    public shared({caller}) func addNFT() : async () {
        assert(caller == owner);
        await addNFTCanister();
    };


    public shared({caller}) func reportOutOfMemory() : async () {
        switch(_nft_availability.get(caller)) {
            case (?a) {
                _nft_availability.put(caller, false);
                await addNFTCanister();
            };
            case (_) {
                ()
            }
        }
    };

    public query func getAvailable() : async [Text] {
        var result: [Text] = [];
        for ((x:Principal, available:Bool) in _nft_availability.entries()) {
            if (available == true) {
                result := Array.append<Text>(result, [Principal.toText(x)])
            }
        };

        return result;
    };

    private func addNFTCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let slot = _nft_canisters_next_id;
            _nft_canisters_next_id := _nft_canisters_next_id + 1;

            let new = await NFT.Class({_acclist = getAccountCanisters(); _treasury = Principal.fromActor(_treasury_canisters[0]); _router = Principal.fromActor(this); _accesslist=getAccessCanisters(); _slot= slot; _debug_cannisterId=null});
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = { 
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null; 
                freezing_threshold = ?31_540_000
                }
            });

            _nft_availability.put(Principal.fromActor(new), true);
            _nft_canisters := Array.append<NFT.Class>(_nft_canisters, [new]);

            // register it inside account canisters
            let it = Iter.fromArray(_account_canisters);
            for (x in it) {
                await x.addAllowed(Principal.fromActor(new), slot);
            };

            // register it inside access canisters
            let ita = Iter.fromArray(_access_canisters);
            for (x in ita) {
                await x.addAllowed(Principal.fromActor(new));
            };

    };

    private func addAccountCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await Account.Account({_router = Principal.fromActor(this)});
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = { 
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null; 
                freezing_threshold = ?31_540_000
                }
            });

            _account_canisters := Array.append<Account.Account>(_account_canisters, [new]);
            _account_canisters_next_id := _account_canisters_next_id + 1;
    };
    

    private func addTreasuryCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await Treasury.Class({_admin = owner; _router = Principal.fromActor(this)});
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal;
            settings = {
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null;
                freezing_threshold = ?31_540_000
                }
            });

            _treasury_canisters := [new];
    };

    private func addAccessCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await AccessControl.AccessControl({_admin = owner; _router = Principal.fromActor(this)});
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = {
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null; 
                freezing_threshold = ?31_540_000
                }
            });

            _access_canisters := Array.append<AccessControl.AccessControl>(_access_canisters, [new]);
            _access_canisters_next_id := _access_canisters_next_id + 1;
        
    };

    public query func fetchNFTCanisters() : async [Text] {
          Iter.toArray(Iter.map(Iter.fromArray(_nft_canisters), func(x:NFT.Class) : Text { Principal.toText(Principal.fromActor(x)); }));
    };

    private func getAccountCanisters() : [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_account_canisters), func(x:Account.Account) : Text { Principal.toText(Principal.fromActor(x)); }));
    };

    private func getAccessCanisters() : [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_access_canisters), func(x:AccessControl.AccessControl) : Text { Principal.toText(Principal.fromActor(x)); }));
    };

    public query func fetchNFTCan(slot: Nat) : async Text {
        Principal.toText(Principal.fromActor(_nft_canisters[slot]));
    };

    public query func isLegitimate(can: Principal) : async Bool {
        switch(Array.find<NFT.Class>(_nft_canisters, 
        func (p : NFT.Class) : Bool {
            Principal.fromActor(p) == can
        })) {
            case (?a) true;
            case (null) false;
        };
    };

    public query func fetchSetup() : async {accesslist:[Text]; acclist: [Text]} {
         {
         accesslist = getAccessCanisters();
         acclist = getAccountCanisters();
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