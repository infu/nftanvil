import Debug "mo:base/Debug";
import Nat  "mo:base/Nat";
import Nat32  "mo:base/Nat32";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Result "mo:base/Result";

// import Random "mo:base/Random";

import PseudoRandom "../lib/vvv/src/PseudoRandom";
import Captcha "../lib/vvv/src/Captcha";

 
shared(install) actor class AccessControl() {
    
    public type User = {
          solution  : Text; 
          balance : Nat;
      };

    public type CommonError = {
        #NotEnough;
        #WrongSolution;
    };

    var rand = PseudoRandom.PseudoRandom();

    private stable var _tmpAccount : [(Principal, User)] = [];
    private var _account : HashMap.HashMap<Principal, User> = HashMap.fromIter(_tmpAccount.vals(), 0, Principal.equal, Principal.hash);
    
    private stable var _admin : Principal = install.caller; 

    private stable var _consumers: [Principal] = [Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai")];

    private stable var _reward:Nat = 10;

    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := Iter.toArray(_account.entries());
    };

    system func postupgrade() {
        _tmpAccount := [];
    };

    // This function is called by the canister which requires access tokens
    public query func getBalance(acc:Principal): async (Nat) {
      //  if (balances[principal] < count ) return false; else return true;
     switch(_account.get(acc)) {
        case (?a) {
          a.balance;
        };
        case (_) {
          0
        };
     }

    };


    // If the principal has enough, then this function is called to remove access tokens from their balance
    public shared({caller}) func consumeAccess(acc:Principal, count:Nat): async Result.Result<Bool, CommonError> {
      
      // WARNING UNCOMMENT THAT
      // assert((caller == _admin) or (switch( Array.find(_consumers, func(x:Principal) : Bool { x == caller } ) ) { case (?a) true; case (_) false; }) );

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

       //if (solutions[principal] == correct) add_tokens(principal,3);
       //delete solutions[principal]
     
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

  
}