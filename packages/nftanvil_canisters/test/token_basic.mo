import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Ext "../lib/ext.std/src/Ext";
import Interface "../lib/ext.std/src/Interface";
import Account "../mo/account";

import Dropship "../mo/nft";
import Array_ "../lib/vvv/src/Array"


var NFTcanisterId = "sbzkb-zqaaa-aaaaa-aaaiq-cai";

var someMeta = Blob.fromArray([116, 116, 105, 100]);
var someMemo = Blob.fromArray([111, 111, 111, 111]);

let nft = await Dropship.NFT({_acclist = []; _slot=3; _router=Principal.fromText("aaaaa-aa"); _accesslist=[]; _debug_cannisterId = ?Principal.fromText(NFTcanisterId)});


// Debug.print(Principal.toText(Principal.fromActor(nft))); // BUG: this is not working when we run it from moc command line
actor class WHOWHO() {
    public shared({caller}) func whoAmI() : async Principal {
        return caller;
    };
};
let whoiswho = await WHOWHO();

// we have to initialize, because the object doesn't know its cannisterId when instantiated with a test script
let user_john_principal:Principal = await whoiswho.whoAmI();


let user_john : Ext.User = #principal(user_john_principal);
let user_peter_principal = Principal.fromText("ks5fw-csuji-57tsx-mqld6-bjip7-anp4q-pecol-5k6vo-vzcmw-3wuo2-qqe");
let user_peter : Ext.User = #principal(user_peter_principal);



let user_john_sub1 : Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(user_john_principal, ?[1]));
let user_john_sub2 : Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(user_john_principal, ?[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,210]));

let token_one : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(Principal.fromText(NFTcanisterId), 0);
let token_two : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(Principal.fromText(NFTcanisterId), 1);
let token_three : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(Principal.fromText(NFTcanisterId), 2);
let token_for_burning : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(Principal.fromText(NFTcanisterId), 3);

let token_bad : Ext.TokenIdentifier = Ext.TokenIdentifier.encode(Principal.fromText(NFTcanisterId), 99);

let minter_one = user_john_principal; //Ext.AccountIdentifier.fromPrincipal(user_john_principal, ?[1]);
let minter_two = user_john_principal; // Ext.AccountIdentifier.fromPrincipal(user_john_principal, ?[2]);

