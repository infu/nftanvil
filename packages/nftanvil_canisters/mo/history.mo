import Nft "./type/nft_interface";
import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import SHA256 "mo:sha/SHA256";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Array_ "./lib/Array";

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";

import H "./type/history_interface";

shared({caller = _installer}) actor class Class() : async H.Interface = this {

    private stable var _tmpEvents : [(H.EventIndex, H.Event)] = [];
    private var _events : HashMap.HashMap<H.EventIndex,  H.Event> = HashMap.fromIter(_tmpEvents.vals(), 0, H.EventIndex.equal, H.EventIndex.hash);

    private stable var _nextEvent : Nat32 = 0;
    private stable var _prevHistoryCanister : ?Principal = null;

    private stable var _conf : Cluster.Config = Cluster.Config.default();

    //Handle canister upgrades
    system func preupgrade() {
        _tmpEvents := Iter.toArray(_events.entries());
    };

    system func postupgrade() {
        _tmpEvents := [];
    };

    public shared({caller}) func add(event: H.Event) : async H.AddResponse {

        switch (event.info) {
            case (#nft(e)) {
                if (Array_.exists(_conf.nft, caller, Principal.equal) == false) return #err(#NotLegitimateCaller);
            };
            case (#pwr(e)) {
                if (Principal.equal(_conf.pwr, caller) == false) return #err(#NotLegitimateCaller);
            };
            case (#anv(e)) {
                if (Principal.equal(_conf.anv, caller) == false) return #err(#NotLegitimateCaller);
            };
            case (#treasury(e)) {
                if (Principal.equal(_conf.treasury, caller) == false) return #err(#NotLegitimateCaller);
            };
        };
        
        let index = _nextEvent;
  
        _events.put(index, event);
        _nextEvent := _nextEvent + 1;
        
        #ok();
    };

    public query func info() : async H.InfoResponse {
        {
            total = _nextEvent;
            previous = _prevHistoryCanister
        }
    };

    public query func list(request: H.ListRequest) : async H.ListResponse {
        Array_.amap<?H.Event>(Nat32.toNat(request.to - request.from), func (index: Nat) : ?H.Event { 
            _events.get(request.from + Nat32.fromNat(index));
        });
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };

}