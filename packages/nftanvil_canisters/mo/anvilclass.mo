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

import AnvilClass "./type/class_interface"

shared({caller = _installer}) actor class Class({_admin: Principal; _router: Principal}) : async AnvilClass.Interface = this {


    public query func minter_allow(minter: Nft.AccountIdentifier, classId: Nft.AnvilClassId) : async AnvilClass.AllowResponse {
        #err("Not implemented");
    };

    public shared({caller}) func mint_nextId(minter: Nft.AccountIdentifier, classId: Nft.AnvilClassId) : async AnvilClass.MintNextIdResponse {
        #err("Not implemented");

    };

    public query func socket_allow(request: Nft.SocketRequest, classId:Nft.AnvilClassId) : async AnvilClass.AllowResponse {
        #err("Not implemented");
    };

    public query func info(classId: Nft.AnvilClassId) : async AnvilClass.InfoResponse {
        #err(#NotFound);
    };

   

}