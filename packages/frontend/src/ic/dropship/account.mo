import Text "mo:base/Text";
import Ext "../lib/ext.std/src/Ext";

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
import Array_ "../lib/vvv/src/Array";
import HashSmash "../lib/vvv/src/HashSmash";

import Prim "mo:prim"; 


shared({ caller = _owner }) actor class Account() = this {
     // TYPE ALIASES
    type AccountIdentifier = Ext.AccountIdentifier;
    type TokenIdentifier = Ext.TokenIdentifier;
    type TokenIndex = Ext.TokenIndex;
    type TokenStore = HashMap.HashMap<TokenIndex, Bool>;
    type Slot = Nat32;

    private stable var _tmpCan2idx : [(Principal, Slot)] = [];
    private var _can2idx : HashMap.HashMap<Principal, Slot> = HashMap.fromIter(_tmpCan2idx.vals(), 0, Principal.equal, Principal.hash );
   
    private stable var _tmpIdx2can: [(Slot, Principal)] = [];
    private var _idx2can : HashMap.HashMap<Slot, Principal> = HashMap.fromIter(_tmpIdx2can.vals(), 0, Nat32.equal, func (x:Nat32):Nat32 {x} );
  
    private stable var _tmpAccount: [(AccountIdentifier, [TokenIndex])] = [];
    private var _account: HashMap.HashMap<AccountIdentifier, TokenStore> =  HashSmash.init<AccountIdentifier,TokenIndex>(_tmpAccount, Ext.AccountIdentifier.equal, Ext.AccountIdentifier.hash, Nat32.equal, func(x:Nat32):Nat32 {x} );
  
    
    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := HashSmash.pre(_account);
        _tmpCan2idx := Iter.toArray(_can2idx.entries());
        _tmpIdx2can := Iter.toArray(_idx2can.entries());

    };

    system func postupgrade() {
        _tmpAccount := [];
        _tmpCan2idx := [];
        _tmpIdx2can := [];

    };

   
  
    // list of allowed nft canisters which can add/rem to account                                     
    public shared ({caller}) func addAllowed(p: Principal, slot:Nat32) : async () {
        assert(caller == _owner);

        _can2idx.put(p, slot);
        _idx2can.put(slot, p);

    };


    public shared ({caller}) func add(aid: AccountIdentifier, idx: TokenIndex) : async () {
        switch(_can2idx.get(caller)) {
            case (?a) { 
               HashSmash.add<AccountIdentifier>(_account, aid, idx);
            };
            case (_) { () }
        }
    };

    public shared ({caller}) func rem(aid: AccountIdentifier, idx: TokenIndex) : async () {
        switch(_can2idx.get(caller)) {
            case (?a) { 
               HashSmash.rem<AccountIdentifier>(_account, aid, idx);
            };
            case (_) { () }
        }
    };

    public query func list(aid: AccountIdentifier, page:Nat) : async [TokenIdentifier] {
        let rez:[var TokenIdentifier] = Array.init<TokenIdentifier>(100,"");
        let it = HashSmash.list<AccountIdentifier>(_account, aid);

        var index = 0;
        let pstart = page*100;
        let pend = (page+1)*100;
        label l for (gid:Nat32 in it) {
            if (index > pend) break l;

            if ((index >= pstart)) {
                  rez[index - pstart] := gid2tid(gid);
            };
            index := index + 1;
        };

        return Array.freeze(rez); 
    };

    private func gid2tid(gid:Nat32) : TokenIdentifier {
            let slot:Nat32 = gid >> 13;
            let idx:Nat32 = gid & 8191;
            switch(_idx2can.get(slot)) {
                case (?nftcan) {
                    Ext.TokenIdentifier.encode(nftcan, idx);
                };
                case (_) "NoK"
            }
    }
}