Debug.print("john  & current script principal: " # Principal.toText(user_john_principal));
Debug.print("NFTcanisterId: " # NFTcanisterId);
Debug.print("Token one: " # token_one);
Debug.print("Token two: " # token_two);

Debug.print("User john Account Identifier: " # Ext.User.toAccountIdentifier(user_john));
Debug.print("User john Account Identifier sub2: " # Ext.User.toAccountIdentifier(user_john_sub2));


// -- Check Minting & balances

// check johns balance for token 0, should return error, its not created yet
Result.assertErr(await nft.balance({ user  = user_john; token = token_one;}));



// mint token with index 0
assert((await nft.mintNFT({to = user_john; metadata = {
            domain = ?"tralala.com";
            name = ?"Some";
            lore = ?"Other";
            quality= 1;
            use= null;
            hold= null;
            transfer= #unrestricted;
            ttl= null; // time to live
            content= null;
            thumb= #internal({contentType="image/jpeg"; size=123123;idx = null}); 
            attributes=[];
            extensionCanister = null;
            secret=false;
            custom=null;
            tags=[];

            }})
            ) == #ok(0));

// mint token with index 1
assert((await nft.mintNFT({to = user_john; metadata = {
            domain = ?"tralala.com";
            name = ?"Some";
            lore = ?"Other";
            quality= 1;
            use= null;
            hold= null;
            transfer= #unrestricted;
            ttl= null; // time to live
            content= null;
            thumb= #internal({contentType="image/jpeg"; size=123123;idx = null}); 
            attributes=[];
            extensionCanister = null; 
            custom=null;
            tags=[];
            secret=false
}})) == #ok(1));


// mint token with index 2 to peter
switch(await nft.mintNFT({to = user_john; metadata = {
            domain = ?"tralala.com";
            name = ?"Some";
            lore = ?"Other";
            quality= 1;
            use= null;
            hold= null;
            transfer= #unrestricted;
            ttl= null; // time to live
            content= null;
            thumb= #internal({contentType="image/jpeg"; size=123123;idx = null}); 
            attributes=[];
            extensionCanister = null;
            secret=false;
            custom=null;
            tags=[];
            }})) {
    case (#ok(x)) if (x != 2) Debug.print(debug_show(x));
    case (#err(e)) Debug.print(debug_show(e));
};

// mint token for burning later
assert((await nft.mintNFT({to = user_john; metadata = {
            domain = ?"tralala.com";
            name = ?"Some";
            lore = ?"Other";
            quality= 1;
            use= null;
            hold= null;
            transfer= #unrestricted;
            ttl= null; // time to live
            content= null;
            thumb= #internal({contentType="image/jpeg"; size=123123;idx = null}); 
            attributes=[];
            extensionCanister = null;
            custom=null;
            tags=[];
        secret=false
}})) == #ok(3));

// check balance of john for token one 
assert( (await nft.balance({ user  = user_john; token = token_one;})) == #ok(1));


// check balance of john for token two 
assert( (await nft.balance({ user  = user_john; token = token_two;})) == #ok(1));

// -- Check transfers 

// try to transfer token one with ammount 0
Result.assertErr( (await nft.transfer({ from  = user_peter; to = user_john; token = token_one; amount = 0; memo = someMemo; notify=true; subaccount = null })) );

// try to transfer token one with ammount 2
Result.assertErr( (await nft.transfer({ from  = user_peter; to = user_john; token = token_one; amount = 2; memo = someMemo; notify=true; subaccount = null })) );

// try to transfer token one  peter to john while peter doesn't have it
Result.assertErr( (await nft.transfer({ from  = user_peter; to = user_john; token = token_one; amount = 1; memo = someMemo; notify=true; subaccount = null })) );

// transfer token one from john to peter
assert( (await nft.transfer({ from  = user_john; to = user_peter; token = token_one; amount = 1; memo = someMemo; notify=true; subaccount = null })) == #ok(1) );

// check balance of john for token one, should be zero
assert( (await nft.balance({ user  = user_john; token = token_one;})) == #ok(0));

// check balance of peter for token one, should be one
assert( (await nft.balance({ user  = user_peter; token = token_one;})) == #ok(1));

// try to transfer token one from peter to john while john is the one calling transfer method
Result.assertErr( (await nft.transfer({ from  = user_peter; to = user_john; token = token_one; amount = 1; memo = someMemo; notify=true; subaccount = null })) );

// -- Approve

// john trying to set allowance for token one without having it, should raise error
assert( (await nft.approve({token = token_one; spender = user_peter_principal; subaccount = null; allowance = 1})) == #err(#InsufficientBalance) );

// john trying to set allowance for token two is okey
assert( (await nft.approve({token = token_two; spender = user_peter_principal; subaccount = null; allowance = 1})) == #ok() );


// -- Allowance

// check allowance of previously approved token - principal
assert( (await nft.allowance({token = token_two; owner = user_john; spender = user_peter_principal})) == #ok(1) );

// john trying to set allowance for token two to himself, which will clear the allowance to previously allowed principle
assert( (await nft.approve({token = token_two; spender = user_john_principal; subaccount = null; allowance = 1})) == #ok() );

// check if we cleared the allowance successfuly
assert( (await nft.allowance({token = token_two; owner = user_john; spender = user_peter_principal})) == #ok(0) );

// check allowance for a pair we didn't approve
assert( (await nft.allowance({token = token_one; owner = user_john; spender = user_john_principal})) == #ok(0) );

// -- Subaccounts 

// check balance of john subaccount 1 for token two 
assert( (await nft.balance({ user  = user_john_sub1; token = token_two;})) == #ok(0));

// transfer to sub account  
assert( (await nft.transfer({ from  = user_john; to = user_john_sub1; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = null })) == #ok(1) );

// check balance of john subaccount 1 for token two 
assert( (await nft.balance({ user  = user_john_sub1; token = token_two;})) == #ok(1));

// check balance of john main account for token two 
assert( (await nft.balance({ user  = user_john; token = token_two;})) == #ok(0));

// transfer the token back to main account
assert( (await nft.transfer({ from  = user_john_sub1; to = user_john; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = ?[1] })) == #ok(1) );

// check balance of john main account for token two 
assert( (await nft.balance({ user  = user_john; token = token_two;})) == #ok(1));



// -- We simulate different caller, so we do some proper checks of methods like 'transfer' and 'approve' which depend on it


var user_infu : Ext.User = user_john;  // Infu is John's brother. He will hack a bit and spoof caller.
var user_infu_principal : Principal = user_john_principal; 


actor class Infu() { // all methods in this actor will have their own principal dfferent from the main thread

    public shared({caller}) func run_one() : async () {
        user_infu_principal := await whoiswho.whoAmI();
        Debug.print("Infu's Principal: " # Principal.toText(user_infu_principal));
 
        user_infu := #address(Ext.AccountIdentifier.fromPrincipal(user_infu_principal, null));
        Debug.print("Infu's AccountIdentifier: " # Ext.User.toAccountIdentifier(user_infu));
    };

    public shared({caller}) func run_two () : async () {
        assert ( (await nft.transfer({ from = user_infu; to = user_john; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = null })) == #ok(1) );
    };

    public shared({caller}) func run_three () : async () {
        // Debug.print(debug_show( (await nft.transfer({ from = user_john; to = user_peter; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = null }))));
        assert ( (await nft.transfer({ from = user_john; to = user_peter; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = null })) == #ok(1) );
    };
}; 

let infu = await Infu();
await infu.run_one(); 

// lets move the NFT from John to Infu
assert( (await nft.transfer({ from  = user_john; to = user_infu; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = null })) == #ok(1) );

// check balance of infus main account for token two 
assert( (await nft.balance({ user  = user_infu; token = token_two;})) == #ok(1));

// John tries to steal infus token 
Result.assertErr( (await nft.transfer({ from  = user_infu; to = user_john; token = token_two; amount = 1; memo = someMemo; notify=true; subaccount = null })));

// Infu sends its back to John
await infu.run_two();


// John checks his balance and finds the token 
assert( (await nft.balance({ user  = user_john; token = token_two;})) == #ok(1));

// John approves allowance for token two for infu's principal
assert( (await nft.approve({token = token_two; spender = user_infu_principal; subaccount = null; allowance = 1})) == #ok() );

// Infu sends that token from john to peter
await infu.run_three();

// John finds the token in Peter's balance
assert( (await nft.balance({ user  = user_peter; token = token_two;})) == #ok(1));

// -- Bearer 
// check token two it must be in peter
assert( (await nft.bearer(token_two)) == #ok(Ext.User.toAccountIdentifier(user_peter)));

// check token one it must be in peter too
assert( (await nft.bearer(token_one)) == #ok(Ext.User.toAccountIdentifier(user_peter)));

// check token one it must be in john
assert( (await nft.bearer(token_three)) == #ok(Ext.User.toAccountIdentifier(user_john)));

// check bearer of token index 99 which doesn't exist
assert( (await nft.bearer(token_bad)) == #err(#InvalidToken(token_bad)));

// check supply for  index 99 which doesn't exist
assert( (await nft.supply(token_bad)) == #err(#InvalidToken(token_bad)));

// check supply for token one, should be 1
assert( (await nft.supply(token_one)) ==  #ok(1));

// check supply for token two, should be 1
assert( (await nft.supply(token_two)) ==  #ok(1));

// - Metadata
 
Debug.print(debug_show( (await nft.metadata(token_two)) )); 


// - Owned
// let owned = (await nft.owned(user_john));


// Debug.print(debug_show( owned ));
// -- Burn & Stats
var stats = await nft.stats();
assert(stats.burned == 0);
assert(stats.minted == 4);
assert(stats.transfers == 6);

// burn the token
assert( (await nft.burn({ user = user_john; token = token_for_burning; amount = 1; memo = someMemo; notify=true; subaccount = null })) == #ok(1));

// get new stats
stats := await nft.stats();
assert(stats.burned == 1);

// check token bearer
assert( (await nft.bearer(token_for_burning)) == #err(#InvalidToken(token_for_burning)) );


// -- Batch mintNFT 
// func iterate<A>(
//     xs : Iter.Iter<A>,
//     f : (A, Nat) -> ()
//   ) {
//     var i = 0;
//     label l loop {
//       switch (xs.next()) {
//         case (?next) {
//           f(next, i);
//         };
//         case (null) {
//           break l;
//         };
//       };
//       i += 1;
//       continue l;
//     };
//   };


// Debug.print(debug_show( amap<Nat>(10, func (x:Nat) :Nat {x *1 }) ))

// let aaa = Iter.toArray(Iter.map(Iter.range(1, 3), func (x : Nat) : Nat { 
// {to = user_john; minter = minter_one; metadata = someMeta; TTL = null}

//  }));
// Debug.print(debug_show(aaa));
// let batch = Iter.map<Nat,Ext.NonFungible.MintRequest>( Iter.range(0,2), func (x : Nat) : Ext.NonFungible.MintRequest { 
//      return {to = user_john; minter = minter_one; metadata = someMeta; TTL = null};
   
//     });

// let batch = Array_.amap<Ext.NonFungible.MintRequest>(50, func(x) { {to = user_john; minter = minter_one; metadata = someMeta; TTL = null}  });

// let minted = await nft.mintNFT_batch(batch);
// ignore await nft.mintNFT_batch(batch);
// ignore await nft.mintNFT_batch(batch);

Debug.print(debug_show( (await nft.stats()) ));
Debug.print("DONE TOKEN BASICS");
// - Transfer Notifications? (maybe later)

// NOTE: when one needs to see output: Debug.print(debug_show( anything )); 
