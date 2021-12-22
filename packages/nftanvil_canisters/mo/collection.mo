import Nft "./type/nft_interface";
import Treasury "./type/treasury_interface";
import Ledger  "./type/ledger_interface";

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

import Collection "./type/collection_interface"

shared({caller = _installer}) actor class Class() : async Collection.Interface = this {
    private stable var _conf : Cluster.Config = Cluster.default();

    public shared({caller}) func create(collection: Nft.Collection) : async Collection.CreateResponse {
        #err("Not implemented");
    };

    public query func author_allow(author: Nft.AccountIdentifier, collectionId: Nft.CollectionId) : async Collection.AllowResponse {
        #err("Not implemented");
    };

    public shared({caller}) func mint_nextId(author: Nft.AccountIdentifier, collectionId: Nft.CollectionId) : async Collection.MintNextIdResponse {
        #err("Not implemented");
    };

    public query func socket_allow(request: Nft.SocketRequest, collectionId:Nft.CollectionId) : async Collection.AllowResponse {
        #err("Not implemented");
    };

    public query func info(collectionId: Nft.CollectionId) : async Collection.InfoResponse {
        #err(#NotFound);
    };

}