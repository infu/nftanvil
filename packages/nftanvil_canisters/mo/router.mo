import Array  "mo:base/Array";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import HashMap "mo:base/HashMap";

import AAA "./type/aaa_interface";

shared({caller = owner}) actor class Router({
    _nft_canisters : [(Principal, Bool)];
    _account_canisters : [Principal];
    _treasury : Principal;
    _collection : Principal;
    _anv : Principal;
    _pwr : Principal;
}) = this {

    let IC = actor "aaaaa-aa" : AAA.Interface;

    private var _nft_availability : HashMap.HashMap<Principal, Bool> = HashMap.fromIter(_nft_canisters.vals(), 0, Principal.equal, Principal.hash);

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

    public shared({caller}) func reportOutOfMemory() : async () {
        switch(_nft_availability.get(caller)) {
            case (?a) {
                _nft_availability.put(caller, false);
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


    public query func fetchNFTCanisters() : async [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_nft_canisters), func((x:Principal, b:Bool)) : Text { Principal.toText(x); }));
    };

    private func getAccountCanisters() : [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_account_canisters), func(x:Principal) : Text { Principal.toText(x); }));
    };

    public query func fetchNFTCan(slot: Nat) : async Text {
        Principal.toText(_nft_canisters[slot].0);
    };

    public query func isLegitimate(can: Principal) : async Bool {
        switch(Array.find<(Principal,Bool)>(_nft_canisters, 
        func ((p : Principal, b:Bool)) : Bool {
            p == can
        })) {
            case (?a) true;
            case (null) false;
        };
    };

    public query func fetchSetup() : async {acclist: [Text]} {
         {
         acclist = getAccountCanisters();
         anv = _anv;
         pwr = _pwr;
         collection = _collection;
         treasury = _treasury;
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