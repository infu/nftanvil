import Text "mo:base/Text";
import Nft "./type/nft_interface";

import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Int32 "mo:base/Int32";

import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";

import Cycles "mo:base/ExperimentalCycles";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Array_ "./lib/Array";
import HashSmash "./lib/HashSmash";

import Prim "mo:prim"; 
import Cluster  "./type/Cluster";
import Account "./type/account_interface";

shared({ caller = _installer }) actor class Class() = this {
    private stable var _conf : Cluster.Config = Cluster.Config.default();

     // TYPE ALIASES
    type AccountIdentifier = Nft.AccountIdentifier;
    type TokenIdentifier = Nft.TokenIdentifier;
    type TokenIndex = Nft.TokenIndex;
    type TokenStore = HashMap.HashMap<TokenIdentifier, Bool>;
    type Slot = Nft.CanisterSlot;

    private stable var _tmpAccount: [(AccountIdentifier, [TokenIdentifier])] = [];
    private var _account: HashMap.HashMap<AccountIdentifier, TokenStore> =  HashSmash.init<AccountIdentifier,TokenIdentifier>(_tmpAccount, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Nft.TokenIdentifier.equal, Nft.TokenIdentifier.hash);
  
    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := HashSmash.pre(_account);
    };

    system func postupgrade() {
        _tmpAccount := [];
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };

    public shared ({caller}) func add(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
        
        switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
            case (?slot) {
               let tid = Nft.TokenIdentifier.encode(slot, idx);
               HashSmash.add<AccountIdentifier, TokenIdentifier>(_account, aid, tid, Nft.TokenIdentifier.equal, Nft.TokenIdentifier.hash );
            };
            case (_) { () }
        }
    };

    public shared ({caller}) func rem(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);

        switch(Nft.APrincipal.toSlot(_conf.space, caller)) { 
            case (?slot) { 
               let tid = Nft.TokenIdentifier.encode(slot, idx);
               HashSmash.rem<AccountIdentifier,TokenIdentifier>(_account, aid, tid);
            };
            case (_) { () }
        }
    };

    public query func list(aid: AccountIdentifier, page:Nat) : async [TokenIdentifier] {
        assert(Nft.User.validate(#address(aid)) == true); 

        let rez:[var TokenIdentifier] = Array.init<TokenIdentifier>(100,0);
        let it = HashSmash.list<AccountIdentifier,TokenIdentifier>(_account, aid);

        var index = 0;
        let pstart = page*100;
        let pend = (page+1)*100;
        label l for (tid:TokenIdentifier in it) {
            if (index >= pend) break l;

            if ((index >= pstart)) {
                  rez[index - pstart] :=  tid;
            };
            index := index + 1;
        };

        return Array.freeze(rez); 
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