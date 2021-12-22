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
import Nat8 "mo:base/Nat8";

import Cycles "mo:base/ExperimentalCycles";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Array_ "./lib/Array";
import HashSmash "./lib/HashSmash";

import Prim "mo:prim"; 
import Cluster  "./type/Cluster";

shared({ caller = _owner }) actor class Account() = this {
    private stable var _conf : Cluster.Config = Cluster.default();

     // TYPE ALIASES
    type AccountIdentifier = Nft.AccountIdentifier;
    type TokenIdentifier = Nft.TokenIdentifier;
    type TokenIndex = Nft.TokenIndex;
    type TokenStore = HashMap.HashMap<TokenIndex, Bool>;
    type Slot = Nat32;

    private stable var _tmpAccount: [(AccountIdentifier, [TokenIndex])] = [];
    private var _account: HashMap.HashMap<AccountIdentifier, TokenStore> =  HashSmash.init<AccountIdentifier,TokenIndex>(_tmpAccount, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Nat32.equal, func(x:Nat32):Nat32 {x} );
  
    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := HashSmash.pre(_account);
    };

    system func postupgrade() {
        _tmpAccount := [];
    };

    private func can2idx(can:Principal) : ?Slot {
        var found:?Slot = null;
        Iter.iterate<Principal>(Iter.fromArray(_conf.nft), func (x, index) {
            if (can == x) found := ?Nat32.fromNat(index);
        });
        return found;
    };

    public shared ({caller}) func add(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);

        switch(can2idx(caller)) {
            case (?a) {
               HashSmash.add<AccountIdentifier>(_account, aid, idx);
            };
            case (_) { () }
        }
    };

    public shared ({caller}) func rem(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);

        switch(can2idx(caller)) {
            case (?a) { 
               HashSmash.rem<AccountIdentifier>(_account, aid, idx);
            };
            case (_) { () }
        }
    };

    public query func list(aid: AccountIdentifier, page:Nat) : async [TokenIdentifier] {
        assert(Nft.User.validate(#address(aid)) == true); 

        let rez:[var TokenIdentifier] = Array.init<TokenIdentifier>(100,"");
        let it = HashSmash.list<AccountIdentifier>(_account, aid);

        var index = 0;
        let pstart = page*100;
        let pend = (page+1)*100;
        label l for (gid:Nat32 in it) {
            if (index >= pend) break l;

            if ((index >= pstart)) {
                  rez[index - pstart] := gid2tid(gid);
            };
            index := index + 1;
        };

        return Array.freeze(rez); 
    };

    private func gid2tid(gid:Nat32) : TokenIdentifier {
            let slot:Nat32 = gid >> 13;
            let idx:Nat32 = gid; 
            let nftcan = _conf.nft[Nat32.toNat(slot)];
            Nft.TokenIdentifier.encode(nftcan, idx);
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