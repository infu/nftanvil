//import Canister "canister:sbzkb-zqaaa-aaaaa-aaaiq-cai";
import C "mo:matchers/Canister";
import M "mo:matchers/Matchers";
import T "mo:matchers/Testable";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";

import Ext "mo:std/Ext";
import Interface "mo:std/Interface";

actor {
    var it = C.Tester({ batchSize = 2 });

   
    public shared func test() : async Text {
          var canisterId = "sbzkb-zqaaa-aaaaa-aaaiq-cai";

          let Canister = actor(canisterId) : Interface.NonFungibleToken;
      
          func checkBalance (canisterId:Text, principalText: Text, tokenIndex : Ext.TokenIndex, mustBe: Ext.Balance) : async C.TestResult {
          
            let Canister = actor(canisterId) : Interface.NonFungibleToken;

            let p = Principal.fromText(principalText);
            let us : Ext.User = #principal(p);

            let c = Principal.fromText(canisterId);
            let ti : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(c, tokenIndex);

            let req : Ext.Core.BalanceRequest = { 
              user  = us; 
              token = ti;
            };
            
            switch( await Canister.balance(req) ) {
                case(#ok(bal:Ext.Balance)) {
                    if (bal == mustBe) {
                      #success()
                    }
                    else {
                      #fail("recieved wrong balance " # Nat.toText(bal));
                    }
                };
                case(#err(e)) { #fail("balance method returned error") }
            };

       };
    
        it.should("TokenIdentifier functions should work", func () : async C.TestResult {
          let count:Nat32 = 15;
          let c = Principal.fromText(canisterId);
          let ti : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(c, count);
           switch (Ext.TokenIdentifier.decode(ti)) {
                case (#ok(cannisterId, tokenIndex)) {
                    if (Principal.equal(cannisterId, c) == true and count == tokenIndex ) {
                      #success();
                      } else {
                      #fail("fail");
                      }
                };
                case (_) {
                  #fail("fail");
                };
            };
           });
      
    
   
        it.should("balance check", func () : async C.TestResult {
           await checkBalance(canisterId, "oqtwf-pmlo4-pgvqe-wg4xh-qkrlc-g6t5c-ga6tt-5cyi7-ih2rw-t423u-oae", 5, 10);

        });

       

        await it.runAll()
    }
}
