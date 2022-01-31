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
    private var _events : AssocList.AssocList<H.EventIndex, H.Event> = List.nil<(H.EventIndex, H.Event)>(); //= HashMap.fromIter(_tmpEvents.vals(), 0, H.EventIndex.equal, H.EventIndex.hash)

    private stable var _nextEvent : Nat32 = 0;
    private stable var _prevHistoryCanister : ?Principal = null;

    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _slot : Nft.CanisterSlot = 0;

    // //Handle canister upgrades
    // system func preupgrade() {
    //     _tmpEvents := Iter.toArray(_events.entries());
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
        
        let index = _nextEvent;
        
        let previousTransactionHash : [Nat8] = switch(index > 0) {
            case (true) switch(AssocList.find(_events, index - 1, H.EventIndex.equal)) {
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

        let (newEvents, _) = AssocList.replace(_events, index, H.EventIndex.equal, ?event); //_events.put(index, event);
        _events := newEvents;
        _nextEvent := _nextEvent + 1;

        let transactionId = H.TransactionId.encode(_slot, index);
        transactionId;
    };

    public query func info() : async H.InfoResponse {
        {
            total = _nextEvent;
            previous = _prevHistoryCanister
        }
    };

    public query func list(request: H.ListRequest) : async H.ListResponse {
        Array_.amap<?H.Event>(Nat32.toNat(request.to - request.from), func (index: Nat) : ?H.Event { 
            AssocList.find<H.EventIndex, H.Event>(_events, Nat32.fromNat(index), H.EventIndex.equal)
            //_events.get(request.from + Nat32.fromNat(index));
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

}