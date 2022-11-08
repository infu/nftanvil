import Nft "./type/nft_interface";
import Pwr "./type/pwr_interface";
import Ledger  "./type/ledger_interface";

import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Int32 "mo:base/Int32";

import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import Result "mo:base/Result";
import Painless "./lib/Painless";

import Array "mo:base/Array";
import Array_ "./lib/Array";

import Blob "mo:base/Blob";
import Cluster  "./type/Cluster";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim"; 
import Debug "mo:base/Debug";
import Tr "./type/tokenregistry_interface";

shared({caller = _installer}) actor class Class() : async Tr.Interface = this {

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
  private stable var _cycles_recieved : Nat = Cycles.balance();
  private stable var _slot : Nft.CanisterSlot = 0;

  private stable var _tmpAccount: [(AccountIdentifier, Pwr.AccountRecordSerialized)] = [];

  private stable var _total_tokens : Nat = 0;

  type AccountIdentifier = Nft.AccountIdentifier;
  type TokenIdentifier = Nft.TokenIdentifier;
  type TokenIndex = Nft.TokenIndex;
  type Slot = Nft.CanisterSlot;

  type FTokenId = Nft.FTokenId;
  
  type State = {
      #v1 : [var ?Tr.FTokenInfo]
  };

  stable var _storedState : State = #v1(Array.init<?Tr.FTokenInfo>(100000, null)); 
  let _state = switch(_storedState) { case (#v1(st)) st; case (_) Debug.trap("Unexpected stored state") };


  //Handle canister upgrades
  system func preupgrade() {

  };

  system func postupgrade() {
        _cycles_recieved := Cycles.balance();
  };

  //==========================
 
 
    public shared({caller}) func register(options: Tr.RegisterRequest) : async Tr.RegisterResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller) or caller == Principal.fromText("b7ihm-iv47w-qsaly-gzhrn-ycz2y-d46ml-tttpj-mygjd-5evvp-h3xsv-jqe"));

        let id = _total_tokens + 1;
        _total_tokens += 1;

        let {symbol; name; desc; decimals; transferable; fee; image; kind; origin; controller} = options;
    
        let token : Tr.FTokenInfo = {
            symbol; name; desc; decimals; transferable; fee; image; kind; origin; 
            controller;
            var total_supply = 0;
            var accounts = 0;
            var mintable = true;
        };
        
        _state[id] := ?token;

        #ok(Nat64.fromNat(id));
    };

    public shared({caller}) func mint({id: FTokenId; aid: Nft.AccountIdentifier; amount:Nat64; mintable:Bool} : Tr.MintRequest) : async Tr.MintResponse {
        let t = switch(_state[Nat64.toNat(id)]) { case (?x) x; case(_) return #err("Token doesn't exist"); };

        if (t.mintable != true) return #err("Not mintable");
        if (t.controller != caller and Nft.APrincipal.isLegitimate(_conf.space, caller) == false) return #err("Not token controller");

        await Cluster.pwrFromAid(_conf, aid).ft_mint({id; aid; amount; kind = t.kind});
        
        let transactionId = await Cluster.history(_conf).add(#ft(#mint({token = id; created=Time.now(); user=aid; amount=amount})));
        
        t.total_supply += amount;
        t.mintable := mintable;

        #ok({transactionId});
    };




    public query func meta(id: FTokenId) : async Tr.FTMeta {
        let ?t = _state[Nat64.toNat(id)];
        {
            symbol = t.symbol;
            name = t.name;
            origin = t.origin;
            kind = t.kind;
            desc = t.desc;
            decimals = t.decimals;
            transferable = t.transferable;
            fee = t.fee;
            mintable = t.mintable;
            total_supply = t.total_supply;
            controller = t.controller;
        }
    };

    public query func token_logistics(id: FTokenId) : async Tr.FTLogistics {
        let ?t= _state[Nat64.toNat(id)];

        return {
            transferable = t.transferable;
            fee = t.fee;
            kind = t.kind;
        };
    };



    // Painless HTTP response - Start
  
    public query func http_request(request : Painless.Request) : async Painless.Response {
     
        let tid = switch(Hex.decode(Text.trimStart(request.url, #text("/")))) {
                case (#ok(bytes)) {
                     Nat32.toNat(Blob_.bytesToNat32(bytes));
                };
                case (#err(e)) {
                    Debug.trap("Bad url");
                }
            };

        let data = switch(_state[tid]) {
                case (?tinfo) tinfo.image;
                case (_) Debug.trap("Doesn't exist");
        };

        return {
            body               = data;
            headers            = [ ("Content-type", "image/png"), ("Cache-control", "public,max-age=31536000,immutable"), ("Access-Control-Allow-Origin","*") ];
            streaming_strategy = null;
            status_code        = 200;
        }

    };
    
    
    // Painless HTTP response - End



  // Cluster functions

  public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
        _cycles_recieved += accepted;
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


  public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
  };


  public query func stats() : async (Cluster.StatsResponse and {

    }) {
        {
            cycles = Cycles.balance();
            cycles_recieved = _cycles_recieved;
            rts_version = Prim.rts_version();
            rts_memory_size = Prim.rts_memory_size();
            rts_heap_size = Prim.rts_heap_size();
            rts_total_allocation = Prim.rts_total_allocation();
            rts_reclaimed = Prim.rts_reclaimed();
            rts_max_live_size = Prim.rts_max_live_size();
        }
    };

}