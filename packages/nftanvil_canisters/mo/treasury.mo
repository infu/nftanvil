import Nft "./type/nft_interface";
import Treasury "./type/treasury_interface";
import Ledger  "./type/ledger_interface";

import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Array_ "./lib/Array";

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";


shared({caller = _installer}) actor class Class() = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();

  public shared({caller}) func config_set(conf : Cluster.Config) : async () {
      assert(caller == _installer);
      _conf := conf
  };

  
}