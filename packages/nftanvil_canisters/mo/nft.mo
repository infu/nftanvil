// All rights reserved by 3V Interactive
// Developer contributions are rewarded with stake

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

import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import CRC32 "mo:hash/CRC32";

import Cycles "mo:base/ExperimentalCycles";

import PseudoRandom "../lib/vvv/src/PseudoRandom";
import Blob "mo:base/Blob";
import Array_ "../lib/vvv/src/Array";
import Prim "mo:prim"; 
import AccessControl  "./access";
import Hex "mo:encoding/Hex";
import Blob_ "../lib/vvv/src/Blob";
import Hash "../lib/vvv/src/Hash";
import Painless "../lib/vvv/src/Painless";
import SHA256 "mo:sha/SHA256";
import Ledger  "./ledger_interface";
import AccountIdentifierArray "mo:principal/AccountIdentifier";


shared({caller = _owner}) actor class NFT({_acclist: [Text]; _accesslist:[Text]; _router:Principal;  _slot:Nat32; _debug_cannisterId:?Principal}) : async Interface.NonFungibleToken = this {

    // TYPE ALIASES
    type AccountIdentifier = Ext.AccountIdentifier;
    type Balance = Ext.Balance;
    type TokenIdentifier = Ext.TokenIdentifier;
    type TokenIdentifierBlob = Ext.TokenIdentifierBlob;
    type TokenIndex = Ext.TokenIndex;
    type User = Ext.User;
    type CommonError = Ext.CommonError;
    type Metadata = Ext.Metadata;
    type Metavars = Ext.Metavars;
    type MetavarsOut = Ext.MetavarsFrozen;

    private stable var _fee:Nat64 = 10000;


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

    let ROUTER = actor(Principal.toText(_router)) : actor {
        reportOutOfMemory : shared () -> async ();
        isLegitimate : query (p:Principal) -> async Bool;
    };
    
    private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");

    private let _acclist_size = Iter.size(Iter.fromArray(_acclist));
    private let _accesslist_size = Iter.size(Iter.fromArray(_accesslist));

    type accountInterface = actor {
        add : shared (aid: AccountIdentifier, idx:TokenIndex) -> async ();
        rem : shared (aid: AccountIdentifier, idx:TokenIndex) -> async ();
    };

    private func accountActor(aid: AccountIdentifier) : accountInterface {
        let selected = _acclist[ Ext.AccountIdentifier.slot(aid, _acclist_size) ];
        actor(selected): accountInterface;
    };

    private func accessActor(aid: AccountIdentifier) : AccessControl.AccessControl {
        let selected = _accesslist[ Ext.AccountIdentifier.slot(aid, _accesslist_size) ];
        actor(selected): AccessControl.AccessControl;
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
    
    private stable var _tmpToken2Link: [(TokenIndex, Blob)] = [];
    private var _token2link : HashMap.HashMap<TokenIndex, Blob> = HashMap.fromIter(_tmpToken2Link.vals(), 0, Ext.TokenIndex.equal, Ext.TokenIndex.hash);

    private stable var _tmpChunk : [(Nat32, Blob)] = [];
    private var _chunk : HashMap.HashMap<Nat32, Blob> = HashMap.fromIter(_tmpChunk.vals(), 0, Nat32.equal, func (x:Nat32) : Nat32 { x });


    private stable var _statsCollections : Nat32  = 0;
    private stable var _statsTransfers : Nat32  = 0;
    private stable var _statsBurned : Nat32 = 0;

    private stable var _nextTokenId : Nat32 = 0;
    private stable var _nextChunkId : Nat32 = 0;

    private stable var _available : Bool = true;

    var rand = PseudoRandom.PseudoRandom();

    private let thresholdMemory = 1147483648; //  ~1GB
    private let thresholdNFTMask:Nat32 = 8191; // Dont touch. 13 bit Nat
    private let thresholdNFTCount:Nat32 = 4001; // can go up to 8191

    //Handle canister upgrades
    system func preupgrade() {
        _tmpBalance := Iter.toArray(_balance.entries());
        _tmpAllowance := Iter.toArray(_allowance.entries());
        _tmpMeta := Iter.toArray(_meta.entries());
        _tmpMetavars := Iter.toArray(_metavars.entries());

        _tmpToken2Link := Iter.toArray(_token2link.entries());
        _tmpChunk := Iter.toArray(_chunk.entries());
    };

    system func postupgrade() {
        _tmpBalance := [];
        _tmpAllowance := [];
        _tmpMeta := [];
        _tmpMetavars := [];
        _tmpChunk := [];
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

        if (Ext.User.validate(request.user) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance, allowance)) {
                 SNFT_burn(Ext.User.toAccountIdentifier(request.user), tokenIndex);
                 await ACC_burn(Ext.User.toAccountIdentifier(request.user), tokenIndex);

                return #ok(1);
            }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

    private func isTransferBound(caller: Principal, meta :Metadata, vars: Metavars) : Bool {
            switch( caller == meta.minter ) { 
                case (false) {
                    switch(meta.transfer) {
                        case (#unrestricted) { false };
                        case (#bindsForever) {
                            true;
                        };
                        case (#bindsDuration(setupDuration)) {
                            switch(vars.boundUntil) {
                                case (?duration) {
                                    if (duration < timeInMinutes() ) return true;
                                    false
                                };
                                case (null) {
                                    false
                                };
                            };
                        };
                    };
                };
                case (true) { // Minter can always move his own tokens
                    false
                }
            };
    };

    private func resetTransferBindings( meta :Metadata, vars: Metavars) : () {
        switch (meta.transfer) {
            case (#unrestricted) { (); };
            case (#bindsForever) { (); };
            case (#bindsDuration(setupDuration)) {
                vars.boundUntil := ?(timeInMinutes() + setupDuration);
            }
        }
    };
    // public query func debug_getNFTS() : async [(TokenIndex, Metadata)] {
    //         Iter.toArray(_meta.entries())
    // };

    public shared({caller}) func transfer_link(request : Ext.Core.TransferLinkRequest) : async Ext.Core.TransferLinkResponse {
        
        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        if (Ext.User.validate(request.from) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwner(balRequireMinimum(balGet({token = request.token; user = request.from}),1),caller_user)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
                 
                   switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            if (isTransferBound(caller, meta, vars) == true) return #err(#Rejected);
                            
                            _token2link.put(tokenIndex, request.hash);

                            #ok(_slot);
                    };
                    case (#err()) {
                         #err(#InvalidToken(request.token));
                    }
                }

                
                 }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
    };

    public shared({caller}) func claim_link(request : Ext.Core.ClaimLinkRequest) : async Ext.Core.ClaimLinkResponse {
    
        let keyHash = Blob.fromArray(SHA256.sum224(Blob.toArray(request.key)));
        if (Ext.User.validate(request.to) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        switch (Ext.TokenIdentifier.decode(request.token)) {
                case (#ok(cannisterId, tokenIndex)) {

                    if (checkCorrectCannister(cannisterId) == false) return #err(#Rejected);

                    switch(_token2link.get(tokenIndex)) {
                        case (?hash) {
                            if (keyHash != hash) return #err(#Rejected);   

                            switch(_balance.get(tokenIndex)) {
                                case (?from) {
                                    switch(getMeta(tokenIndex)) {
                                            case (#ok((meta,vars))) {
                                                    SNFT_move(from,Ext.User.toAccountIdentifier(request.to), tokenIndex);
                                                    await ACC_move(from,Ext.User.toAccountIdentifier(request.to), tokenIndex);

                                                    resetTransferBindings(meta, vars);

                                                    return #ok();
                                            };
                                            case (#err()) {
                                                #err(#Rejected);
                                            }
                                        }
                                };
                                case (_) {
                                    #err(#Rejected)
                                }
                            };
                        };
                        case (_) {
                            #err(#Rejected)
                        };
                    }
                  };
                case (#err(e)) {
                    #err(#Rejected)
                }
            }
    };
    
    // Get accountid and exact ICP amount
    public query func purchase_intent( request: Ext.PurchaseIntentRequest) : async Ext.PurchaseIntentResponse {
        let toUserAID = Ext.User.toAccountIdentifier(request.user);

        switch (Ext.TokenIdentifier.decode(request.token)) {
                case (#ok(cannisterId, tokenIndex)) {

                    switch(getMeta(tokenIndex)) {
                        case (#ok((meta,vars))) {
                            if (vars.price == 0) return #err(#NotForSale);

                            let (purchaseAccountId,_) = Ext.AccountIdentifier.purchaseAccountId(Principal.fromActor(this), tokenIndex, toUserAID);
                            
                            #ok({
                                paymentAddress = purchaseAccountId;
                                price = vars.price;
                                });
                        };
                        case(#err(e)) #err(#InvalidToken(request.token));
                        
                    };
                };
                case (#err(e)) #err(#InvalidToken(request.token));
            }
    };

    // Check accountid if its exact or more than asked. If something is wrong, refund. If more is sent, refund extra.
    public shared({caller}) func purchase_claim(request: Ext.PurchaseClaimRequest) : async Ext.PurchaseClaimResponse {

        let toUserAID = Ext.User.toAccountIdentifier(request.user);
        switch (Ext.TokenIdentifier.decode(request.token)) {
             case (#ok(cannisterId, tokenIndex)) {

                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {
                        switch(SNFT_tidxGet(tokenIndex)) {
                            case(?seller) {

                                if (vars.price == 0) return #err(#NotForSale);

                                let (purchaseAccountId, purchaseSubAccount) = Ext.AccountIdentifier.purchaseAccountId(Principal.fromActor(this), tokenIndex, toUserAID);
                                
                                let {e8s = payment} = await ledger.account_balance({
                                    account = purchaseAccountId
                                });

                        
                                let purchaseOk = payment >= vars.price;

                                let fullRefund = payment - _fee;
                                let noRefund = 0;

                                let refundAmount = switch(purchaseOk) {
                                    case(true) {

                                        switch(SNFT_tidxGet(tokenIndex)) {
                                                case(?fromAccount) {
                                                    try {
                                                        SNFT_move(fromAccount, toUserAID, tokenIndex);
                                                        vars.price := 0;
                                                        try {
                                                            await ACC_move(fromAccount, toUserAID, tokenIndex);
                                                            ()
                                                        } catch (e) {
                                                            ()
                                                        };
                                                        noRefund;
                                                    } catch (e) {
                                                        fullRefund;
                                                    };
                                                };
                                                case(_) {
                                                    fullRefund;
                                                }
                                            }
                                        };

                                    case(false) {
                                        fullRefund;
                                        }
                                };

                                switch (purchaseOk) {
                                    case (true) {
                                        let amount = {e8s = payment - _fee};
                                        // move
                                        let transfer : Ledger.TransferArgs = {
                                            memo = 0;
                                            amount;
                                            fee = {e8s = _fee};
                                            from_subaccount = ?purchaseSubAccount;
                                            to = TreasuryAddress;
                                            created_at_time = null;
                                            };

                                        switch(await ledger.transfer(transfer)) {
                                            case (#Ok(blockIndex)) {
                                                let minterAddress = Ext.AccountIdentifier.fromPrincipal(meta.minter, null);

                                                TreasuryActor.notifyTransfer({
                                                    buyerAccount = toUserAID;
                                                    blockIndex;
                                                    amount;
                                                    seller;
                                                    minter = {address=minterAddress; share=meta.minterShare};
                                                    marketplace = request.marketplace;
                                                    purchaseAccount = purchaseAccountId; 
                                                })
                                                // notify Treasury of transaction and splits
                                            };
                                            case (#Err(e)) {
                                                if (purchaseOk == false) return #err(#ErrorWhileRefunding);
                                            }
                                        };
                                    };

                                    case (false) {
                                        if (refundAmount <= _fee) return #err(#NotEnoughToRefund);

                                        // refund
                                        let transfer : Ledger.TransferArgs = {
                                            memo = 0;
                                            amount = {e8s = refundAmount};
                                            fee = {e8s = _fee};
                                            from_subaccount = ?purchaseSubAccount;
                                            to = toUserAID;
                                            created_at_time = null;
                                            };

                                        switch(await ledger.transfer(transfer)) {
                                                case (#Ok(blockIndex)) {
                                                    #err(#Refunded)
                                                };
                                                case (#Err(e)) {
                                                    if (purchaseOk == false) return #err(#ErrorWhileRefunding);
                                                }
                                            };
                                        
                                        };
                                    };

                            };
                            case (_) {
                                #err(#InvalidToken(request.token));
                            };
                        };
                    };
                    case (#err(e)) #err(#InvalidToken(request.token))
                    }
             };
             case (#err(e)) #err(#InvalidToken(request.token));
            }
  
    }; 

    public shared({caller}) func set_price(request: Ext.SetPriceRequest) : async Ext.SetPriceResponse {
            if (request.price < 100000) return #err(#TooLow);
            if (request.price > 100000000000) return #err(#TooHigh);

            if (Ext.User.validate(request.user) == false) return #err(#Other("Invalid user"));
            
            let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));

            switch ( balRequireOwner(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            if (isTransferBound(caller, meta, vars) == true) return #err(#NotTransferable);

                            vars.price := request.price;

                            #ok();

                           };
                    case (#err()) {
                         #err(#InvalidToken(request.token));
                    }
                }
           
            }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
            };

    };

    public shared({caller}) func transfer(request : TransferRequest) : async TransferResponse {

        if (request.amount != 1) return #err(#Other("Must use amount of 1"));

        if (Ext.User.validate(request.from) == false) return #err(#Other("Invalid from"));
        if (Ext.User.validate(request.to) == false) return #err(#Other("Invalid to"));

        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.from}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            if (isTransferBound(caller, meta, vars) == true) return #err(#NotTransferable);
                            
                            SNFT_move(Ext.User.toAccountIdentifier(request.from),Ext.User.toAccountIdentifier(request.to), tokenIndex);
                            await ACC_move(Ext.User.toAccountIdentifier(request.from),Ext.User.toAccountIdentifier(request.to), tokenIndex);

                            resetTransferBindings(meta, vars);

                            return #ok(1);
                    };
                    case (#err()) {
                         #err(#InvalidToken(request.token));
                    }
                }
           
            }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

      
    public type ExtensionCanister = actor {
        nftanvil_use: shared ({
            token:TokenIdentifier;
            aid:AccountIdentifier;
            memo:Ext.Memo;
            useId: Text;
        }) -> async Result.Result<(), Text>
    };




    public shared({caller}) func use(request : Ext.Core.UseRequest) : async Ext.Core.UseResponse {

        if (Ext.User.validate(request.user) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch (balRequireOwner(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {
                        
                        switch(meta.extensionCanister) {
                            case (?canPrincipal) {
                                let can = actor(Principal.toText(canPrincipal)): ExtensionCanister;
                                let aid = Ext.User.toAccountIdentifier(holder);

                                switch(meta.use) {
                                    case (?#cooldown(use)) {
                                        let isOnCooldown = switch(vars.cooldownUntil) {
                                            case (?a) timeInMinutes() <= a;
                                            case (null) false;
                                        };
                                        if (isOnCooldown) return #err(#OnCooldown);
                                        
                                        switch(await can.nftanvil_use({
                                            aid = aid;
                                            token = request.token;
                                            memo = request.memo;
                                            useId = use.useId;
                                            })) {
                                                case (#ok()) {
                                                    let cooldown = (timeInMinutes() + use.duration);
                                                    vars.cooldownUntil := ?cooldown;
                                                    return #ok(#cooldown(cooldown));
                                                };
                                                case (#err(e)) {
                                                    #err(#ExtensionError(e));
                                                }
                                            };
                                                
                                    };
                                    case(?#consumable(use)) {
                                        switch(await can.nftanvil_use({
                                            aid = aid;
                                            token = request.token;
                                            memo = request.memo;
                                            useId = use.useId;
                                            })) {
                                                case (#ok()) {
                                                    SNFT_burn(aid, tokenIndex);
                                                    await ACC_burn(aid, tokenIndex);
                                                    return #ok(#consumed);
                                                };
                                                case (#err(e)) {
                                                    #err(#ExtensionError(e));
                                                }
                                            };
                                    };
                                    case(null) {
                                        #err(#Other("Spec not specifying any use"));
                                    }
                                }

                    
                            };
                            case (null) {
                                #err(#Other("No extension canister specified"));
                            }
                        }
                           
                    };
                    case (#err()) {
                         #err(#InvalidToken(request.token));
                    }
                }
           
            }; 
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

    private func getMeta(tokenIndex: TokenIndex) : Result.Result<(Metadata, Metavars), ()> {
        switch( _meta.get(tokenIndex) ) {
            case (?m) {
                switch( _metavars.get(tokenIndex) ) {
                    case (?v) {
                        #ok((m,v));
                    };
                    case (_) {
                        #err();
                    }
                };
            };
            case (_) {
                #err();
            };
        }
    };

    public query func metadata(token : Ext.TokenIdentifier) : async Ext.MetadataResponse {
        switch (Ext.TokenIdentifier.decode(token)) {
            case (#ok(cannisterId, tokenIndex)) {
               
                if (checkCorrectCannister(cannisterId) == false) return #err(#InvalidToken(token));

                switch(SNFT_tidxGet(tokenIndex)) {
                    case (?bearer) {

                       switch(getMeta(tokenIndex)) {
                            case (#ok((m,v))) {
                                    #ok({
                                    bearer = bearer;
                                    data = m; 
                                    vars = Ext.MetavarsFreeze(v)
                                    });
                            };
                            case (#err()) {
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



    public shared({caller}) func uploadChunk(request: Ext.NonFungible.UploadChunkRequest) : async () {

        assert((switch(getMeta(request.tokenIndex)) {
                    case (#ok((meta,vars))) {
                          (meta.minter == caller) and ((meta.created + 10) > timeInMinutes()); // allows upload of assets up to 10min after minting
                    };
                    case (#err()) {
                       false
                    }
                }
            ));

        let ctype: Nat32 = switch(request.position) {
            case (#content) 0;
            case (#thumb) 1;
        };
        
        let maxChunks: Nat32 = switch(request.position) { // Don't go over the bitmask maximum which is 255
            case (#content) 2; 
            case (#thumb) 1;
        };

        switch(request.position) {
            case (#content) assert(request.data.size() <= 524288); // 512kb
            case (#thumb) assert(request.data.size() <= 131072);   // 128kb
        };

        assert(request.chunkIdx < maxChunks);

        let chunkId = chunkIdEncode(request.tokenIndex, request.chunkIdx, ctype);

        _chunk.put(chunkId, request.data);
    };

    private func chunkIdEncode(tokenIndex:Nat32, chunkIndex:Nat32, ctype:Nat32) : Nat32 {
        ((tokenIndex & thresholdNFTMask) << 19) | ((chunkIndex & 255) << 2) | (ctype);
    };

    private func chunkIdDecode(x:Nat32) : (tokenIndex:Nat32, chunkIndex:Nat32, ctype:Nat32) {
        (
            ((x >> 19 ) & thresholdNFTMask) | (_slot<<13) ,
            (x >> 2) & 255,
            (x & 3)
        )
    };

    public shared({caller}) func fetchChunk(request: Ext.NonFungible.FetchChunkRequest) : async ?Blob {

        let ctype: Nat32 = switch(request.position) {
            case (#content) 0;
            case (#thumb) 1;
        };
        
        assert(request.chunkIdx <= 15);
        assert(ctype <= 3);

        let chunkId = chunkIdEncode(request.tokenIndex, request.chunkIdx, ctype);  //((request.tokenIndex & thresholdNFTMask) << 19) | ((request.chunkIdx & 255) << 2) | (ctype);


        switch(getMeta(request.tokenIndex)) {
            case (#ok((meta,vars))) {
                
                 let allowed:Bool = switch(meta.secret and ctype == 0) {
                     case (false) true;
                     case (true) {
                            switch(SNFT_tidxGet(request.tokenIndex)) {
                                case (?ownerAid) {
                                     let callerAid = Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount);
                                     Ext.AccountIdentifier.equal(ownerAid,callerAid);
                                };
                                case (_) {
                                    // shouldn't be possible if db is correct
                                    false;
                                }
                            }
                     }
                 };

                 if (allowed == false) return null;
                 _chunk.get(chunkId);
            };
            case (#err()) {
                null
            }
        }
       
    };
    
    // Painless HTTP response - Start
    private func getChunk(key:Text, index:Nat) : Painless.Chunk {
        switch(Hex.decode(Text.trimStart(key, #text("/")))) {
            case (#ok(bytes)) {
                let n:Nat32 = Blob_.bytesToNat32(bytes);
                let thisChunk:Nat32 = n | (Nat32.fromNat(index) << 2);
                let nextChunk:Nat32 = n | ((Nat32.fromNat(index)+1) << 2);

                switch(_chunk.get(thisChunk)) {
                                case (?a) {
                                    switch(_chunk.get(nextChunk)) {
                                        case (?b) {
                                            #more(a);
                                        };
                                        case (null) {
                                            #end(a);
                                        }
                                    }
                                };
                                case(null) {
                                    assert(false);
                                    #none();
                                };
                            };
                
            };
            case (#err(e)) {
                #none;
            }
        };
    };
    
    //Explained here: https://forum.dfinity.org/t/cryptic-error-from-icx-proxy/6944/15
    let _workaround = actor(Principal.toText(switch(_debug_cannisterId) {
            case(null) Principal.fromActor(this);
            case(?a) a
        })) : actor { http_request_streaming_callback : shared () -> async () };


    private func httpKeyDecode(key: Text) : Result.Result<(tokenIndex:TokenIndex, chunkIndex:Nat32, ctype:Nat32), Text> {
            switch(Hex.decode(Text.trimStart(key, #text("/")))) {
                    case (#ok(bytes)) {
                        #ok( chunkIdDecode(Blob_.bytesToNat32(bytes)));
                    };
                    case (#err(e)) {
                    #err("Hex decode error " # e);
                    }
            }
    };

    public query func http_request(request : Painless.Request) : async Painless.Response {
     

        switch(httpKeyDecode(request.url)) {
            case (#ok((tokenIndex, chunkIndex, ctype))) {


                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {
                           
                             if (ctype == 0 and meta.secret) return Painless.NotFound("Secret content can't be retrieved with http request");

                            let target : ? Ext.Content = switch(ctype) {
                                case (0) meta.content;
                                case (1) ?meta.thumb;
                                case (_) null
                            };

                            switch(target) {
                                case (?ct) {

                                    switch(ct) {
                                        case (#internal({contentType; size})) {
                                         
                                            Painless.Request(request, {
                                                chunkFunc = getChunk;
                                                cbFunc = _workaround.http_request_streaming_callback;
                                                headers = [("Content-size", Nat32.toText(size)), ("Content-type", contentType), ("Cache-control", "public,max-age=31536000,immutable") ]
                                                });
                                        };
                                        case (#external(_)) {
                                            Painless.NotFound("Token points to external data");
                                        };
                                        case (#ipfs(_)) {
                                            Painless.NotFound("Token points to IPFS");
                                        };
                                    }
                                
                                };
                                case (null) Painless.NotFound("Data not found in token");
                            }

                    };
                    case (#err()) {
                        Painless.NotFound("Token not found");
                    }

                };

            };
            case (#err(e)) {
                Painless.NotFound("Invalid resource id (" # e # ")");
            }
        }

    };
    
    public query func http_request_streaming_callback(token : Painless.Token) : async Painless.Callback {
      Painless.Callback(token, {
          chunkFunc = getChunk;
      });
    };
    // Painless HTTP response - End

    private func timeInMinutes() : Nat32 {
        return  Nat32.fromIntWrap(Int.div(Time.now(), 1000000000)/60);
    };

    private func SNFT_mint(caller:Principal, request: Ext.NonFungible.MintRequest) : async Ext.NonFungible.MintResponse {

        let receiver = Ext.User.toAccountIdentifier(request.to);

        // INFO:
        // 13 bits used for local token index (max 8191)
        // 19 bits used for slot number (max 524287)
        // 1000 tokens * 4mb each = 4gb (the canister limit); 
        // Some tokens will be less space, others more, max is ~ 5.4mb
        // Max tokens if canisters have only 1000tokens each = 524287 * 1000 = 524 mil

        let tokenIndex:TokenIndex = (_slot<<13) | _nextTokenId;
        _nextTokenId := _nextTokenId + 1;

         let timestamp:Nat32 = timeInMinutes();

        // Get class info, check if principal is allowed to mint
        let m = request.metadata;

        if (Ext.MetadataInput.validate(m) == false) return #err(#Invalid("Meta invalid - Out of boundaries"));

        if (m.quality > 1) return #err(#Invalid("Higher than 1 quality not implemented"));

        let md : Metadata = {
            domain=m.domain;
            name= m.name;
            lore= m.lore;
            quality= m.quality;
            use= m.use;
            hold= m.hold;
            transfer = m.transfer;
            ttl= m.ttl; // time to live
            secret= m.secret;
            attributes = m.attributes;
            tags = m.tags;
            custom = m.custom;
            content = m.content;
            thumb = m.thumb; 
            extensionCanister = m.extensionCanister;
            minter= caller;
            created = timestamp;
            updated = timestamp;
            entropy = Blob.fromArray( Array_.amap(32, func(x:Nat) : Nat8 { Nat8.fromNat(Nat32.toNat(rand.get(8))) })); // 64 bits
        };

        // validity checks
        if (md.secret == true) switch (md.content) {
            case (?#external(_)) {
                return #err(#Invalid("Can't have secret external content"));
            };
            case (?#ipfs(_)) {
                return #err(#Invalid("Can't have secret IPFS content"));
            };
            case (_) ();
        };

        switch(md.extensionCanister) {
            case (?can) {
                ()
            };
            case (null) {
                 switch(md.use) {
                    case(?use) return #err(#Invalid("extensionCanister required if use is specified"));
                    case (null) ()
                 };
                 switch(md.content) {
                    case(?#external(_)) return #err(#Invalid("extensionCanister required if external content is specified"));
                    case (_) ()
                 };
                 switch(md.thumb) {
                    case(#external(_)) return #err(#Invalid("extensionCanister required if external thumb is specified"));
                    case (_) ()
                 };
            };
        };
        
        let mvar : Metavars = {
             var boundUntil = switch (md.transfer) {
                    case (#unrestricted) { null };
                    case (#bindsForever) { null };
                    case (#bindsDuration(setupDuration)) {
                        ?(timeInMinutes() + setupDuration);
                    }
                }; 
             var cooldownUntil = null; // in minutes
             var sockets = [];
             var price = 0;
        };

        assert(switch(_meta.get(tokenIndex)) { // make some memory integrity checks
            case (?a) false;
            case (_) true;
        });

        _meta.put(tokenIndex, md);
        _metavars.put(tokenIndex, mvar);

        SNFT_put(receiver, tokenIndex);
        await ACC_put(receiver, tokenIndex);

        return #ok(tokenIndex);

    };



    public shared({caller}) func mintNFT(request: Ext.NonFungible.MintRequest) : async Ext.NonFungible.MintResponse {

        if (Ext.User.validate(request.to) == false) return #err(#Invalid("Invalid User. Account identifiers must be all uppercase"));

        if (_available == false) { return #err(#OutOfMemory) };

        if ((thresholdNFTCount  <= _nextTokenId) or (thresholdMemory <= Prim.rts_memory_size() )) {
            _available := false;
            await ROUTER.reportOutOfMemory();
            return #err(#OutOfMemory);
            };

        if ((await consumeAccessTokens(caller, 1)) == false) return #err(#InsufficientBalance);

        await SNFT_mint(caller, request);

    };

    // Calls func socket on the target token
    public shared({caller}) func plug(request: Ext.PlugRequest) : async Ext.PlugResponse {
        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.plug; user = request.user}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            switch (Ext.TokenIdentifier.decode(request.socket)) {
                                case (#ok(socketCanister, _)) {

                                    let socketActor = actor (Principal.toText(socketCanister)) : NFT;
                                    switch(await socketActor.socket(request)) {
                                        case (#ok()) {
                                            let to = Ext.User.toAccountIdentifier( #principal(socketCanister) );
                                            SNFT_move(Ext.User.toAccountIdentifier(request.user), to, tokenIndex);
                                            await ACC_move(Ext.User.toAccountIdentifier(request.user), to, tokenIndex);

                                            #ok(());
                                        };
                                        case (#err(e)) {
                                             #err(#SocketError(e));
                                        }
                                    };
                                };
                                case (#err(e)) {
                                    #err(#InvalidToken(request.socket));
                                }
                            }

                    };
                    case (#err()) {
                         #err(#InvalidToken(request.plug));
                    }
                }
           
            };
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
    };

    // Calls the extension canister and asks if it accepts the plug
    public shared({caller}) func socket(request: Ext.SocketRequest) : async Ext.SocketResponse {
        
        if (Ext.TokenIdentifier.validate(request.plug) == false) return #err(#Other("Bad plug tokenIdentifier"));
        let plugBlob = Ext.TokenIdentifier.toBlob(request.plug);


        if ((await ROUTER.isLegitimate(caller)) == false) return #err(#NotLegitimateCaller);
        
        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));

        switch ( balRequireOwner(balRequireMinimum(balGet({token = request.socket; user = request.user}),1),request.user)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                        switch(switch(meta.extensionCanister) {
                            case (?extCan) {
                                let extensionActor = actor (Principal.toText(extCan)) : actor {
                                    socketAllow : query (request: Ext.SocketRequest) -> async Result.Result<
                                        (),
                                        {#Other: Text}
                                        >;
                                };

                                // get permission from extension canister
                                switch (await extensionActor.socketAllow(request)) {
                                    case (#ok()) {                                        
                                        #ok()
                                    };
                                    case (#err(e)) #err(e);
                                };
                            };
                            case (null) {
                                // canisters without extension don't need permission
                                #ok()
                            }
                        }) {
                            case (#ok()) {
                                if (Iter.size(Iter.fromArray(vars.sockets)) >= 10) return #err(#SocketsFull);
                                vars.sockets := Array.append(vars.sockets, [plugBlob]);
                                #ok();
                            };
                            case (#err(e)) #err(e);
                        }
                        
                    
                    };
                    case (#err()) {
                         #err(#InvalidToken(request.plug));
                    }
                }
           
            };
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
    };

    // Unsockets and returns it to owner
    public shared({caller}) func unsocket(request: Ext.UnsocketRequest) : async Ext.UnsocketResponse {

        if (Ext.TokenIdentifier.validate(request.plug) == false) return #err(#Other("Bad plug tokenIdentifier"));
        let plugBlob = Ext.TokenIdentifier.toBlob(request.plug);

        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    
            switch (balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.socket; user = request.user}),1),caller_user, caller)) {
                case (#ok(holder, tokenIndex, bal:Ext.Balance,allowance)) {
        
                    switch(getMeta(tokenIndex)) {
                        case (#ok((meta,vars))) {

                            switch(switch(meta.extensionCanister) {
                                case (?extCan) {
                                    let extensionActor = actor (Principal.toText(extCan)) : actor {
                                        unsocketAllow : query (request: Ext.UnsocketRequest) -> async Result.Result<
                                            (),
                                            {#Other: Text}
                                            >;
                                    };

                                    // get permission from extension canister
                                    switch (await extensionActor.unsocketAllow(request)) {
                                        case (#ok()) {
                                            #ok()
                                        };
                                        case (#err(e)) #err(e);
                                    };
                                };
                                case (null) {
                                    // canisters without extension don't need permission
                                    #ok()
                                }
                            }) {
                                case (#ok()) {
                                   switch (Ext.TokenIdentifier.decode(request.plug)) {
                                    case (#ok(plugCanister, _)) {
                                        let plugActor = actor (Principal.toText(plugCanister)) : NFT;
                                        switch(await plugActor.unplug(request)) {
                                            case (#ok()) {
                                                
                                                //remove from socket metavars
                                                vars.sockets := Array.filter( vars.sockets, func (tid:TokenIdentifierBlob) : Bool {
                                                    tid != plugBlob
                                                });

                                                #ok();
                                            };
                                            case (#err(e)) #err(#UnplugError(e));
                                        }
                                    };
                                    case (#err(e)) #err(#InvalidToken(request.socket));
                                    }
                                    
                                };
                                case (#err(e)) #err(e);
                            }
                            
                        };
                        case (#err()) {
                            #err(#InvalidToken(request.plug));
                        }
                    }
            
                };
                case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
                case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
                case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
                case (#err(e)) return #err(#Other("Something went wrong"));
            };

    };


// Unsockets and returns it to owner
    public shared({caller}) func unplug(request: Ext.UnsocketRequest) : async Ext.UnplugResponse {
        if ((await ROUTER.isLegitimate(caller)) == false) return #err(#NotLegitimateCaller);

        let caller_user:Ext.User = #address(Ext.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    
            switch (balRequireOwner(balRequireMinimum(balGet({token = request.plug; user = caller_user}),1),caller_user)) {
                case (#ok(holder, tokenIndex, bal:Ext.Balance, allowance)) {
        
                    switch(getMeta(tokenIndex)) {
                        case (#ok((meta,vars))) {
                            SNFT_move(Ext.User.toAccountIdentifier(#principal(caller)),Ext.User.toAccountIdentifier(request.user), tokenIndex);
                            await ACC_move(Ext.User.toAccountIdentifier(#principal(caller)),Ext.User.toAccountIdentifier(request.user), tokenIndex);

                            #ok();
                        };
                        case (#err()) {
                            #err(#InvalidToken(request.plug));
                        }
                    }
                };
                case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
                case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
                case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
                case (#err(e)) return #err(#Other("Something went wrong"));
            };

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
        if (Ext.User.validate(request.owner) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        switch ( balGetAllowance(balGet({token = request.token; user = request.owner}),request.spender)) {
            case (#ok(holder, tokenIndex, bal:Ext.Balance, allowance)) {
                return #ok(allowance);
            };
            case (#err(#InvalidToken(e))) return #err(#InvalidToken(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
         } 
    };
    
    // NOTE: Currently approve allows only one principal to be allowed, which means, 
    // the owner can't list NFT in multiple marketplaces. This will be changed.
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
        transfers: Nat32;
        burned: Nat32;
        cycles: Nat;
        rts_version:Text;
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

    private func consumeAccessTokens(caller:Principal, count:Nat) : async Bool {
        let aid = Ext.AccountIdentifier.fromPrincipal(caller, null);
        let accessControl = accessActor(aid);
        // let atokens = await accessControl.getBalance(aid);
        // if (atokens < count) return false;
        if ((await accessControl.consumeAccess(aid, count)) == #ok(true)) return true;
        return false;
    };

    // ***** Storage layer
    private func SNFT_put(aid: AccountIdentifier, tidx: TokenIndex) :  () { 
        _balance.put(tidx, aid);
         //await accountActor(aid).add(aid, tidx);

    };

    private func SNFT_tidxGet(tidx: TokenIndex) : ?AccountIdentifier { 
        _balance.get(tidx);
    };
    
    private func SNFT_del(aid: AccountIdentifier, tidx: TokenIndex) : () {
        //  if assertations fail storeage is a mish-mash or someone is trying to hack it 
        let stored_aid = switch(SNFT_tidxGet(tidx)) { case (?a) a; case _ Blob.fromArray([]); };
        assert(stored_aid == aid);

        _balance.delete(tidx);
        _allowance.delete(tidx);
        _token2link.delete(tidx);

        // await accountActor(aid).rem(aid, tidx);   
    };

    private func SNFT_burn(aid: AccountIdentifier, tidx: TokenIndex) :  () {
        SNFT_del(aid, tidx);
        _meta.delete(tidx);
        _statsBurned := _statsBurned + 1;
    };

    private func ACC_burn(aid: AccountIdentifier, tidx: TokenIndex) :  async () {
        await ACC_del(aid, tidx);
    };

    private func ACC_put(aid: AccountIdentifier, tidx: TokenIndex) : async () { 
        await accountActor(aid).add(aid, tidx);
    };

    private func ACC_del(aid: AccountIdentifier, tidx: TokenIndex) : async () {
        await accountActor(aid).rem(aid, tidx);   
    };

    private func ACC_move(from: AccountIdentifier, to:AccountIdentifier, tidx: TokenIndex) : async () {
        await ACC_del(from, tidx);
        await ACC_put(to, tidx);
    };

    private func SNFT_move(from: AccountIdentifier, to:AccountIdentifier, tidx: TokenIndex) : () {
        SNFT_del(from, tidx);
        SNFT_put(to, tidx);
        _statsTransfers := _statsTransfers + 1;
    };

    private func checkCorrectCannister(cannisterId:Principal) : Bool {
        Principal.equal(cannisterId,  switch(_debug_cannisterId) {
            case(null) Principal.fromActor(this);
            case(?a) a
        })
    };

    // ***** Balance 
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

