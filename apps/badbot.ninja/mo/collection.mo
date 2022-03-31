import Anvil "mo:anvil/type/anvil_interface";
import Nft "mo:anvil/type/nft_interface";
import Cluster  "mo:anvil/type/Cluster";
import Pwr "mo:anvil/type/pwr_interface";
import Array "mo:base/Array";
import TrieRecord "mo:anvil/lib/TrieRecord";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import IF "./if";

shared({caller = _installer}) actor class Class() : async IF.Interface = this {

}