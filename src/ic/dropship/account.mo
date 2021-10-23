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
    type TokenIndex = Ext.TokenIndex;
    type TokenStore = HashMap.HashMap<TokenIndex, Bool>;

    private stable var _tmpCan2idx : [(Principal, Bool)] = [];
    private var _can2idx : HashMap.HashMap<Principal, Bool> = HashMap.fromIter(_tmpCan2idx.vals(), 0, Principal.equal, Principal.hash );
   
    private stable var _tmpAccount: [(AccountIdentifier, [TokenIndex])] = [];
    private var _account: HashMap.HashMap<AccountIdentifier, TokenStore> =  HashSmash.init<AccountIdentifier,TokenIndex>(_tmpAccount, Text.equal, Text.hash, Nat32.equal, func(x:Nat32) {x} );
  
    private var _slot: Nat32 = 0;

    
    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := HashSmash.pre(_account);
        _tmpCan2idx := Iter.toArray(_can2idx.entries());
    };

    system func postupgrade() {
        _tmpAccount := [];
        _tmpCan2idx := [];
    };

   
    public shared ({caller}) func setup({slot:Nat32}) : async () {
        assert(caller == _owner);
        _slot := slot;
    };

    // list of allowed nft canisters which can add/rem to account                                     
    public shared ({caller}) func addAllowed(p: Principal) : async () {
        assert(caller == _owner);

        _can2idx.put(p, true);
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

    public shared ({caller}) func list(aid: AccountIdentifier) : async [TokenIndex] {
        Iter.toArray(HashSmash.list<AccountIdentifier>(_account, aid));

    };
}