// Replace these paths with normal ones coming from vessel packages
import Ext "../../../packages/nftanvil_canisters/lib/ext.std/src/Ext";
import Interface "../../../packages/nftanvil_canisters/lib/ext.std/src/Interface";
import Extension "../../../packages/nftanvil_canisters/lib/ext.std/src/Extension.mo";
//

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

shared({caller = _installer}) actor class Extension.Interface() = this {

    public query func http_request(request : Painless.Request) : async Painless.Response {

    }

}