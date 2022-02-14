// All rights reserved by 3V Interactive
// Developer contributions are rewarded with stake

import Nft "./type/nft_interface";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";

import Array "mo:base/Array";
import Int "mo:base/Int";
import Int32 "mo:base/Int32";

import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";

import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import CRC32 "mo:hash/CRC32";

import Cycles "mo:base/ExperimentalCycles";

import PseudoRandom "./lib/PseudoRandom";
import Blob "mo:base/Blob";
import Array_ "./lib/Array";
import Prim "mo:prim"; 
import Hex "mo:encoding/Hex";
import Blob_ "./lib/Blob";
import Hash "./lib/Hash";
import Painless "./lib/Painless";
import SHA224 "./lib/SHA224";
import Ledger  "./type/ledger_interface";
import Cluster  "./type/Cluster";
import PWR "./type/pwr_interface";
import AccountIdentifierArray "mo:principal/AccountIdentifier";


shared({caller = _installer}) actor class Class() : async Nft.Interface = this {

    // TYPE ALIASES
    type AccountIdentifier = Nft.AccountIdentifier;
    type Balance = Nft.Balance;
    type TokenIdentifier = Nft.TokenIdentifier;
    // type TokenIdentifierBlob = Nft.TokenIdentifierBlob;
    type TokenIndex = Nft.TokenIndex;
    type User = Nft.User;
    type CommonError = Nft.CommonError;
    type Metadata = Nft.Metadata;
    type Metavars = Nft.Metavars;
    type MetavarsOut = Nft.MetavarsFrozen;


    type BalanceRequest = Nft.BalanceRequest;
    type BalanceResponse = Nft.BalanceResponse;
    type TransferRequest = Nft.TransferRequest;
    type TransferResponse = Nft.TransferResponse;

    // Internal types
    public type BalanceIntError = {
        #InvalidToken;
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #Other        : Text;
    };


    type BalanceInt = Result.Result<(User,TokenIndex,Balance,Balance),BalanceIntError>;

    // STATE 
    private stable var _tmpBalance : [(TokenIndex, AccountIdentifier)] = [];
    private var _balance : HashMap.HashMap<TokenIndex, AccountIdentifier> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.TokenIndex.equal, Nft.TokenIndex.hash);
    
    private stable var _tmpMeta : [(TokenIndex, Metadata)] = [];
    private var _meta : HashMap.HashMap<TokenIndex, Metadata> = HashMap.fromIter(_tmpMeta.vals(), 0, Nft.TokenIndex.equal, Nft.TokenIndex.hash);
    
    private stable var _tmpMetavars : [(TokenIndex, Metavars)] = [];
    private var _metavars : HashMap.HashMap<TokenIndex, Metavars> = HashMap.fromIter(_tmpMetavars.vals(), 0, Nft.TokenIndex.equal, Nft.TokenIndex.hash);
    
    private stable var _tmpToken2Link: [(TokenIndex, Blob)] = [];
    private var _token2link : HashMap.HashMap<TokenIndex, Blob> = HashMap.fromIter(_tmpToken2Link.vals(), 0, Nft.TokenIndex.equal, Nft.TokenIndex.hash);

    // {
    //     owner:
    //     metadata:
    //     metavars:
    //     secretlink:
    // }

    // private stable var _tmpAllowance : [(TokenIndex, Principal)] = [];
    // private var _allowance : HashMap.HashMap<TokenIndex, Principal> = HashMap.fromIter(_tmpAllowance.vals(), 0, Nft.TokenIndex.equal, Nft.TokenIndex.hash);
 

    private stable var _tmpChunk : [(Nat32, Blob)] = [];
    private var _chunk : HashMap.HashMap<Nat32, Blob> = HashMap.fromIter(_tmpChunk.vals(), 0, Nat32.equal, func (x:Nat32) : Nat32 { x });

    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
    private stable var _slot : Nft.CanisterSlot = 0;

    private stable var _statsCollections : Nat32  = 0;
    private stable var _statsTransfers : Nat32  = 0;
    private stable var _statsBurned : Nat32 = 0;

    private stable var _nextTokenId : Nft.TokenIndex = 1;
    private stable var _priceIndex : Nat32 = 1;

    private stable var _available : Bool = true;

    private stable var _cycles_recieved : Nat = Cycles.balance();

    var rand = PseudoRandom.PseudoRandom();

    private let thresholdMemory = 1147483648; //  ~1GB
    // private let thresholdNFTMask:Nft.TokenIndex = 8191; // Dont touch. 13 bit Nat
    private let thresholdNFTCount:Nft.TokenIndex = 65534;//4001; // can go up to 8191

    //Handle canister upgrades
    system func preupgrade() {
        _tmpBalance := Iter.toArray(_balance.entries());

        // _tmpAllowance := Iter.toArray(_allowance.entries());
        _tmpMeta := Iter.toArray(_meta.entries());
        _tmpMetavars := Iter.toArray(_metavars.entries());

        _tmpToken2Link := Iter.toArray(_token2link.entries());
        _tmpChunk := Iter.toArray(_chunk.entries());

    };

    system func postupgrade() {
        _tmpBalance := [];

        // _tmpAllowance := [];
        _tmpMeta := [];
        _tmpMetavars := [];
        _tmpChunk := [];
    };
    
    public query func balance(request : BalanceRequest) : async BalanceResponse {
         switch(balGet(request)) {
             case (#ok(holder,tokenIndex, bal, allowance)) #ok(bal);
             case (#err(e)) #err(#InvalidToken);
         }
    };
    
    public shared({caller}) func burn(request : Nft.BurnRequest) : async Nft.BurnResponse {

        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

        if (Nft.User.validate(request.user) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance, allowance)) {
                 SNFT_burn(Nft.User.toAccountIdentifier(request.user), tokenIndex);
                 await ACC_burn(Nft.User.toAccountIdentifier(request.user), tokenIndex);

                let transactionId = await Cluster.history(_conf).add(#nft(#burn({created=Time.now();token = request.token; user=Nft.User.toAccountIdentifier(request.user); memo=request.memo})));

                return #ok({transactionId});
            }; 
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

    
    private func isTransferBound(caller: AccountIdentifier, meta :Metadata, vars: Metavars) : Bool {
            switch( caller == meta.author ) { 
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


    public shared({caller}) func transfer_link(request : Nft.TransferLinkRequest) : async Nft.TransferLinkResponse {
        
        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        if (Nft.User.validate(request.from) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwner(balRequireMinimum(balGet({token = request.token; user = request.from}),1),caller_user)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {
                 
                   switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            if (isTransferBound(Nft.User.toAccountIdentifier(caller_user), meta, vars) == true) return #err(#Rejected);

                            if (PWRConsume(tokenIndex, 2) == false) return #err(#OutOfPower);

                            _token2link.put(tokenIndex, request.hash);

                            #ok();
                    };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }

                
                 }; 
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
    };

    public shared({caller}) func claim_link(request : Nft.ClaimLinkRequest) : async Nft.ClaimLinkResponse {
    
        let keyHash = Blob.fromArray(SHA224.sha224(Blob.toArray(request.key)));
        if (Nft.User.validate(request.to) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        let (slot, tokenIndex) = Nft.TokenIdentifier.decode(request.token);

        if (slot != _slot) return #err(#Rejected);

        switch(_token2link.get(tokenIndex)) {
            case (?hash) {
                if (keyHash != hash) return #err(#Rejected);   

                switch(_balance.get(tokenIndex)) {
                    case (?from) {

                        switch(getMeta(tokenIndex)) {
                                case (#ok((meta,vars))) {

                                        // TODO: Delete token once used
                                        // if (AccountIdentifier.equal(from,Nft.User.toAccountIdentifier(request.to))) {

                                        // };

                                        SNFT_move(from,Nft.User.toAccountIdentifier(request.to), tokenIndex);
                                        await ACC_move(from,Nft.User.toAccountIdentifier(request.to), tokenIndex);

                                        resetTransferBindings(meta, vars);
                                        vars.lastTransfer := timeInMinutes();

                                        let transactionId = await Cluster.history(_conf).add(#nft(#transfer({created=Time.now();token = tokenId(tokenIndex); from=from; to=Nft.User.toAccountIdentifier(request.to); memo=Blob.fromArray([])})));
                                        addTransaction(vars, transactionId);

                                        return #ok({transactionId});
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



    // Get accountid and exact ICP amount
    public shared({caller}) func purchase( request: Nft.PurchaseRequest) : async Nft.PurchaseResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        
        let toUserAID = Nft.User.toAccountIdentifier(request.user);
        
        let (slot, tokenIndex) = Nft.TokenIdentifier.decode(request.token);
     

        switch(getMeta(tokenIndex)) {
            case (#ok((meta,vars))) {
                switch(SNFT_tidxGet(tokenIndex)) {
                    case(?seller) {

                        if (vars.price.amount == 0) return #err(#NotForSale);
                        let (topStorage, topOps, diffStorage, diffOps) = charge_calc_missing(meta, vars);


                        if (request.amount < vars.price.amount) return #err(#InsufficientPayment(vars.price.amount));

                        let recharge_cost =  _oracle.pwrFee + diffStorage + diffOps;
                        let payment = vars.price.amount - recharge_cost;
                        if (payment == 0) return #err(#Rejected);

                        SNFT_move(seller, toUserAID, tokenIndex);

                        vars.price := Nft.Price.NotForSale();


                        // recharge
                        vars.pwrStorage := topStorage;
                        vars.pwrOps := topOps;
                        vars.ttl := null;
                        vars.lastTransfer := timeInMinutes();

                        ignore try {
                            await ACC_move(seller, toUserAID, tokenIndex);
                            ()
                        } catch (e) {
                            ()
                        };

                        // move
                        let purchase = {
                            created = Time.now();
                            buyer = toUserAID;
                            amount = payment; 
                            seller;
                            token = request.token;
                            recharge = recharge_cost;
                            author = {address=meta.author; share=meta.authorShare};
                            marketplace = vars.price.marketplace;
                            affiliate = vars.price.affiliate;
                        };

                        let transactionId = await Cluster.history(_conf).add(#nft(#purchase(purchase)));
                        addTransaction(vars, transactionId);

                        #ok({transactionId; purchase});

                    };
                    case (_) {
                        #err(#InvalidToken);
                    };
                };
            };
            case (#err(e)) #err(#InvalidToken)
            };

    };
 

    public shared({caller}) func set_price(request: Nft.SetPriceRequest) : async Nft.SetPriceResponse {
            if (request.price.amount < 100000) return #err(#TooLow);
            if (request.price.amount > 100000000000) return #err(#TooHigh);

            if (Nft.User.validate(request.user) == false) return #err(#Other("Invalid user"));
            
            let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

            switch ( balRequireOwner(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {
                            if (meta.rechargeable == false) return #err(#Other("Can't sell nfts which are not rechargeable"));
                            if (isTransferBound(Nft.User.toAccountIdentifier(caller_user), meta, vars) == true) return #err(#NotTransferable);
                            
                            if (PWRConsume(tokenIndex, 1) == false) return #err(#OutOfPower);

                            let (topStorage, topOps, diffStorage, diffOps) = charge_calc_missing(meta, vars);
                            
                            let {amount; marketplace; affiliate} = request.price;

                            vars.price := {
                                amount = amount + diffStorage + diffOps + _oracle.pwrFee;
                                marketplace;
                                affiliate;
                                };

                            _priceIndex := _priceIndex + 1;

                            #ok();

                           };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }
           
            }; 
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
            };
    };

    

    public shared({caller}) func transfer(request : TransferRequest) : async TransferResponse {

        if (request.amount != 1) return #err(#Other("Must use amount of 1"));
        if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

        if (Nft.User.validate(request.from) == false) return #err(#Other("Invalid from"));
        if (Nft.User.validate(request.to) == false) return #err(#Other("Invalid to"));

        if (Nft.User.equal(request.from, request.to) == true) return #err(#Other("There is no need to transfer it to yourself"));

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.from}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {
                

                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            if (isTransferBound(Nft.User.toAccountIdentifier(caller_user), meta, vars) == true) return #err(#NotTransferable);
                            
                            if (PWRConsume(tokenIndex, 1) == false) return #err(#OutOfPower);

                            SNFT_move(Nft.User.toAccountIdentifier(request.from),Nft.User.toAccountIdentifier(request.to), tokenIndex);
                            await ACC_move(Nft.User.toAccountIdentifier(request.from),Nft.User.toAccountIdentifier(request.to), tokenIndex);

                            resetTransferBindings(meta, vars);
                            vars.lastTransfer := timeInMinutes();

                            let transactionId = await Cluster.history(_conf).add(#nft(#transfer({created=Time.now(); token =tokenId(tokenIndex); from=Nft.User.toAccountIdentifier(request.from); to=Nft.User.toAccountIdentifier(request.to); memo= request.memo})));
                            addTransaction(vars, transactionId);

                            return #ok({transactionId});
                    };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }
            }; 
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
        
    };

      
    public type ExtensionCanister = actor {
        nftanvil_use: shared ({
            token:TokenIdentifier;
            aid:AccountIdentifier;
            memo:Nft.Memo;
            useId: Text;
        }) -> async Result.Result<(), Text>
    };




    public shared({caller}) func use(request : Nft.UseRequest) : async Nft.UseResponse {

        if (Nft.User.validate(request.user) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));
        if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
 
        switch (balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.token; user = request.user}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {
                
                                let aid = Nft.User.toAccountIdentifier(holder);

                                switch(request.use) {
                                    case (#cooldown(duration)) {
                                        let isOnCooldown = switch(vars.cooldownUntil) {
                                            case (?a) timeInMinutes() <= a;
                                            case (null) false;
                                        };
                                        if (isOnCooldown) return #err(#OnCooldown);

                                        if (PWRConsume(tokenIndex, 1) == false) return #err(#OutOfPower);

                                        vars.cooldownUntil := ?(timeInMinutes() + duration);
                                    };
                                    case(#consume) {
                                        // Consumable USE save to History

                                        if (PWRConsume(tokenIndex, 1) == false) return #err(#OutOfPower);

                                        SNFT_burn(Nft.User.toAccountIdentifier(request.user), tokenIndex);
                                        await ACC_burn(Nft.User.toAccountIdentifier(request.user), tokenIndex);
                                    };
                                    case(#prove) {
                                        if (PWRConsume(tokenIndex, 1) == false) return #err(#OutOfPower);
                                    };
                                };

                                switch(request.customVar) {
                                    case (?v) {
                                        vars.customVar := ?v;
                                    };
                                    case (null) ();
                                };
                                
                                let transactionId = await Cluster.history(_conf).add(#nft(#use({created=Time.now();token = tokenId(tokenIndex); user=Nft.User.toAccountIdentifier(request.user); use=request.use; memo= request.memo})));
                                addTransaction(vars, transactionId);

                                #ok({transactionId});       
                           
                    };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }
           
            }; 
            case (#err(#InvalidToken)) return #err(#InvalidToken);
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

    public query func metadata(token : Nft.TokenIdentifier) : async Nft.MetadataResponse {
       
       let (slot, tokenIndex) = Nft.TokenIdentifier.decode(token);


        
        if (slot != _slot) return #err(#InvalidToken);

        switch(SNFT_tidxGet(tokenIndex)) {
            case (?bearer) {

                switch(getMeta(tokenIndex)) {
                    case (#ok((m,v))) {
                            #ok({
                            bearer = bearer;
                            data = m; 
                            vars = Nft.MetavarsFreeze(v)
                            });
                    };
                    case (#err()) {
                        #err(#InvalidToken);
                    }

                };

            };
            case (_) {
                #err(#InvalidToken);
            };
        }

           
    };
 
    public query func supply(token : Nft.TokenIdentifier) : async Nft.SupplyResponse {

        let (slot, tokenIndex) = Nft.TokenIdentifier.decode(token);

        if (slot != _slot) return #err(#InvalidToken);

        switch(SNFT_tidxGet(tokenIndex)) {
            case (?holder_stored) {
                #ok(1);
            };
            case (_) {
                #err(#InvalidToken);
            };
        }
       
           
    };



    public shared({caller}) func uploadChunk(request: Nft.UploadChunkRequest) : async () {
        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

        assert((switch(getMeta(request.tokenIndex)) {
                    case (#ok((meta,vars))) {
                          (meta.author == Nft.User.toAccountIdentifier(caller_user)) and ((meta.created + 10) > timeInMinutes()); // allows upload of assets up to 10min after minting
                    };
                    case (#err()) {
                       false
                    }
                }
            ));

        let ctype: Nat32 = switch(request.position) {
            case (#content) Nft.Chunks.TYPE_CONTENT;
            case (#thumb) Nft.Chunks.TYPE_THUMB;
        };
        
        let maxChunks: Nat32 = switch(request.position) { // Don't go over the bitmask maximum which is 255
            case (#content) Nft.Chunks.MAX_CONTENT_CHUNKS; 
            case (#thumb) Nft.Chunks.MAX_THUMB_CHUNKS;
        };

        switch(request.position) {
            case (#content) assert(request.data.size() <= 524288); // 512kb
            case (#thumb) assert(request.data.size() <= 131072);   // 128kb
        };

        assert(request.chunkIdx < maxChunks);

        let chunkId = chunkIdEncode(request.tokenIndex, request.chunkIdx, ctype);

        _chunk.put(chunkId, request.data);
    };

    private func deleteNftChunks(tokenIndex: Nft.TokenIndex) : () {
      
        // Delete all content chunks
        var cnt:Nat32 = 0;
        while (cnt < Nft.Chunks.MAX_CONTENT_CHUNKS) {
         
            _chunk.delete(chunkIdEncode(tokenIndex, cnt, Nft.Chunks.TYPE_CONTENT));

            cnt += 1;
    
        };

        // Delete all thumb chunks
        var tnt:Nat32 = 0;
        while (tnt < Nft.Chunks.MAX_THUMB_CHUNKS) {
         
            _chunk.delete(chunkIdEncode(tokenIndex, tnt, Nft.Chunks.TYPE_THUMB));

            tnt += 1;
        };
        
    };


    private func chunkIdEncode(tokenIndex: Nft.TokenIndex, chunkIndex:Nat32, ctype:Nat32) : Nat32 {
        (Nat32.fromNat(Nat16.toNat(tokenIndex)) << 16) | ((chunkIndex & 255) << 2) | (ctype);
    };

    private func chunkIdDecode(x:Nat32) : (tokenIndex:Nft.TokenIndex, chunkIndex:Nat32, ctype:Nat32) {
        (
            Nat16.fromNat(Nat32.toNat(x >> 16 )),
            (x >> 2) & 255,
            (x & 3)
        )
    };


    public shared({caller}) func fetchChunk(request: Nft.FetchChunkRequest) : async ?Blob {

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
                                     let callerAid = Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount);
                                     Nft.AccountIdentifier.equal(ownerAid,callerAid);
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
    let _workaround = actor(Principal.toText(Principal.fromActor(this))): actor { http_request_streaming_callback : shared () -> async () };


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

                            let target : ? Nft.Content = switch(ctype) {
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
                                                headers = [("Content-size", Nat32.toText(size)), ("Content-type", contentType), ("Cache-control", "public,max-age=31536000,immutable"), ("Access-Control-Allow-Origin","*") ]
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


    private func PWRConsume(tokenIndex: TokenIndex, ops: Nat64) : Nft.PWRConsumeResponse {
        switch( _metavars.get(tokenIndex)) {
            case (?vars) {
                let cost = ops * Cluster.Oracle.cycle_to_pwr(_oracle, Nft.Pricing.AVG_MESSAGE_COST);
                if (cost > vars.pwrOps) return false;

                vars.pwrOps := vars.pwrOps - cost;
                true
            };
            case (_) {
                false
            }
        }
    };

    private func charge_calc_missing(m:Nft.Metadata, v:Nft.Metavars) : (Nat64, Nat64,Nat64, Nat64) {

        let {pwrOps; pwrStorage} = Nft.MetavarsFreeze(v);

        let ttl:?Nat32 = null; // we are recharging to full always;

        let {quality; content; thumb; custom} = m;

        // Charge minting price
        let topStorage : Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.Pricing.priceStorage({ttl;custom;content;thumb;quality}));
        let topOps : Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.Pricing.priceOps({ttl}));

        let diffStorage = topStorage - pwrStorage;
        assert(diffStorage >= 0);
        let diffOps = topOps - pwrOps;
        assert(diffOps >= 0);
        let total = diffStorage + diffOps;

        return (topStorage, topOps, diffStorage, diffOps);
    };


    public shared({caller}) func recharge(request: Nft.RechargeRequest) : async Nft.RechargeResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        let (slot, tokenIndex) = Nft.TokenIdentifier.decode(request.token);

        switch(getMeta(tokenIndex)) {
                case (#ok((m,v))) {
                
                if (m.rechargeable == false) return #err(#Rejected);

                let (topStorage, topOps, diffStorage, diffOps) = charge_calc_missing(m,v);

                if (diffStorage + diffOps < 10000) return #err(#RechargeUnnecessary);

                let required_amount = diffStorage + diffOps;

                let ops =  switch(required_amount < request.amount) {
                    case (true) {
                        topOps + request.amount - required_amount; // In case someone sends more, it goes to ops;
                    };
                    case (false) {
                        topOps
                    }
                };

                if (request.amount < required_amount) return #err(#InsufficientPayment(required_amount));

                        v.pwrStorage := topStorage;
                        v.pwrOps := ops;
                        v.ttl := null;

                        #ok();
              
            };
            case (#err()) {
                #err(#InvalidToken);
            }
        };
    };

    // private func pwrExtract({from: AccountIdentifier; subaccount: ?Nft.SubAccount; amount: Balance}) : async Result.Result<(), Nft.TransferResponseError> {
    //       switch(await Cluster.pwr(_conf).transfer({
    //         from = #address(from);
    //         to = #address(Cluster.nft_address(_conf, _slot));
    //         amount;
    //         memo = Blob.fromArray([]);
    //         subaccount;
    //         })) {
    //             case (#ok({transactionId})) {
    //                 #ok();
    //             };
    //             case (#err(e)) {
    //                 return #err(e)
    //             };
    //         };
    // };

    private func SNFT_mint(author:AccountIdentifier, request: Nft.MintRequest) : async Nft.MintResponse {

        let m = request.metadata;

        // Charge minting price
        let mintPricePwrStorage : Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceStorage(request.metadata));
        let mintPricePwrOps : Nat64 = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceOps(request.metadata));
        let mintPricePwr : Nat64 = mintPricePwrOps + mintPricePwrStorage;


        // switch(await pwrExtract({from= author; amount= mintPricePwr; subaccount = request.subaccount})) {
        //     case (#ok()) {};
        //     case (#err(e)) return #err(#Pwr(e));
        // };

        let tokenIndex = _nextTokenId;
        _nextTokenId := _nextTokenId + 1;

        
        let timestamp:Nat32 = timeInMinutes();

        // Get class info, check if principal is allowed to mint
        
        let md : Metadata = {
            domain = m.domain;
            name = m.name;
            lore = m.lore;
            quality = m.quality;
            transfer = m.transfer;
            secret = m.secret;
            attributes = m.attributes;
            tags = m.tags;
            custom = m.custom;
            content = m.content;
            thumb = m.thumb; 
            author;
            authorShare = m.authorShare;
            created = timestamp;
            entropy = Blob.fromArray( Array_.amap(32, func(x:Nat) : Nat8 { Nat8.fromNat(Nat32.toNat(rand.get(8))) })); // 64 bits;
            rechargeable = m.rechargeable;
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
             var price = m.price;
             var pwrStorage = mintPricePwrStorage;
             var pwrOps = mintPricePwrOps;
             var ttl = m.ttl;
             var history = [];
             var allowance = null;
             var customVar = m.customVar;
             var lastTransfer = timestamp

        };

        let (topStorage, topOps, diffStorage, diffOps) = charge_calc_missing(md, mvar);
                            
        let {amount; marketplace; affiliate} = m.price;

        mvar.price := {
            amount = amount + diffStorage + diffOps + _oracle.pwrFee;
            marketplace;
            affiliate;
            };

        assert(switch(_meta.get(tokenIndex)) { // make some memory integrity checks
            case (?a) false;
            case (_) true;
        });

        _meta.put(tokenIndex, md);
        _metavars.put(tokenIndex, mvar);

        SNFT_put(author, tokenIndex);
        await ACC_put(author, tokenIndex);

        let transactionId = await Cluster.history(_conf).add(#nft(#mint({user=author; created=Time.now();token = tokenId(tokenIndex); pwr=mintPricePwr })));
        addTransaction(mvar, transactionId);

        return #ok({tokenIndex; transactionId});

    };

    private func addTransaction(vars: Metavars, transactionId: Nft.TransactionId) : () {
        let tmp = vars.history;
        let size = Array_.size(vars.history);
        let newSize = switch(size >= 20) { case(true) 20; case(false) size+1; };

        vars.history := Array.tabulate<Blob>(newSize, func(i:Nat) : Blob {
            if (i == 0) return transactionId;
            tmp[i-1];

            });
    };
    // public func mint_quote(request: Nft.MetadataInput) : async Nft.MintQuoteResponse {
    //     {
    //         transfer = _oracle.pwrFee;
    //         ops = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceOps(request));
    //         storage = Cluster.Oracle.cycle_to_pwr(_oracle, Nft.MetadataInput.priceStorage(request));
    //     }
    // };

    public shared({caller}) func mint(request: Nft.MintRequest) : async Nft.MintResponse {
        assert(Nft.APrincipal.isLegitimate(_conf.space, caller));

        let author:AccountIdentifier = Nft.User.toAccountIdentifier(request.user);

        if (Nft.User.validate(request.user) == false) return #err(#Invalid("Invalid To User"));

        if (_available == false) { return #err(#OutOfMemory) };

        if ((thresholdNFTCount  <= _nextTokenId) or (thresholdMemory <= Prim.rts_memory_size() )) {
            _available := false;
            await Cluster.router(_conf).event_nft_full();
            return #err(#OutOfMemory);
            };

        // validity checks
        if (request.metadata.secret == true) switch (request.metadata.content) {
            case (?#external(_)) {
                return #err(#Invalid("Can't have secret external content"));
            };
            case (?#ipfs(_)) {
                return #err(#Invalid("Can't have secret IPFS content"));
            };
            case (_) ();
        };


        if (Nft.MetadataInput.validate(request.metadata) == false) return #err(#Invalid("Meta invalid - Out of boundaries"));

        if (Nft.Share.validate(request.metadata.authorShare) == false) return #err(#Invalid("Minter share has to be between 0 and 100 (0-1%)"));

        if (request.metadata.rechargeable == false and request.metadata.price.amount != 0) return #err(#Invalid("Meta invalid - Can't sell non rechargeable NFTs"));


        await SNFT_mint(author, request);

    };

    // Calls func socket on the target token
    public shared({caller}) func plug(request: Nft.PlugRequest) : async Nft.PlugResponse {
        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
        if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));
        if (request.plug == request.socket) return #err(#Other("Cant plug in itself"));

        switch ( balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.plug; user = request.user}),1),caller_user, caller)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {

                if (PWRConsume(tokenIndex, 3) == false) return #err(#OutOfPower);

                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                            let (slot, _) = Nft.TokenIdentifier.decode(request.socket);
                            let socketCanister = Nft.APrincipal.fromSlot(_conf.space, slot);
                            let socketActor = actor (Principal.toText(socketCanister)) : Class;
                            switch(await socketActor.socket(request)) {
                                case (#ok()) {
                                    let to = Nft.User.toAccountIdentifier( #principal(socketCanister) );
                                    SNFT_move(Nft.User.toAccountIdentifier(request.user), to, tokenIndex);
                                    await ACC_move(Nft.User.toAccountIdentifier(request.user), to, tokenIndex);

                                    vars.lastTransfer := timeInMinutes();
                                    vars.price := Nft.Price.NotForSale();

                                    let transactionId = await Cluster.history(_conf).add(#nft(#socket({user=Nft.User.toAccountIdentifier(request.user); created=Time.now();plug = request.plug; socket=request.socket; memo=request.memo})));
                                    addTransaction(vars, transactionId);

                                    #ok({transactionId});
                                };
                                case (#err(e)) {
                                        #err(#SocketError(e));
                                }
                            };
                      

                    };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }
           
            };
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
    };

    // Calls the extension canister and asks if it accepts the plug
    public shared({caller}) func socket(request: Nft.SocketRequest) : async Nft.SocketResponse {
        


        if ( Nft.APrincipal.isLegitimate(_conf.space, caller) == false ) return #err(#NotLegitimateCaller);
        //if (Array_.exists(_conf.nft, caller, Principal.equal) == false) return #err(#NotLegitimateCaller);
        
        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));

        switch ( balRequireOwner(balRequireMinimum(balGet({token = request.socket; user = request.user}),1),request.user)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {
     
                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                        // switch(switch(meta.collectionId) {
                        //     case (?collectionId) {

                        //         // get permission from class canister
                        //         switch (await Cluster.collection(_conf).socket_allow(request, collectionId)) {
                        //             case (#ok()) {                                        
                        //                 #ok()
                        //             };
                        //             case (#err(e)) #err(#ClassError(e));
                        //         };
                        //     };
                        //     case (null) {
                        //         // canisters without class don't need permission
                        //         #ok()
                        //     }
                        // }) {
                        //     case (#ok()) {
                                if (Iter.size(Iter.fromArray(vars.sockets)) >= 10) return #err(#SocketsFull);
                                vars.sockets := Array.append(vars.sockets, [request.plug]);
                                #ok();
                        //     };
                        //     case (#err(e)) #err(e);
                        // }
                        
                    };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }
           
            };
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
        };
    };

    // Unsockets and returns it to owner
    public shared({caller}) func unsocket(request: Nft.UnsocketRequest) : async Nft.UnsocketResponse {

        
        if (Nft.Memo.validate(request.memo) == false) return #err(#Other("Invalid memo"));


        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
    
            switch (balRequireOwnerOrAllowance(balRequireMinimum(balGet({token = request.socket; user = request.user}),1),caller_user, caller)) {
                case (#ok(holder, tokenIndex, bal:Nft.Balance,allowance)) {
        
                    if (PWRConsume(tokenIndex, 3) == false) return #err(#OutOfPower);

                    switch(getMeta(tokenIndex)) {
                        case (#ok((meta,vars))) {

                                let (slot, _) = Nft.TokenIdentifier.decode(request.plug);
                          
                                let plugActor = actor (Principal.toText(Nft.APrincipal.fromSlot(_conf.space, slot))) : Class;

                                switch(await plugActor.unplug(request)) {
                                    case (#ok()) {
                                        
                                        //remove from socket metavars
                                        vars.sockets := Array.filter( vars.sockets, func (tid:TokenIdentifier) : Bool {
                                            tid != request.plug
                                        });

                                        let transactionId =  await Cluster.history(_conf).add(#nft(#unsocket({user=Nft.User.toAccountIdentifier(request.user); created=Time.now();plug = request.plug; socket=request.socket; memo = request.memo})));
                                        addTransaction(vars, transactionId);

                                        #ok({transactionId});
                                    };
                                    case (#err(e)) #err(#UnplugError(e));
                                }
                             
                              
                            
                        };
                        case (#err()) {
                            #err(#InvalidToken);
                        }
                    }
            
                };
                case (#err(#InvalidToken)) return #err(#InvalidToken);
                case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
                case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
                case (#err(e)) return #err(#Other("Something went wrong"));
            };

    };


// Unsockets and returns it to owner
    public shared({caller}) func unplug(request: Nft.UnsocketRequest) : async Nft.UnplugResponse {

        if ( Nft.APrincipal.isLegitimate(_conf.space, caller) == false ) return #err(#NotLegitimateCaller);

        // if (Array_.exists(_conf.nft, caller, Principal.equal) == false) return #err(#NotLegitimateCaller);

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, null));
    
            switch (balRequireOwner(balRequireMinimum(balGet({token = request.plug; user = caller_user}),1),caller_user)) {
                case (#ok(holder, tokenIndex, bal:Nft.Balance, allowance)) {
        
                    switch(getMeta(tokenIndex)) {
                        case (#ok((meta,vars))) {
                            SNFT_move(Nft.User.toAccountIdentifier(#principal(caller)),Nft.User.toAccountIdentifier(request.user), tokenIndex);
                            await ACC_move(Nft.User.toAccountIdentifier(#principal(caller)),Nft.User.toAccountIdentifier(request.user), tokenIndex);

                            #ok();
                        };
                        case (#err()) {
                            #err(#InvalidToken);
                        }
                    }
                };
                case (#err(#InvalidToken)) return #err(#InvalidToken);
                case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
                case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
                case (#err(e)) return #err(#Other("Something went wrong"));
            };

    };

    public query func bearer(token : Nft.TokenIdentifier) : async Nft.BearerResponse {
           let (slot, tokenIndex) = Nft.TokenIdentifier.decode(token);
           
            if (slot != _slot) return #err(#InvalidToken);
            
            switch(SNFT_tidxGet(tokenIndex)) {
                case (?holder_stored) {
                    #ok(holder_stored);
                };
                case (_) {
                    #err(#InvalidToken);
                };
            }
    };

    public query func allowance(request : Nft.Allowance.Request) : async Nft.Allowance.Response {
        if (Nft.User.validate(request.owner) == false) return #err(#Other("Invalid User. Account identifiers must be all uppercase"));

        switch ( balGetAllowance(balGet({token = request.token; user = request.owner}),request.spender)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance, allowance)) {
                return #ok(allowance);
            };
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(e)) return #err(#Other("Something went wrong"));
         } 
    };
    
    // NOTE: Currently approve allows only one principal to be allowed, which means, 
    // the owner can't list NFT in multiple marketplaces. This will be changed.
    public shared({caller}) func approve(request : Nft.Allowance.ApproveRequest) : async Nft.Allowance.ApproveResponse {

        let caller_user:Nft.User = #address(Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount));
        
        // if (request.allowance != 1) return #err(#Other("NFT allowance has to be 1"));

        switch ( balRequireOwner(balRequireMinimum(balGet({token = request.token; user = caller_user}), 1), caller_user)) {
            case (#ok(holder, tokenIndex, bal:Nft.Balance, allowance)) {
                
                if (PWRConsume(tokenIndex, 1) == false) return #err(#OutOfPower);

                switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {

                        switch (request.allowance) {
                            case (1) {
                                vars.allowance := null;
                            };
                            case (0) {
                                vars.allowance := ?request.spender;
                            };
                            case (_) {
                                return #err(#Other("NFT allowance has to be 1 or 0"))
                            }
                        };

                        let transactionId = await Cluster.history(_conf).add(#nft(#approve({created=Time.now();token = request.token; user=Nft.User.toAccountIdentifier(caller_user); spender=request.spender})));
                        addTransaction(vars, transactionId);

                        #ok({transactionId});
                   
                    };
                    case (#err()) {
                         #err(#InvalidToken);
                    }
                }
            };
            case (#err(#InvalidToken)) return #err(#InvalidToken);
            case (#err(#Unauthorized(e))) return #err(#Unauthorized(e));
            case (#err(#InsufficientBalance(e))) return #err(#InsufficientBalance(e));
            case (#err(e)) return #err(#Other("Something went wrong"));
         }
    };


     

    public func wallet_receive() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
        _cycles_recieved += accepted;
    };



    public query func stats () : async (Cluster.StatsResponse and { 
        minted: Nat16;
        transfers: Nat32;
        burned: Nat32;
    }) {
        {
            minted = _nextTokenId;
            burned = _statsBurned;
            transfers = _statsTransfers;
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

    // Internal functions which help for better code reusability

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
        _token2link.delete(tidx);

        // await accountActor(aid).rem(aid, tidx);   
    };

    private func SNFT_burn(aid: AccountIdentifier, tidx: TokenIndex) :  () {
        SNFT_del(aid, tidx);
        _meta.delete(tidx);
        deleteNftChunks(tidx);
        _statsBurned := _statsBurned + 1;
    };

    private func ACC_burn(aid: AccountIdentifier, tidx: TokenIndex) :  async () {
        await ACC_del(aid, tidx);
    };

    private func ACC_put(aid: AccountIdentifier, tidx: TokenIndex) : async () {
        await Cluster.accountFromAid(_conf, aid).add(aid, tidx);
        
    };

    private func ACC_del(aid: AccountIdentifier, tidx: TokenIndex) : async () {
        await Cluster.accountFromAid(_conf, aid).rem(aid, tidx);   
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
        Principal.equal(cannisterId, Principal.fromActor(this));
    };

    private func tokenId(idx: TokenIndex) : TokenIdentifier {
        Nft.TokenIdentifier.encode(_slot, idx);
    };

    // ***** Balance 
    private func balGet(request : BalanceRequest) : BalanceInt {

       let (slot, tokenIndex) = Nft.TokenIdentifier.decode(request.token);

        if (slot != _slot) return #err(#InvalidToken);
        
        switch(SNFT_tidxGet(tokenIndex)) {

            case (?holder_stored) {
                let holder = request.user;
                if (Nft.AccountIdentifier.equal(holder_stored, Nft.User.toAccountIdentifier(holder)) == true) {
                    #ok(holder, tokenIndex,1,0);
                } else {
                    #ok(holder, tokenIndex,0,0);
                }
            };
            case (_) {
                #err(#InvalidToken);
            };
        }

    
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
                 if (Nft.User.equal(caller,holder) == false) return #err(#Unauthorized(Nft.User.toAccountIdentifier(holder)));
                #ok(holder, tokenIndex, bal, allowance); 
            };
            case (#err(e)) #err(e);
        };
    }; 

    private func balGetAllowance(bal : BalanceInt, caller:Principal) : BalanceInt {
        switch (bal) {
            case (#ok(holder, tokenIndex, bal, allowance)) {

            switch(getMeta(tokenIndex)) {
                    case (#ok((meta,vars))) {
                        switch( vars.allowance) {
                            case (?allowed_principal) {
                                switch (Principal.equal(caller, allowed_principal)) {
                                    case true {
                                        if (bal < 1) return #err(#Other("Internal data corrupted"));
                                        #ok(holder, tokenIndex, bal, 1);
                                    };
                                    case false #ok(holder, tokenIndex, bal, 0);   
                                };
                            };
                            case (_) #ok(holder, tokenIndex, bal, 0);
                        };
                   
                    };
                    case (#err()) {
                        #err(#InvalidToken);
                    }
                }

             };
           case (#err(e)) #err(e);
        };
    };

   
    private func balRequireOwnerOrAllowance(bal : BalanceInt, owner:User, caller:Principal) :  BalanceInt {
        switch (balGetAllowance(bal, caller)) {
            case (#ok(holder, tokenIndex, bal, allowance)) {
                 let errResult = #err(#Unauthorized(Nft.User.toAccountIdentifier(holder)));
                 let okResult = #ok(holder, tokenIndex, bal, allowance);

                 if (Nft.User.equal(owner,holder) == true) return okResult;
                 if (allowance != 1) return errResult;
                 return okResult;


            };
            case (#err(e)) #err(e);
        };
    };

    


};

