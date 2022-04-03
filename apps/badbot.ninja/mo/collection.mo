import Nft "mo:anvil/type/nft_interface";

import IF "./if";
import Anvil "mo:anvil/base/Anvil";

shared({caller = _installer}) actor class Class() : async IF.Interface = this {

  private let anvil = Anvil.Anvil();
  
  public shared({caller}) func check_tx(tx:  Nft.TransactionId) : async ?Nft.Transaction {
    return await anvil.getTransaction(tx);
  };

};


// import Cluster  "mo:anvil/type/Cluster";
// import Pwr "mo:anvil/type/pwr_interface";
// import TrieRecord "mo:anvil/lib/TrieRecord";

// import Array "mo:base/Array";
// import Iter "mo:base/Iter";
// import Time "mo:base/Time";
// import Result "mo:base/Result";
// import Blob "mo:base/Blob";
// import Debug "mo:base/Debug";