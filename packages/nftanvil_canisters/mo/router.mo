import Array  "mo:base/Array";
import Iter "mo:base/Iter";

import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";


import ICType "./ictype";
import NFT "./nft";
import AccessControl "./access";

import Account "./account";

import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 


shared({caller = owner}) actor class Router() = this {

    private let cyclesForNewCanister = 600_000_000_000;
                                        
    private stable var _nft_canisters : [NFT.NFT] = [];
    private stable var _account_canisters : [Account.Account] = [];

    private stable var _access_canisters : [AccessControl.AccessControl] = [];

    let IC = actor "aaaaa-aa" : ICType.interface;

    private stable var _nft_canisters_next_id:Nat32 = 0;
    private stable var _account_canisters_next_id:Nat32 = 0;
    private stable var _access_canisters_next_id:Nat32 = 0;

    system func postupgrade() {
        _access_canisters := [ actor("zhhlp-riaaa-aaaai-qa24q-cai"):AccessControl.AccessControl ];
    };

    public shared({caller}) func debug_reset() : async () {
        assert(caller == owner);

        _nft_canisters := [];
        _nft_canisters_next_id := 0;

        _account_canisters := [];
        _account_canisters_next_id := 0;

     

        await addAccessCanister();
        await addAccessCanister();
        await addAccessCanister();

        // create account canisters 
        var can = 0; 
        while(can < 3) {
            await addAccountCanister();
            can := can + 1;
        };

        // create one NFT canister
        await addNFTCanister();
     
    };

    public shared({caller}) func reportOutOfMemory() : async () {
        
        assert((caller == owner) or (switch( Array.find(_nft_canisters, func(x : NFT.NFT) : Bool {
             Principal.fromActor(x) == caller 
             } ) ) { case (?a) true; case (_) false; } ));
        
        await addNFTCanister();
    };

    public query func getAvailable() : async Principal {
            Principal.fromActor(_nft_canisters[ Nat32.toNat(_nft_canisters_next_id) - 1]);
    };

    private func addNFTCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let slot = _nft_canisters_next_id;
            _nft_canisters_next_id := _nft_canisters_next_id + 1;

            let new = await NFT.NFT({_acclist = getAccountCanisters(); _accesslist=getAccessCanisters(); _slot= slot; _debug_cannisterId=null});
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

            _nft_canisters := Array.append<NFT.NFT>(_nft_canisters, [new]);

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
            let new = await Account.Account();
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
    


    private func addAccessCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await AccessControl.AccessControl({_admin = owner});
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
        Iter.toArray(Iter.map(Iter.fromArray(_nft_canisters), func(x:NFT.NFT) : Text { Principal.toText(Principal.fromActor(x)); }));
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