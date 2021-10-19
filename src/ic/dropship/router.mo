import Array  "mo:base/Array";
import Iter "mo:base/Iter";

import Principal "mo:base/Principal";
// import Ext "../lib/ext.std/src/Ext";

import ICType "./ictype";
import NFT "./nft";
import Cycles "mo:base/ExperimentalCycles";


shared({caller = owner}) actor class Router() = this {

    // private let threshold = 2147483648; //  ~2GB

    private let cyclesForNewCanister = 130_000_000_000;
                                        
    private stable var _nft_canisters : [NFT.NFT] = [];

    let IC = actor "aaaaa-aa" :  ICType.interface;

    private stable var _nft_canisters_count:Nat = 0;


    public func debug_reset() : async () {
        _nft_canisters := [];
        _nft_canisters_count := 0;
    };

    public shared({caller}) func init() : async () {
        await addNFTCanister();
    };

    public shared({caller}) func reportOutOfMemory() : async () {
        // Todo check if its coming from a canister or owner
        await addNFTCanister();
    };

    public query func getAvailable() : async Principal {
        Principal.fromActor(_nft_canisters[_nft_canisters_count - 1]);
    };

    private func addNFTCanister() : async () {
            Cycles.add(cyclesForNewCanister);
            let new = await NFT.NFT();
            let principal = Principal.fromActor(new);

            await IC.update_settings({
            canister_id = principal; 
            settings = { 
                controllers = ?[owner, Principal.fromActor(this)];
                compute_allocation = null;
                //  memory_allocation = ?4_294_967_296; // 4GB
                memory_allocation = null; // 4GB
                freezing_threshold = ?31_540_000
                }
            });

            _nft_canisters := Array.append<NFT.NFT>(_nft_canisters, [new]);
            _nft_canisters_count := _nft_canisters_count + 1;
    };

    

    // public shared({caller}) func mintNFT(request: Ext.NonFungible.MintRequest) : async Ext.NonFungible.MintResponse {

    //     // if (_nft_canisters_count == 0) await addNFTCanister();

    //     // let atokens = await ACCESSCONTROL.getBalance(caller);
    //     // assert(atokens >= 1);
    //     // assert((await ACCESSCONTROL.consumeAccess(caller, 1)) == #ok(true));
    

    //     // switch(await _nft_canisters[_nft_canisters_count - 1].mintNFT(request)) {
    //     //     case (#ok(re)) #ok(re);
    //     //     case (#err(#OutOfMemory)) {
    //     //             await addNFTCanister();
    //     //             await _nft_canisters[_nft_canisters_count - 1].mintNFT(request);
    //     //     };
    //     //     case (#err(e)) #err(e);
    //     // }

    // };




    public query func getCanisters() : async {
        nft:[Text];
        } {
        
        {
        nft = Iter.toArray(Iter.map(Iter.fromArray(_nft_canisters), func(x:NFT.NFT) : Text { Principal.toText(Principal.fromActor(x)); }));
        }
    };






}