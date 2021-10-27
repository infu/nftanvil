import Array  "mo:base/Array";
import Iter "mo:base/Iter";

import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";

// import Ext "../lib/ext.std/src/Ext";

import ICType "./ictype";
import NFT "./nft";
import AccessControl "../accesscontrol/access";

import Account "./account";

import Cycles "mo:base/ExperimentalCycles";

//1000000000000

shared({caller = owner}) actor class Router() = this {

    // private let threshold = 2147483648; //  ~2GB

    private let cyclesForNewCanister = 400_000_000_000;
                                        
    private stable var _nft_canisters : [NFT.NFT] = [];
    private stable var _account_canisters : [Account.Account] = [];

    private stable var _access_canister : [AccessControl.AccessControl] = [];

    let IC = actor "aaaaa-aa" : ICType.interface;

    private stable var _nft_canisters_next_id:Nat32 = 0;
    private stable var _account_canisters_next_id:Nat32 = 0;


    public shared({caller}) func debug_reset() : async () {

        //TODO: !!!! SECURE THIS

        _nft_canisters := [];
        _nft_canisters_next_id := 0;

        _account_canisters := [];
        _account_canisters_next_id := 0;

        // create account canisters 
        var can =0; 

        await addAccessCanister();

        while(can < 1) {
            await addAccountCanister();
            can := can + 1;
        };

        // create one NFT canister
        await addNFTCanister();
     
    };

    public shared({caller}) func reportOutOfMemory() : async () {
        // Todo check if its coming from a canister or owner
        await addNFTCanister();
    };

    public query func getAvailable() : async Principal {
        Principal.fromActor(_nft_canisters[ Nat32.toNat(_nft_canisters_next_id) - 1]);
    };

    private func addNFTCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let slot = _nft_canisters_next_id;
            _nft_canisters_next_id := _nft_canisters_next_id + 1;

            let access_can:Text = Principal.toText(Principal.fromActor(_access_canister[0]));
              

            let new = await NFT.NFT({_acclist = getAccountCanisters(); _slot= slot; _accesscontrol_can = access_can; _debug_cannisterId=null});
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = { 
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null; 
                freezing_threshold = ?31_540_000
                }
            });

            _nft_canisters := Array.append<NFT.NFT>(_nft_canisters, [new]);

            // register it inside account canisters
            let it = Iter.fromArray(_account_canisters);
            for (x in it) {
                await x.addAllowed(Principal.fromActor(new), slot);
            }
    };

    private func addAccountCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await Account.Account();
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = { 
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null; 
                freezing_threshold = ?31_540_000
                }
            });

            

            _account_canisters := Array.append<Account.Account>(_account_canisters, [new]);
            _account_canisters_next_id := _account_canisters_next_id + 1;
    };
    


    private func addAccessCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await AccessControl.AccessControl();
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = { 
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                memory_allocation = null; 
                freezing_threshold = ?31_540_000
                }
            });

            _access_canister := [new];

    };


    private func getNFTCanisters() : [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_nft_canisters), func(x:NFT.NFT) : Text { Principal.toText(Principal.fromActor(x)); }));
    };

    private func getAccountCanisters() : [Text] {
        Iter.toArray(Iter.map(Iter.fromArray(_account_canisters), func(x:Account.Account) : Text { Principal.toText(Principal.fromActor(x)); }));
    };

    public query func fetchSetup() : async {access:Text; acclist: [Text]} {
         {
         access = Principal.toText(Principal.fromActor(_access_canister[0]));
         acclist = getAccountCanisters();
         }
    };



}