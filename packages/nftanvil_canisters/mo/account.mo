import Text "mo:base/Text";
import Nft "./type/nft_interface";

import HashMap "mo:base/HashMap";
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
import Ledger  "./type/ledger_interface";


import Prim "mo:prim"; 
import Cluster  "./type/Cluster";
import Account "./type/account_interface";
import TrieRecord "./lib/TrieRecord";


shared({ caller = _installer }) actor class Class() = this {
    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _cycles_recieved : Nat = Cycles.balance();
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
    private stable var _slot : Nft.CanisterSlot = 0;

    private stable var _total_accounts : Nat = 0;

     // TYPE ALIASES
    type AccountIdentifier = Nft.AccountIdentifier;
    type TokenIdentifier = Nft.TokenIdentifier;
    type TokenIndex = Nft.TokenIndex;
    type Slot = Nft.CanisterSlot;


    private stable var _tmpAccount: [(AccountIdentifier, Account.AccountRecordSerialized)] = [];

    private var _account: TrieRecord.TrieRecord<AccountIdentifier, Account.AccountRecord, Account.AccountRecordSerialized> = TrieRecord.TrieRecord<AccountIdentifier, Account.AccountRecord, Account.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Account.AccountRecordSerialize, Account.AccountRecordUnserialize);
   

    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := Iter.toArray(_account.serialize());
    };

    system func postupgrade() {
        _tmpAccount := [];
        _cycles_recieved := Cycles.balance();
    };
    
    private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");



    public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
        _cycles_recieved += accepted;
    };


    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        assert(switch(Nft.APrincipal.toSlot(conf.space, Principal.fromActor(this))) {
            case (?slot) {
                _slot := slot;
                true;
            };
            case (null) {
                false; // current principal is not in space, which means configuration is wrong or canister principal is not correct
            }
        });
        _conf := conf
    }; 
    
    public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
    };

    public shared ({caller}) func add(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
        assert(Cluster.aid2slot(_conf, aid) == _slot);

        switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
            case (?slot) {
               let tid = Nft.TokenIdentifier.encode(slot, idx);

               let r = switch(_account.get(aid)) {
                   case (?ac) ac;
                   case (_) {
                        _total_accounts += 1;
                        let blank = Account.AccountRecordBlank();
                        _account.put(aid, blank);  
                        blank;
                    }
               };

               r.tokens.add(tid);
               
               
               //HashSmash.add<AccountIdentifier, TokenIdentifier>(_account, aid, tid, Nft.TokenIdentifier.equal, Nft.TokenIdentifier.hash);
            };
            case (_) { () }
        }
    };

    public shared ({caller}) func rem(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
        assert(Cluster.aid2slot(_conf, aid) == _slot);

        switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
            case (?slot) { 
               let tid = Nft.TokenIdentifier.encode(slot, idx);

               let r = switch(_account.get(aid)) {
                   case (?ac) {
                       ac.tokens.rem(tid); //HashSmash.rem<AccountIdentifier,TokenIdentifier>(_account, aid, tid);
                       //TODO: Garbage collect if empty
                   };
                   case (_) { () }
               };
            };
            case (_) { () }
        }
    };

    public query func meta(aid: AccountIdentifier) : async ?Account.AccountMeta {
        switch(_account.get(aid)) {
            case (?ac) {
                ?{
                    info = ac.info;
                    transactions = ac.transactions;
                }
            };
            case (_) { null }
        };
    };

    public query func list(aid: AccountIdentifier, from:Nat, to:Nat) : async [TokenIdentifier] {
        assert(Nft.User.validate(#address(aid)) == true);
        let total = to - from;
        assert(total <= 100);

        let rez:[var TokenIdentifier] = Array.init<TokenIdentifier>(total, 0);

          switch(_account.get(aid)) {
                   case (?acc) {
                      
                    let it = acc.tokens.list(); //HashSmash.list<AccountIdentifier,TokenIdentifier>(_account, aid);

                    var index = 0;
                    let pstart = from;
                    let pend = to;
                    label l for (tid:TokenIdentifier in it) {
                        if (index >= pend) break l;

                        if ((index >= pstart)) {
                            rez[index - pstart] :=  tid;
                        };
                        index := index + 1;
                    };

                    return Array.freeze(rez); 
                    
        };
            case (_) { return [] }
        };
    };

    public shared({caller}) func add_transaction(aid: AccountIdentifier, tx: Nft.TransactionId) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
            
            switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
                case (?slot) {

                let r = switch(_account.get(aid)) {
                    case (?ac) ac;
                    case (_) {
                            return ();
                        }
                };

                addTransaction(r, tx);
                
                };
                case (_) { () }
            }
    };

    private func addTransaction(r: Account.AccountRecord, transactionId: Nft.TransactionId) : () {
        let tmp = r.transactions;
        let size = Array_.size(r.transactions);
        let newSize = switch(size >= 20) { case(true) 20; case(false) size+1; };

        r.transactions := Array.tabulate<Blob>(newSize, func(i:Nat) : Blob {
            if (i == 0) return transactionId;
            tmp[i-1];
            });
    };
    
    public query func stats() : async (Cluster.StatsResponse and { 
        total_accounts : Nat;
    }) {
        {
            total_accounts = _total_accounts;
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