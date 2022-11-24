import Text "mo:base/Text";
import Nft "./type/nft_interface";

import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Int32 "mo:base/Int32";

import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";

import Cycles "mo:base/ExperimentalCycles";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Array_ "./lib/Array";
import HashSmash "./lib/HashSmash";
import Ledger  "./type/ledger_interface";


import Prim "mo:prim"; 
import Cluster  "./type/Cluster";
import Account "./type/account_interface";
import TrieRecord "./lib/TrieRecord";

import Map "./lib/zh/Map";
import Debug "mo:base/Debug";


shared({ caller = _installer }) actor class Class() = this {
    private stable var _conf : Cluster.Config = Cluster.Config.default();
    private stable var _cycles_recieved : Nat = Cycles.balance();
    private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();
    private stable var _slot : Nft.CanisterSlot = 0;

    private stable var _total_accounts : Nat = 0;

    let { bhash; nhash } = Map; // different hash types


     // TYPE ALIASES
    type AccountIdentifier = Nft.AccountIdentifier;
    type TokenIdentifier = Nft.TokenIdentifier;
    type TokenIndex = Nft.TokenIndex;
    type Slot = Nft.CanisterSlot;

    private stable var _tmpAccount: [(AccountIdentifier, Account.AccountRecordSerialized)] = [];

    private var _account: TrieRecord.TrieRecord<AccountIdentifier, Account.AccountRecord, Account.AccountRecordSerialized> = TrieRecord.TrieRecord<AccountIdentifier, Account.AccountRecord, Account.AccountRecordSerialized>( _tmpAccount.vals(),  Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash, Account.AccountRecordSerialize, Account.AccountRecordUnserialize);
   
    let containers = Map.new<AccountIdentifier, Account.ContainerStore>();

    private var _nextContainerId : Account.ContainerId = 20;

    //Handle canister upgrades
    system func preupgrade() {
        _tmpAccount := Iter.toArray(_account.serialize());
    };

    system func postupgrade() {
        _tmpAccount := [];
        _cycles_recieved := Cycles.balance();
    };
    
    private let ledger : Ledger.Interface = actor("ryjl3-tyaaa-aaaaa-aaaba-cai");


    public shared({caller}) func container_create(subaccount: ?Nft.SubAccount, tokens: [Account.ContainerToken], requirements: [Account.ContainerToken]) : async Result.Result<{containerId: Nat; c_aid: Nft.AccountIdentifier}, Text> {

        let aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);

        let tokens_count = Iter.size(Iter.fromArray(tokens));

        let container : Account.Container = {
            var unlocked = false;
            tokens;
            requirements;
            verifications = Array.init(tokens_count, false)
        };

        let containerId = _nextContainerId;
        _nextContainerId += 1;

        let cstore : Account.ContainerStore = switch(Map.get(containers, bhash, aid)) {
            case (?cstore) {
                cstore
            };
            case (null) {
                let cstore = Map.new<Account.ContainerId, Account.Container>();
                Map.set(containers, bhash, aid,  cstore);
                cstore
            };
        };

        Map.set(cstore, nhash, containerId, container);

        let container_subaccount = Nft.SubAccount.fromNat(100000 + containerId);
        let container_aid =  Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?container_subaccount);

        #ok({containerId; c_aid = container_aid})
    };

    public shared({caller}) func container_swap(subaccount: ?Nft.SubAccount, takerContainerId: Account.ContainerId, makerContainerId: Account.ContainerId, makerAid: Nft.AccountIdentifier) : async Result.Result<(), Text> {
        let aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);

        switch(Map.get(containers, bhash, aid)) {
            case (?tstore) {
                switch(Map.get(tstore, nhash, takerContainerId)) {
                    case (?takerContainer) {
                        if (takerContainer.unlocked) return #err("takerContainer unlocked, swap impossible");

                        switch(Map.get(containers, bhash, makerAid)) {
                                case (?mstore) {
                                    switch(Map.get(mstore, nhash, makerContainerId)) {
                                        case (?makerContainer) {
                                            if (makerContainer.unlocked) return #err("makerContainer unlocked, swap impossible");

                                            // make sure requirements are covered 
                                            var all_ok = true;
                                            for (makerReqToken in Iter.fromArray(makerContainer.requirements)) {
                                            
                                                var matching = false;
                                                var idx = 0;
                                                for (takerToken in Iter.fromArray(takerContainer.tokens)) {
                                                    if (takerToken == makerReqToken and takerContainer.verifications[idx] == true) matching := true;
                                                    idx += 1;
                                                };
                                                if (matching == false) all_ok := false;
                                            
                                            };

                                            if (all_ok == false) return #err("Mismatched contents and requirements");
                                            // make the actual swap
                                            Map.delete(tstore, nhash, takerContainerId);
                                            Map.delete(mstore, nhash, makerContainerId);

                                            Map.set(mstore, nhash, takerContainerId, takerContainer);
                                            Map.set(tstore, nhash, makerContainerId, makerContainer);

                                            #ok();
                                            
                                        };
                                        case(null) {
                                            return #err("makerContainer not found");
                                        };
                                    };
                                };
                                case (null) {
                                    return #err("Maker account not found");
                                };
                            };

                    };
                    case(null) {
                        return #err("takerContainer not found");
                    };
                };
            };
            case (null) {
                return #err("Taker account not found");
            };
        };

    };

    public query func container_info(aid: Nft.AccountIdentifier, containerId: Account.ContainerId) : async Result.Result<Account.ContainerPublic, Text> {
          switch(Map.get(containers, bhash, aid)) {
            case (?tstore) {
                switch(Map.get(tstore, nhash, containerId)) {
                    case (?v) {
                        let res : Account.ContainerPublic = {
                            unlocked = v.unlocked;
                            tokens = v.tokens;
                            requirements = v.requirements;
                            verifications = Array.freeze(v.verifications)
                        };
                        #ok(res);
                    };
                    case (null) {
                        return #err("Container not found")
                    };
                };
            };
            case (null) {
                return #err("Account not found")
            };
        }
    };

    public shared({caller}) func container_list(subaccount: ?Nft.SubAccount) : async [(Account.ContainerId, Account.ContainerPublic)] {

        let aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);

        switch(Map.get(containers, bhash, aid)) {
            case (?cstore) {
                
               Iter.toArray(Iter.map<(Account.ContainerId, Account.Container), (Account.ContainerId, Account.ContainerPublic)>(Map.entries(cstore), func(id, v)  { 
                (id, {
                    unlocked = v.unlocked;
                    tokens = v.tokens;
                    requirements = v.requirements;
                    verifications = Array.freeze(v.verifications)
                })
               }));
            };
            case (null) {
                []
            };
        };
    };

    public shared({caller}) func container_verify(subaccount: ?Nft.SubAccount, containerId: Account.ContainerId, tokenIndex: Nat) : async Result.Result<(), Text> {
        let aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);
        let container_subaccount = Nft.SubAccount.fromNat(100000 + containerId);
        let container_aid =  Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?container_subaccount);

        switch(Map.get(containers, bhash, aid)) {
            case (?cstore) {
                switch(Map.get(cstore, nhash, containerId)) {
                    case (?container) {
                            switch(container.tokens[tokenIndex]) {
                                case (#nft(nft)) {
                                    switch(await Cluster.nftFromTid(_conf, nft.id).bearer(nft.id)) {
                                        case (#ok(bearer)) {
                                            if (bearer == container_aid) {
                                                container.verifications[tokenIndex] := true;
                                                #ok();
                                            } else return #err("NFT Bearer is different");
                                        };
                                        case (#err(e)) {
                                            return #err(debug_show(e));
                                        };
                                    };
                                };
                                case (#ft(contft)) {
                                    let {ft} = await Cluster.pwrFromAid(_conf, container_aid).balance({user = #address(container_aid)});
                                    Debug.print("HELLO");
                                    Debug.print(debug_show(ft));
                                    Debug.print(debug_show(contft));

                                    for ((id, balance) in Iter.fromArray(ft)) {
                                        if (id == contft.id and balance == contft.balance) {
                                            container.verifications[tokenIndex] := true;
                                            return #ok();
                                        };
                                    };
                                    return #err("FT couldn't be verified")
                              
                                };
                            };                   
                    };
                    case (null) {
                        return #err("Container not found");
                    };
                };
            };
            case (null) {
                return #err("Account not found");

            };
        };
    };

    public shared({caller}) func container_unlock(subaccount: ?Nft.SubAccount, containerId: Account.ContainerId) : async Result.Result<(), Text> {
        let aid = Nft.AccountIdentifier.fromPrincipal(caller, subaccount);
        let container_subaccount = Nft.SubAccount.fromNat(100000 + containerId);
        let container_aid =  Nft.AccountIdentifier.fromPrincipal(Principal.fromActor(this), ?container_subaccount);

        switch(Map.get(containers, bhash, aid)) {
            case (?cstore) {
                switch(Map.get(cstore, nhash, containerId)) {
                    case (?container) {
                            container.unlocked := true;
                            // transfer tokens back
                            let tokens_count = Iter.size(Iter.fromArray(container.tokens));

                            var idx = 0;
                            while (idx < tokens_count) {
                                switch(container.tokens[idx]) {
                                    case (#nft(nft)) {
                                        ignore Cluster.nftFromTid(_conf, nft.id).transfer({
                                            token = nft.id;
                                            from = #address(container_aid);
                                            to = #address(aid);
                                            memo = Blob.fromArray([]);
                                            subaccount = ?container_subaccount;  
                                        });
                                    };
                                    case (#ft(ft)) {
                                        ignore Cluster.pwrFromAid(_conf, container_aid).transfer({
                                            token = ft.id;
                                            amount = ft.balance;
                                            from = #address(container_aid);
                                            to = #address(aid);
                                            memo = Blob.fromArray([]);
                                            subaccount = ?container_subaccount;
                                        });
                                    };
                                };
                                idx += 1;
                            };

                            // Map.delete(cstore, nhash, containerId);
                            #ok();
                    };
                    case (null) {
                        return #err("Container not found");
                    }
                }
            };
            case (null) {
                return #err("Account not found");
            };
        };
    };

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

    public shared ({caller}) func add(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
        assert(Cluster.aid2slot(_conf, aid) == _slot);

        switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
            case (?slot) {
               let tid = Nft.TokenIdentifier.encode(slot, idx);

               let r = switch(_account.get(aid)) {
                   case (?ac) ac;
                   case (_) {
                        _total_accounts += 1;
                        let blank = Account.AccountRecordBlank();
                        _account.put(aid, blank);  
                        blank;
                    }
               };

               r.tokens.add(tid);
               
               
               //HashSmash.add<AccountIdentifier, TokenIdentifier>(_account, aid, tid, Nft.TokenIdentifier.equal, Nft.TokenIdentifier.hash);
            };
            case (_) { () }
        }
    };

    public shared ({caller}) func rem(aid: AccountIdentifier, idx: TokenIndex) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
        assert(Cluster.aid2slot(_conf, aid) == _slot);

        switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
            case (?slot) { 
               let tid = Nft.TokenIdentifier.encode(slot, idx);

               let r = switch(_account.get(aid)) {
                   case (?ac) {
                       ac.tokens.rem(tid); //HashSmash.rem<AccountIdentifier,TokenIdentifier>(_account, aid, tid);
                       //TODO: Garbage collect if empty
                   };
                   case (_) { () }
               };
            };
            case (_) { () }
        }
    };

    public query func meta(aid: AccountIdentifier) : async ?Account.AccountMeta {
        switch(_account.get(aid)) {
            case (?ac) {
                ?{
                    info = ac.info;
                    transactions = ac.transactions;
                }
            };
            case (_) { null }
        };
    };

    public query func list(aid: AccountIdentifier, from:Nat, to:Nat) : async [TokenIdentifier] {
        assert(Nft.User.validate(#address(aid)) == true);
        let total = to - from;
        assert(total <= 100);

        let rez:[var TokenIdentifier] = Array.init<TokenIdentifier>(total, 0);

          switch(_account.get(aid)) {
                   case (?acc) {
                      
                    let it = acc.tokens.list(); //HashSmash.list<AccountIdentifier,TokenIdentifier>(_account, aid);

                    var index = 0;
                    let pstart = from;
                    let pend = to;
                    label l for (tid:TokenIdentifier in it) {
                        if (index >= pend) break l;

                        if ((index >= pstart)) {
                            rez[index - pstart] :=  tid;
                        };
                        index := index + 1;
                    };

                    return Array.freeze(rez); 
                    
        };
            case (_) { return [] }
        };
    };

    public shared({caller}) func add_transaction(aid: AccountIdentifier, tx: Nft.TransactionId) : async () {
        assert(Nft.User.validate(#address(aid)) == true);
            
            switch(Nft.APrincipal.toSlot(_conf.space, caller)) {
                case (?slot) {

                let r = switch(_account.get(aid)) {
                    case (?ac) ac;
                    case (_) {
                            return ();
                        }
                };

                addTransaction(r, tx);
                
                };
                case (_) { () }
            }
    };

    private func addTransaction(r: Account.AccountRecord, transactionId: Nft.TransactionId) : () {
        let tmp = r.transactions;
        let size = Array_.size(r.transactions);
        let newSize = switch(size >= 20) { case(true) 20; case(false) size+1; };

        r.transactions := Array.tabulate<Blob>(newSize, func(i:Nat) : Blob {
            if (i == 0) return transactionId;
            tmp[i-1];
            });
    };
    
    public query func stats() : async (Cluster.StatsResponse and { 
        total_accounts : Nat;
    }) {
        {
            total_accounts = _total_accounts;
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