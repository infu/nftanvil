// Anvil NFT collection
import Anvil "./type/anvil_interface";
import Nft "./type/nft_interface";
import Cluster  "./type/Cluster";
import Pwr "./type/pwr_interface";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";


shared({caller = _installer}) actor class Class() : async Anvil.Interface = this {

  type TokenIdentifier = Nft.TokenIdentifier;

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();


   public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
        
    };

   public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
    };

     public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
        // _cycles_recieved += accepted;
    };
    
}

