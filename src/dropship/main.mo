import Ext "../../lib/ext.std/src/Ext";
import Interface "../../lib/ext.std/src/Interface";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Nat32 "mo:base/Nat32";

shared(install) actor class Token() : async Interface.NonFungibleToken = this {

    // TYPE ALIASES
    type AccountIdentifier = Ext.AccountIdentifier;
    type Balance = Ext.Balance;
    type TokenIdentifier = Ext.TokenIdentifier;
    type TokenIndex = Ext.TokenIndex;
    type User = Ext.User;
    type CommonError = Ext.CommonError;
    type Metadata = Ext.Common.Metadata;

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
    type BalanceInt = Result.Result<(User,TokenIndex,Balance,Balance),BalanceIntError>;

    // STATE 
    private stable var _tmpBalance : [(TokenIndex, AccountIdentifier)] = [];
    private var _balance : HashMap.HashMap<TokenIndex, AccountIdentifier> = HashMap.fromIter(_tmpBalance.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _tmpMeta : [(TokenIndex, Metadata)] = [];
    private var _meta : HashMap.HashMap<TokenIndex, Metadata> = HashMap.fromIter(_tmpMeta.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _tmpAllowance : [(TokenIndex, Principal)] = [];
    private var _allowance : HashMap.HashMap<TokenIndex, Principal> = HashMap.fromIter(_tmpAllowance.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);
    
    private stable var _admin : Principal  = install.caller; 
    private stable var _cannisterId : Principal = install.caller;

    private stable var _nextTokenId : Nat32 = 0;

    private stable var _statsTotalTokens : Nat32  = 0;
    private stable var _statsCollections : Nat  = 0;
    private stable var _statsUsers : Nat  = 0;
    private stable var _statsTransfers : Nat32  = 0;


    //Handle canister upgrades
    system func preupgrade() {
        _tmpBalance := Iter.toArray(_balance.entries());
        _tmpAllowance := Iter.toArray(_allowance.entries());
        _tmpMeta := Iter.toArray(_meta.entries());
    };
    system func postupgrade() {
        _tmpBalance := [];
        _tmpAllowance := [];
        _tmpMeta := [];
    };
    
    public query func extensions() : async [Ext.Extension] {
        ["@ext:common", "@ext/allowance", "@ext/nonfungible"];
    };


    public shared({caller}) func init (cannisterId : Text) : async Principal {
        _cannisterId := Principal.fromText(cannisterId);
        return caller;
    };

    public shared({caller}) func whoAmI() : async Principal {
        return caller;
    };

    public query func balance(request : BalanceRequest) : async BalanceResponse {
         switch(balGet(request)) {
             case (#ok(holder,tokenIndex, bal, allowance)) #ok(bal);
             case (#err(e)) #err(#InvalidToken(request.token));
         }
 
    };

    public shared({caller}) func transfer(request : TransferRequest) : async TransferResponse {

        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        
        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.from}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
                _allowance.delete(tokenIndex); // After changing owners, we have to remove allowance
                _balance.put(tokenIndex, Ext.User.toAccountIdentifier(request.to));
                _statsTransfers := _statsTransfers + 1;
                return #ok(1);

            };
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

    // @ext:common
    public query func metadata(token : Ext.TokenIdentifier) : async Ext.Common.MetadataResponse {
        #err(#Other("not implemented"));
    };

    public query func supply(token : Ext.TokenIdentifier) : async Ext.Common.SupplyResponse {
        #err(#Other("not implemented"));
    };

    public shared({caller}) func mintNFT(request: Ext.NonFungible.MintRequest) : async Ext.NonFungible.MintResponse {
  
       // assert(caller == _minter);
        let receiver = Ext.User.toAccountIdentifier(request.to);

        let tokenIndex:TokenIndex = _nextTokenId;

        let md : Metadata = #nonfungible({
            metadata = request.metadata;
        }); 

        _balance.put(tokenIndex, receiver);
        _meta.put(tokenIndex, md);
        _statsTotalTokens := _statsTotalTokens + 1;
        _nextTokenId := _nextTokenId + 1;

        #ok(tokenIndex);
    };

    public query func bearer(token : Ext.TokenIdentifier) : async Ext.NonFungible.BearerResponse {
            #err(#Other("not implemented"));
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


    // Internal functions which help for better code reusability
 
    private func balGet(request : BalanceRequest) : BalanceInt {
       switch (Ext.TokenIdentifier.decode(request.token)) {
            case (#ok(cannisterId, tokenIndex)) {
                if (Principal.equal(cannisterId, _cannisterId) == false) return #err(#InvalidToken(request.token));
               
                switch( _balance.get(tokenIndex) ) {
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

