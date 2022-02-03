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

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";
import Debug "mo:base/Debug";
import List "mo:base/List";

import H "./type/history_interface";

shared({caller = _installer}) actor class Class() : async H.Interface = this {

    // private stable var _tmpEvents : [(H.EventIndex, H.Event)] = [];
    private stable var _transactions : AssocList.AssocList<H.EventIndex, H.Event> = List.nil<(H.EventIndex, H.Event)>(); //= HashMap.fromIter(_tmpEvents.vals(), 0, H.EventIndex.equal, H.EventIndex.hash)

    private stable var _nextTransaction : Nat32 = 0;
    private stable var _lastDigestedAccount : Nat32 = 0;
    private stable var _lastDigestedAnvil : Nat32 = 0;

    private stable var _prevHistoryCanister : ?Principal = null;

    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _slot : Nft.CanisterSlot = 0;

    // //Handle canister upgrades
    // system func preupgrade() {
    //     _tmpEvents := Iter.toArray(_transactions.entries());
    // };

    // system func postupgrade() {
    //     _tmpEvents := [];
    // };

    public shared({caller}) func add(eventinfo: H.EventInfo) : async H.AddResponse {

        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        // assert(switch (eventinfo) {
        //     case (#nft(e)) {
        //         Array_.exists(_conf.nft, caller, Principal.equal) == true
        //     };
        //     case (#pwr(e)) {
        //         Principal.equal(_conf.pwr, caller) == true
        //     };
        //     case (#anv(e)) {
        //         Principal.equal(_conf.anv, caller) == true
        //     };
        //     case (#treasury(e)) {
        //         Principal.equal(_conf.treasury, caller) == true
        //     };
        // });
        
        let index = _nextTransaction;
        
        let previousTransactionHash : [Nat8] = switch(index > 0) {
            case (true) switch(AssocList.find(_transactions, index - 1, H.EventIndex.equal)) {
                case (?x) Blob.toArray(x.hash);
                case (_) [] // Perhaps put hash of last transaction from previous canister (if any)
            };
            case (false) [];
            };

        // Debug.print(debug_show(previousTransactionHash));

        let event = {
            info = eventinfo;
            hash = Blob.fromArray(SHA224.sha224(
                Array.flatten<Nat8>([
                    previousTransactionHash,
                    H.EventInfo.hash(eventinfo)
                    ])));
        };

        let (newEvents, _) = AssocList.replace(_transactions, index, H.EventIndex.equal, ?event); //_transactions.put(index, event);
        _transactions := newEvents;
        _nextTransaction := _nextTransaction + 1;

        let transactionId = H.TransactionId.encode(_slot, index);
        transactionId;
    };

    public query func info() : async H.InfoResponse {
        {
            total = _nextTransaction;
            previous = _prevHistoryCanister
        }
    };

    public query func list(request: H.ListRequest) : async H.ListResponse {
        Array_.amap<?H.Event>(Nat32.toNat(request.to - request.from), func (index: Nat) : ?H.Event { 
            AssocList.find<H.EventIndex, H.Event>(_transactions, request.from + Nat32.fromNat(index), H.EventIndex.equal)
            //_transactions.get(request.from + Nat32.fromNat(index));
        });
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
       
        Debug.print("heartbeat");

        await digestTransactions();

    };

    private func digestTransactions() : async () {

        if (_nextTransaction != _lastDigestedAccount) {

            switch(AssocList.find(_transactions, _lastDigestedAccount, H.EventIndex.equal)) {
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

        if (_nextTransaction != _lastDigestedAnvil) {

            switch(AssocList.find(_transactions, _lastDigestedAnvil, H.EventIndex.equal)) {
                case (?t) {
                    await digestAnvilNotification(_lastDigestedAnvil, t);
                };
                case (_) {
                    ()
                };
            };

            _lastDigestedAnvil := _lastDigestedAnvil + 1;
            return;
        }

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
            let tx = H.TransactionId.encode(_slot, txIdx);
            await Cluster.accountFromAid(_conf, aid).add_transaction(aid, tx);
        };
       
        ();

    };


    private func digestAnvilNotification(txIdx :H.EventIndex, transaction: H.Event) : async () {

        switch(transaction.info) {
            case (#nft(#mint({user; pwr}))) {
               await Cluster.anv(_conf).reward({user; spent=pwr});
            };
            case (_) {
               ();
            };
        };

    };

}