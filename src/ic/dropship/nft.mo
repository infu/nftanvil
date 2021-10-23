import Ext "../lib/ext.std/src/Ext";
import Interface "../lib/ext.std/src/Interface";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Int32 "mo:base/Int32";

import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
// import Debug "mo:base/Debug";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";

import Cycles "mo:base/ExperimentalCycles";

import PseudoRandom "../lib/vvv/src/PseudoRandom";
import Blob "mo:base/Blob";
import Array_ "../lib/vvv/src/Array";
import Prim "mo:prim"; 
import AccessControl "../accesscontrol/access";

shared({caller = _owner}) actor class NFT() : async Interface.NonFungibleToken = this {

    // TYPE ALIASES
    type AccountIdentifier = Ext.AccountIdentifier;
    type Balance = Ext.Balance;
    type TokenIdentifier = Ext.TokenIdentifier;
    type TokenIndex = Ext.TokenIndex;
    type User = Ext.User;
    type CommonError = Ext.CommonError;
    type Metadata = Ext.Metadata;
    type Metavars = Ext.Metavars;
    type MetavarsOut = Ext.MetavarsFrozen;


    type BalanceRequest = Ext.Core.BalanceRequest;
    type BalanceResponse = Ext.Core.BalanceResponse;
    type TransferRequest = Ext.Core.TransferRequest;
    type TransferResponse = Ext.Core.TransferResponse;

    // Internal types
    public type BalanceIntError = {
        #InvalidToken : TokenIdentifier;
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #CannotNotify : AccountIdentifier;
        #Other        : Text;
    };

    let ACCESSCONTROL = actor "r7inp-6aaaa-aaaaa-aaabq-cai" : AccessControl.AccessControl;
    let ROUTER = actor "rkp4c-7iaaa-aaaaa-aaaca-cai" : actor {
        reportOutOfMemory : shared () -> async ();
    };

    type BalanceInt = Result.Result<(User,TokenIndex,Balance,Balance),BalanceIntError>;

    // STATE 
    private stable var _tmpBalance : [(TokenIndex, AccountIdentifier)] = [];
    private var _balance : HashMap.HashMap<TokenIndex, AccountIdentifier> = HashMap.fromIter(_tmpBalance.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _tmpMeta : [(TokenIndex, Metadata)] = [];
    private var _meta : HashMap.HashMap<TokenIndex, Metadata> = HashMap.fromIter(_tmpMeta.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _tmpMetavars : [(TokenIndex, Metavars)] = [];
    private var _metavars : HashMap.HashMap<TokenIndex, Metavars> = HashMap.fromIter(_tmpMetavars.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _tmpAllowance : [(TokenIndex, Principal)] = [];
    private var _allowance : HashMap.HashMap<TokenIndex, Principal> = HashMap.fromIter(_tmpAllowance.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _tmpAccount : [(AccountIdentifier, [TokenIndex])] = [];
    private var _account : HashMap.HashMap<AccountIdentifier, [TokenIndex]> = HashMap.fromIter(_tmpAccount.vals(), 0, Ext.AccountIdentifier.equal, Ext.AccountIdentifier.hash);

    private stable var _tmpChunk : [(Nat32, Blob)] = [];
    private var _chunk : HashMap.HashMap<Nat32, Blob> = HashMap.fromIter(_tmpChunk.vals(), 0, Nat32.equal, func (x:Nat32) : Nat32 { x });

    // private stable var _minter : Principal  = install.caller; 

    private stable var _cannisterId : ?Principal = null;

    private stable var _nextTokenId : Nat32 = 0;
    private stable var _nextChunkId : Nat32 = 0;

    private stable var _statsCollections : Nat32  = 0;
    private stable var _statsAccounts : Nat32  = 0;
    private stable var _statsTransfers : Nat32  = 0;
    private stable var _statsBurned : Nat32 = 0;

    private stable var _available : Bool = true;

    var rand = PseudoRandom.PseudoRandom();

    private let thresholdMemory = 214748364; //8; //  ~2GB

    //Handle canister upgrades
    system func preupgrade() {
        _tmpBalance := Iter.toArray(_balance.entries());
        _tmpAllowance := Iter.toArray(_allowance.entries());
        _tmpMeta := Iter.toArray(_meta.entries());
        _tmpMetavars := Iter.toArray(_metavars.entries());

        _tmpAccount := Iter.toArray(_account.entries());
        _tmpChunk := Iter.toArray(_chunk.entries());

    };
    system func postupgrade() {
        _tmpBalance := [];
        _tmpAllowance := [];
        _tmpMeta := [];
        _tmpMetavars := [];
        _tmpAccount := [];
        _tmpChunk := [];

    };
    
    public query func extensions() : async [Ext.Extension] {
        ["@ext:common", "@ext/allowance", "@ext/nonfungible", "nftanvil"];
    };


    public shared({caller}) func debugMode(cannisterId : ?Text) : async () {
        assert(caller == _owner);
        switch(cannisterId) {
            case (null) _cannisterId := null;

            case (?a) _cannisterId := ?Principal.fromText(a);
        }
      
    };


    public query func balance(request : BalanceRequest) : async BalanceResponse {
         switch(balGet(request)) {
             case (#ok(holder,tokenIndex, bal, allowance)) #ok(bal);
             case (#err(e)) #err(#InvalidToken(request.token));
         }
 
    };
    
    public shared({caller}) func burn(request : Ext.Core.BurnRequest) : async Ext.Core.BurnResponse {

        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        
        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
                SNFT_burn(Ext.User.toAccountIdentifier(request.user), tokenIndex);
                
                return #ok(1);
            }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

    public shared({caller}) func transfer(request : TransferRequest) : async TransferResponse {

        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        
        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.from}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
                // _allowance.delete(tokenIndex); // After changing owners, we have to remove allowance
                // _balance.put(tokenIndex, Ext.User.toAccountIdentifier(request.to));
                SNFT_move(Ext.User.toAccountIdentifier(request.from),Ext.User.toAccountIdentifier(request.to), tokenIndex);
                
                return #ok(1);
            }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };



    public query func metadata(token : Ext.TokenIdentifier) : async Ext.MetadataResponse {
        switch (Ext.TokenIdentifier.decode(token)) {
            case (#ok(cannisterId, tokenIndex)) {
               
                if (checkCorrectCannister(cannisterId) == false) return #err(#InvalidToken(token));

               
                switch( _meta.get(tokenIndex) ) {
                    case (?m) {
                              switch( _metavars.get(tokenIndex) ) {
                              case (?v) {
                                #ok({
                                    metadata = m; 
                                    metavars = Ext.MetavarsFreeze(v)
                                    });
                              };
                              case (_) {
                                 #err(#InvalidToken(token));
                              }
                              };
                    };
                    case (_) {
                        #err(#InvalidToken(token));
                    };
                }
            };
            case (#err(e)) {
              #err(#InvalidToken(token));
            };
        };
    };
 
    public query func supply(token : Ext.TokenIdentifier) : async Ext.SupplyResponse {
        switch (Ext.TokenIdentifier.decode(token)) {
            case (#ok(cannisterId, tokenIndex)) {
                if (checkCorrectCannister(cannisterId) == false) return #err(#InvalidToken(token));

                switch(SNFT_tidxGet(tokenIndex)) {
                    case (?holder_stored) {
                        #ok(1);
                    };
                    case (_) {
                        #err(#InvalidToken(token));
                    };
                }
                 };
            case (#err(e)) {
              #err(#InvalidToken(token));
            };
        };  
               
    };

    public shared({caller}) func mintNFT_batch(request: [Ext.NonFungible.MintRequest] ) : async Ext.NonFungible.MintBatchResponse {
       // assert(caller == _minter);

        let tokens = Array.map<Ext.NonFungible.MintRequest, TokenIndex>(request, func (one_request) {
                let tokenIndex = SNFT_mint(caller,one_request);
                return tokenIndex
                });

        #ok(tokens);
    };

    public shared({caller}) func uploadChunk(request: Ext.NonFungible.UploadChunkRequest) : async () {
        //TODO: add security

        let ctype: Nat32 = switch(request.position) {
            case (#content) 0;
            case (#thumb) 1;
        };
        
        let maxChunks: Nat32 = switch(request.position) {
            case (#content) 10;
            case (#thumb) 1;
        };

        switch(request.position) {
            case (#content) assert(request.data.size() <= 524288);//512kb
            case (#thumb) assert(request.data.size() <= 131072); // 128kb
        };

        

        assert(request.chunkIdx < maxChunks);

        let chunkId = (request.tokenIndex << 16) | ((request.chunkIdx & 15) << 2) | (ctype);

        _chunk.put(chunkId, request.data);
    };

     public shared({caller}) func fetchChunk(request: Ext.NonFungible.FetchChunkRequest) : async ?Blob {

        let ctype: Nat32 = switch(request.position) {
            case (#content) 0;
            case (#thumb) 1;
        };
        
        assert(request.chunkIdx <= 15);
        assert(ctype <= 3);

        let chunkId = (request.tokenIndex << 16) | ((request.chunkIdx & 15) << 2) | (ctype);

        _chunk.get(chunkId);
    };

    private func SNFT_mint(caller:Principal, request: Ext.NonFungible.MintRequest) : TokenIndex {

        let receiver = Ext.User.toAccountIdentifier(request.to);
 
        let tokenIndex:TokenIndex = _nextTokenId;
        _nextTokenId := _nextTokenId + 1;

        let now = Time.now();
        let timestamp:Nat32 = Nat32.fromIntWrap(Int.div(now, 1000000000)/60);

        // Get class info, check if principal is allowed to mint
        let m = request.metadata;

        let md : Metadata = {
            name= m.name;
            lore= m.lore;
            quality= m.quality;
            use= m.use;
            hold= m.hold;
            transfer= m.transfer;
            ttl= m.ttl; // time to live
            secret= m.secret;
            // parentId= m.parentId;
            // maxChildren= m.maxChildren;
            attributes = m.attributes;
            content = m.content;
            thumb = m.thumb;
            extensionCanister = m.extensionCanister;
            minter= ?caller;
            level= 1; //TODO: make it parent lvl + 1;  0,1,2; 0 lvl doesn't have parent. 1lvl has 0lvl parent; 2lvl has 1lvl parent;
            created = timestamp;
            entropy = Blob.fromArray( Array_.amap(32, func(x:Nat) : Nat8 { Nat8.fromNat(Nat32.toNat(rand.get(8))) })); // 64 bits
        };

        let mvar : Metavars = {
            //  var totalChildren = 0;
             var boundUntil = null; // in minutes
             var cooldownUntil = null; // in minutes
        };

        // Todo: check if class is bind on pickup and set boundUntil if so

        assert(switch(_meta.get(tokenIndex)) { // shouldn't exist in db
            case (?a) false;
            case (_) true;
        });

        _meta.put(tokenIndex, md);
        _metavars.put(tokenIndex, mvar);

        SNFT_put(receiver, tokenIndex);

        tokenIndex

    };
    // public func tst() : async [Ext.MetadataInput] {

    //     let x : Ext.MetadataInput = {
    //         name= ?"Fun";
    //         lore= ?"Some lore";
    //         quality= ?3;
    //         use= ? #consumable({desc = "Fun"; cannister= Principal.fromText("2vxsx-fae")});
    //         hold= ?"Hold for fun";
    //         transfer= ?#unrestricted;
    //         attributes= [("Joo", 34), ("Boo",111), ("Goo",239)];
    //         level= 4;
    //         ttl = ?23423;
    //         thumb = #internal({contentType= "image/jpeg"; size = 234234});
    //         content = null;
    //     };

    //     let y : Ext.MetadataInput ={
    //         name= ?"Fun";
    //         lore= null;
    //         quality= ?3;
    //         use= ? #consumable({desc = "Fun"; cannister= Principal.fromText("2vxsx-fae")});
    //         hold= ?"Hold for fun";
    //         transfer= null;
    //         attributes= [];
    //         level= 4;
    //         ttl = null;
    //         thumb = #external({contentType= "image/jpeg"; cannister = Principal.fromText("2vxsx-fae")});
    //         content = null;

    //     };
    //     return [x,y];
    // };

    public shared({caller}) func mintNFT(request: Ext.NonFungible.MintRequest) : async Ext.NonFungible.MintResponse {
        // assert(caller == _owner);

        if (_available == false) { return #err(#OutOfMemory) };

        if (thresholdMemory <= Prim.rts_memory_size()  ) { 
            _available := false;
            await ROUTER.reportOutOfMemory();
            return #err(#OutOfMemory);
            };

        // let atokens = await ACCESSCONTROL.getBalance(caller);
        // assert(atokens >= 1);
        // assert((await ACCESSCONTROL.consumeAccess(caller, 1)) == #ok(true));



        let tokenIndex = SNFT_mint(caller,request);

        
        // let receiver = Ext.User.toAccountIdentifier(request.to);
 
        // let tokenIndex:TokenIndex = _nextTokenId;

        // let now = Time.now();

        // let md : Metadata = #nonfungible({
        //     metadata = request.metadata;
        //     minter = request.minter;
        //     created = now;
        //     TTL = request.TTL;
        // }); 

        // SNFT_put(receiver, tokenIndex);

        // _meta.put(tokenIndex, md);
        // _nextTokenId := _nextTokenId + 1;

         #ok(tokenIndex);
    };

    // Storage related functions
    private func SNFT_put(aid: AccountIdentifier, tidx: TokenIndex) : () { 

      
        _balance.put(tidx, aid);

        // let owned_tokens = switch(_account.get(aid)) { case (?a) a; case _ []; };
        // let new_owned_tokens = Array.append(owned_tokens, [tidx]);

        // if (Iter.size(new_owned_tokens.keys()) == 1)  _statsAccounts := _statsAccounts + 1;

        // _account.put(aid, new_owned_tokens);
        
    };

    private func SNFT_aidGet(aid: AccountIdentifier) : ?[TokenIndex] { 
        _account.get(aid);
        
    };

    private func SNFT_tidxGet(tidx: TokenIndex) : ?AccountIdentifier { 
        _balance.get(tidx);
    };
    


    private func SNFT_del(aid: AccountIdentifier, tidx: TokenIndex) : () {
        // storeage is a mish-mash if assertations fail
        let stored_aid = switch(SNFT_tidxGet(tidx)) { case (?a) a; case _ ""; };
        assert(Ext.AccountIdentifier.equal(stored_aid, aid)); 
        let aid_tokens = switch(SNFT_aidGet(aid)) { case (?a) a; case _ []; };
        let new_aid_tokens = Array.filter(aid_tokens, func (x:TokenIndex) :Bool { x != tidx });

        // the new array has to be one element less than the old or the token was never there
        let new_aid_tokens_length = Iter.size(new_aid_tokens.keys());
        assert(new_aid_tokens_length + 1 == Iter.size(aid_tokens.keys()));

        _balance.delete(tidx);
        _allowance.delete(tidx);

        switch (new_aid_tokens_length) { // free some memory
            case (0) {
                _account.delete(aid);
                _statsAccounts := _statsAccounts - 1;
            };
            case _  _account.put(aid, new_aid_tokens);
        };
       
    };

    private func SNFT_burn(aid: AccountIdentifier, tidx: TokenIndex) : () {
        SNFT_del(aid, tidx);
        _meta.delete(tidx);
        _statsBurned := _statsBurned + 1;
    };

    private func SNFT_move(from: AccountIdentifier, to:AccountIdentifier, tidx: TokenIndex) : () {
        SNFT_del(from, tidx);
        SNFT_put(to, tidx);
        _statsTransfers := _statsTransfers + 1;
    };

    private func checkCorrectCannister(cannisterId:Principal) : Bool {
        Principal.equal(cannisterId,  switch(_cannisterId) {
            case(null) Principal.fromActor(this);
            case(?a) a
        })
    };

    
    // public type OwnedResponse = {idx:TokenIndex};
    
    // returns all tokens the user owns
    public query func owned(user : User) : async [TokenIndex] {
        let aid = Ext.User.toAccountIdentifier(user);
        let token_ids = switch(SNFT_aidGet(aid)) { case (?a) a; case _ []; };
        // Array.map<TokenIndex, OwnedResponse>(token_ids, func (tokenIndex) { 
        //      switch( _meta.get(tokenIndex) ) {
        //             case (?a) {
        //                 switch(_metavars.get(tokenIndex)) {
        //                     case (?v) {
        //                        return {idx = tokenIndex; metadata = ?a; metavars = ?v}; 
        //                     };
        //                     case (_) {
        //                         assert(false); 
        //                         {idx = tokenIndex; metadata = null; metavars = null}
        //                     }
        //                 }
        //             };
        //             case _ { 
        //                 assert(false); 
        //                 {idx = tokenIndex; metadata = null; metavars = null}
        //             }; //we can't have token without _meta
        //             }
        //         });
    };

   

    public query func bearer(token : Ext.TokenIdentifier) : async Ext.NonFungible.BearerResponse {
           switch (Ext.TokenIdentifier.decode(token)) {
            case (#ok(cannisterId, tokenIndex)) {
                if (checkCorrectCannister(cannisterId) == false) return #err(#InvalidToken(token));
               
                switch(SNFT_tidxGet(tokenIndex)) {
                    case (?holder_stored) {
                        #ok(holder_stored);
                    };
                    case (_) {
                        #err(#InvalidToken(token));
                    };
                }
            };
            case (#err(e)) {
              #err(#InvalidToken(token));
            };
        };
    };

    public query func allowance(request : Ext.Allowance.Request) : async Ext.Allowance.Response {
        
        switch ( balGetAllowance(balGet({token = request.token; user = request.owner}),request.spender)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance, allowance)) {
                return #ok(allowance);
            };
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
         } 
    };
    
    public shared({caller}) func approve(request : Ext.Allowance.ApproveRequest) : async Ext.Allowance.ApproveResponse {
        
        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
        
        if (request.allowance != 1) return #err(#Other("NFT allowance has to be 1"));

        switch ( balRequireOwner(balRequireMinimum(balGet({token = request.token; user = caller_user}),1),caller_user)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance, allowance)) {
                
                // caller being same as spender will remove previously approved spender
                if (Principal.equal(caller, request.spender)) {
                    _allowance.delete(tokenIndex); // will save memory
                    } else {
                    _allowance.put(tokenIndex, request.spender);
                    };

                #ok();
            };
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));

         }

    };

    // Accept cycles
    public func cyclesAccept() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
    };

    public query func cyclesBalance() : async Nat {
        return Cycles.balance();
    };
    

    public type StatsResponse = {
        minted: Nat32;
        accounts: Nat32;
        transfers: Nat32;
        burned: Nat32;
        cycles: Nat;
        rts_version:Text ;
        rts_memory_size:Nat;
        rts_heap_size:Nat;
        rts_total_allocation:Nat;
        rts_reclaimed:Nat;
        rts_max_live_size:Nat;
    };


    public query func stats () : async StatsResponse {
        {
            minted =  _nextTokenId;
            burned = _statsBurned;
            accounts = _statsAccounts;
            transfers = _statsTransfers;
            cycles = Cycles.balance();
            rts_version = Prim.rts_version();
            rts_memory_size = Prim.rts_memory_size();
            rts_heap_size = Prim.rts_heap_size();
            rts_total_allocation = Prim.rts_total_allocation();
            rts_reclaimed = Prim.rts_reclaimed();
            rts_max_live_size = Prim.rts_max_live_size();
        }
    };
    // Internal functions which help for better code reusability

    private func balGet(request : BalanceRequest) : BalanceInt {
       switch (Ext.TokenIdentifier.decode(request.token)) {
            case (#ok(cannisterId, tokenIndex)) {
                if (checkCorrectCannister(cannisterId) == false) return #err(#InvalidToken(request.token));
                
               switch(SNFT_tidxGet(tokenIndex)) {
     
                    case (?holder_stored) {
                        let holder = request.user;
                        if (Ext.AccountIdentifier.equal(holder_stored, Ext.User.toAccountIdentifier(holder)) == true) {
                            #ok(holder, tokenIndex,1,0);
                        } else {
                            #ok(holder, tokenIndex,0,0);
                        }
                    };
                    case (_) {
                        #err(#InvalidToken(request.token));
                    };
                }

            };
            case (#err(e)) {
              #err(#InvalidToken(request.token));
            };
        };
    };

    private func balRequireMinimum(bal : BalanceInt, min:Balance) :  BalanceInt {
        switch (bal) {
            case (#ok(holder, tokenIndex, bal, allowance)) {
                if (bal < min) return #err(#InsufficientBalance);
                #ok(holder, tokenIndex, bal, allowance);
            };
            case (#err(e)) #err(e);
        }
    }; 

    private func balRequireOwner(bal : BalanceInt, caller:User) :  BalanceInt {
        switch (bal) {
            case (#ok(holder, tokenIndex, bal, allowance)) {
                 if (Ext.User.equal(caller,holder) == false) return #err(#Unauthorized(Ext.User.toAccountIdentifier(holder)));
                #ok(holder, tokenIndex, bal, allowance); 
            };
            case (#err(e)) #err(e);
        } 
    }; 

    private func balGetAllowance(bal : BalanceInt, caller:Principal) : BalanceInt {
        switch (bal) {
            case (#ok(holder, tokenIndex, bal, allowance)) {

                switch( _allowance.get(tokenIndex) ) {
                    case (?allowed_principal) {
                        switch (Principal.equal(caller, allowed_principal)) {
                            case true {
                                if (bal < 1) return #err(#Other("Internal data corrupted"));
                                #ok(holder, tokenIndex, bal, 1);
                            };
                            case false #ok(holder, tokenIndex, bal, 0);   
                        }
                    };
                    case (_) #ok(holder, tokenIndex, bal, 0)
                }
             };
           case (#err(e)) #err(e);
        };
    };

    private func balRequireOwnerOrAllowance(bal : BalanceInt, owner:User, caller:Principal) :  BalanceInt {
        switch (balGetAllowance(bal, caller)) {
            case (#ok(holder, tokenIndex, bal, allowance)) {
                 let errResult = #err(#Unauthorized(Ext.User.toAccountIdentifier(holder)));
                 let okResult = #ok(holder, tokenIndex, bal, allowance);

                 if (Ext.User.equal(owner,holder) == true) return okResult;
                 switch (_allowance.get(tokenIndex)) {
                      case (?allowed_principal) {
                          if (allowed_principal == caller) {
                           return okResult;
                           } else {
                           return errResult; 
                           }
                      };
                      case (_) errResult;
                 };

            };
            case (#err(e)) #err(e);
        };
    };

    


};

