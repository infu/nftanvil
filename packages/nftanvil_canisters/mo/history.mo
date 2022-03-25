import Nft "./type/nft_interface";
import Blob_ "./lib/Blob";

import AssocList "mo:base/AssocList";
import Principal "mo:base/Principal";
import SHA224 "./lib/SHA224";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Array_ "./lib/Array";
import Error "mo:base/Error";
import Prim "mo:prim"; 

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";
import Debug "mo:base/Debug";
import List "mo:base/List";
import Cycles "mo:base/ExperimentalCycles";

import H "./type/history_interface";

shared({caller = _installer}) actor class Class() : async H.Interface = this {

    private stable var _transactions : [var ?H.Event] = Array.init<?H.Event>(1005000, null);
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();

    private stable var _nextTransaction : Nat32 = 0;
    private stable var _lastDigestedAccount : Nat32 = 0;

    private stable var _prevHistoryCanister : ?Principal = null;

    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _slot : Nft.CanisterSlot = 0;

    private let _transactions_soft_cap: Nat32 = 1000000;

    private stable var _cycles_recieved : Nat = Cycles.balance();

    system func postupgrade() {
        _cycles_recieved := Cycles.balance();
    };

    public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
        _cycles_recieved += accepted;
    };

    public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
    };


    public shared({caller}) func add(eventinfo: H.EventInfo) : async H.AddResponse {

        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));


        _nextTransaction := _nextTransaction + 1;

        if (_transactions_soft_cap == _nextTransaction) {
            try await Cluster.router(_conf).event_history_full() catch (e) { 
                        Debug.print("notification error " #debug_show(Error.message(e)));
            }
        };

        let index = _nextTransaction - 1;
        
        let previousTransactionHash : [Nat8] = switch(index > 0) {
            case (true) switch(_transactions[Nat32.toNat(index - 1)]) {
                case (?x) Blob.toArray(x.hash);
                case (null) [] // Perhaps put hash of last transaction from previous canister (if any)
            };
            case (false) [];
            };


        let event = {
            info = eventinfo;
            hash = Blob.fromArray(SHA224.sha224(
                Array.flatten<Nat8>([
                    previousTransactionHash,
                    H.EventInfo.hash(eventinfo)
                    ])));
        };

        _transactions[Nat32.toNat(index)] := ?event;

        
        let transactionId = Nft.TransactionId.encode(_slot, index);
        transactionId;
    };

    public query func info() : async H.InfoResponse {
        {
            total = _nextTransaction;
            previous = _prevHistoryCanister
        }
    };

    public query func list(request: H.ListRequest) : async H.ListResponse {
        assert((request.to - request.from) <= 100);
        assert(request.to > request.from);
        Array_.amap<?H.Event>(Nat32.toNat(request.to - request.from), func (index: Nat) : ?H.Event { 
            _transactions[Nat32.toNat(request.from + Nat32.fromNat(index))];
        });
    };

    public query func get(idx: H.EventIndex) : async ?H.Event {
        _transactions[Nat32.toNat(idx)];
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

    system func heartbeat() : async () {
       

        if (_nextTransaction != _lastDigestedAccount) {

            switch(_transactions[Nat32.toNat(_lastDigestedAccount)]) {
                case (?t) {
                    await digestAccountNotification(_lastDigestedAccount, t);
                };
                case (_) {
                    ()
                };
            };

            _lastDigestedAccount := _lastDigestedAccount + 1;
            return;
        };


    };

  

    private func digestAccountNotification(txIdx :H.EventIndex, transaction: H.Event) : async () {

        let ids:[Nft.AccountIdentifier] = switch(transaction.info) {
            case (#nft(#transfer({from;to}))) {
                [from,to];
            };
            case (#nft(#burn({user}))) {
                [user];
            };
            case (#nft(#use({user}))) {
                [user];
            };
            case (#nft(#purchase({seller; buyer}))) {
                [seller, buyer];
            };
            case (#nft(#mint({user}))) {
                [user];
            };
            case (#nft(#approve({user}))) {
                [user];
            };
            case (#nft(#socket({user}))) {
                [user];
            };
            case (#nft(#unsocket({user}))) {
                [user];
            };
            case (#pwr(#transfer({from; to}))) {
                [from, to];
            };                                    
            case (#pwr(#withdraw({from; to}))) {
                [from, to];
            };     
            case (#pwr(#mint({user}))) {
                [user];
            };
            case (#anv(#transfer({from; to}))) {
                [from,to];
            };
            case (_) {
                []
            };
        };

        let it = Iter.fromArray(ids);
        for (aid in it) {
            let tx = Nft.TransactionId.encode(_slot, txIdx);
            await Cluster.accountFromAid(_conf, aid).add_transaction(aid, tx);
        };
       
        ();

    };



    public query func stats() : async (Cluster.StatsResponse and { 
        transactions: Nat32;
    }) {
        {
            transactions = _nextTransaction;
          
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