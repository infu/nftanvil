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
import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";

import History "./type/history_interface";

shared({caller = _installer}) actor class Class() : async History.Interface = this {
    private stable var _conf : Cluster.Config = Cluster.Config.default();

    public shared({caller}) func add(request: History.AddRequest) : async History.AddResponse {
        #ok();
    };

    public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
    };

}