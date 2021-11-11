import Debug "mo:base/Debug";
import Nat  "mo:base/Nat";
import Nat32  "mo:base/Nat32";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Result "mo:base/Result";


import PseudoRandom "../lib/vvv/src/PseudoRandom";
import Captcha "../lib/vvv/src/Captcha";
import Cycles "mo:base/ExperimentalCycles";

import Prim "mo:prim"; 

 
shared({caller = intaller}) actor class AccessControl({_admin: Principal}) {
    
    public type User = {
          solution  : Text; 
          balance : Nat;
      };

    public type CommonError = {
        #NotEnough;
        #WrongSolution;
        #Unauthorized;
    };

    var rand = PseudoRandom.PseudoRandom();

    private stable var _tmpAccount : [(Principal, User)] = [];
    private var _account : HashMap.HashMap<Principal, User> = HashMap.fromIter(_tmpAccount.vals(), 0, Principal.equal, Principal.hash);
    
    private stable var _tmpConsumers : [(Principal, Bool)] = [];
    private var _consumers : HashMap.HashMap<Principal, Bool> = HashMap.fromIter(_tmpConsumers.vals(), 0, Principal.equal, Principal.hash );
   
    private stable var _reward:Nat = 10;

    //Handle canister upgrades
    system func preupgrade() {
        _tmpConsumers := Iter.toArray(_consumers.entries());
        _tmpAccount := Iter.toArray(_account.entries());
    };

    system func postupgrade() {
        _tmpConsumers := [];
        _tmpAccount := [];
    };

    // This function is called by the canister which requires access tokens
    public query func getBalance(acc:Principal): async (Nat) {
     switch(_account.get(acc)) {
        case (?a) {
          a.balance;
        };
        case (_) {
          0
        };
     }
    };

    // list of allowed nft canisters which can add/rem to account                                     
    public shared ({caller}) func addAllowed(p: Principal) : async () {
        assert(caller == intaller);
        _consumers.put(p, true);
    };

    // If the principal has enough, then this function is called to remove access tokens from their balance
    public shared({caller}) func consumeAccess(acc:Principal, count:Nat): async Result.Result<Bool, CommonError> {
      
      switch (_consumers.get(caller)) {
        case (?found) {
           switch(_account.get(acc)) {
            case (?a) {
              if (a.balance < count) return #err(#NotEnough);
              let newData : User = {
                balance = a.balance - count;
                solution = a.solution;
              };
              _account.put(acc, newData);
              #ok(true);
            };
            case (_) #err(#NotEnough)
          };
        };
        case (_) {
          #err(#Unauthorized);
        }
      }
    };

    // When a principal wants to earn access tokens, they get a challege, which they need to solve and return to sendChallenge
    public shared({caller}) func getChallenge(): async [Nat32] {
      let (correct, bitmap) = Captcha.randCaptcha(rand, 5);

      let newData = switch(_account.get(caller)) {
        case (?a) {
           {
            balance = a.balance;
            solution = correct;
          }
        };
        case (_) {
          {
            balance = 0;
            solution = correct;
          }
        }
      };

      _account.put(caller, newData);
      return bitmap;
    };

    // User sends solution to the challenge given to them and if correct, they recieve access tokens
    public shared({caller}) func sendSolution(solution:Text): async Result.Result<Nat, CommonError> {

     switch(_account.get(caller)) {
        case (?a) {
          if ((a.solution != "") and (a.solution != solution)) return #err(#WrongSolution);
          let newData : User = {
            balance = a.balance + _reward;
            solution = "";
          };
          _account.put(caller, newData);
          #ok(newData.balance);
        };
        case (_) #err(#NotEnough)
      };

    };

    // The adminitrator can add access tokens to principal manually
    public shared({caller}) func addTokens(acc:Principal, count:Nat): async () {
      assert(caller == _admin);

      let newData:User = {
        balance = count; 
        solution = "";
        };

      _account.put(acc, newData);

    };

    // Admin will reset the whole memory when it goes big
    public shared({caller}) func reset(): async () {
        assert(caller == _admin);
        var _tmp : [(Principal, User)] = [];
        _account := HashMap.fromIter(_tmp.vals(), 0, Principal.equal, Principal.hash);

    };

  
    public type StatsResponse = {
        cycles: Nat;
        rts_version:Text;
        rts_memory_size:Nat;
        rts_heap_size:Nat;
        rts_total_allocation:Nat;
        rts_reclaimed:Nat;
        rts_max_live_size:Nat;
    };


    public query func stats() : async StatsResponse {
        {
            cycles = Cycles.balance();
            rts_version = Prim.rts_version();
            rts_memory_size = Prim.rts_memory_size();
            rts_heap_size = Prim.rts_heap_size();
            rts_total_allocation = Prim.rts_total_allocation();
            rts_reclaimed = Prim.rts_reclaimed();
            rts_max_live_size = Prim.rts_max_live_size();
        }
    };
}