import Nft "./type/nft_interface";
import Blob_ "./lib/Blob";

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import SHA256 "mo:sha/SHA256";
import Hex "mo:encoding/Hex";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Blob "mo:base/Blob";

shared({caller = _installer}) actor class ANV() = this {

    public type Balance = Nft.Balance;
    public type AccountIdentifier = Nft.AccountIdentifier;
    public type TokenIdentifier = Nft.TokenIdentifier;
  
    private stable var _tmpBalance : [(AccountIdentifier, Balance)] = [];
    private var _balance : HashMap.HashMap<AccountIdentifier, Balance> = HashMap.fromIter(_tmpBalance.vals(), 0, Nft.AccountIdentifier.equal, Nft.AccountIdentifier.hash);
    
    public type BlockIndex = Nat32;
    public type BlockHash = Blob;
    public type BlockTimestamp = Time.Time;
    public type TransactionAmount = Nft.Balance;
    public type TransactionFrom = AccountIdentifier;
    public type TransactionTo = AccountIdentifier;
    public type Block = (TransactionFrom, TransactionTo, TransactionAmount, BlockTimestamp, BlockHash);

    private stable var _tmpBlockchain : [(BlockIndex, Block)] = [];
    private var _blockchain : HashMap.HashMap<BlockIndex, Block> = HashMap.fromIter(_tmpBlockchain.vals(), 0, Nat32.equal, func (x:Nat32): Nat32 {x});
    
    private stable var _blockIndex:Nat32 = 0;

    system func preupgrade() {
      _tmpBalance := Iter.toArray(_balance.entries());
      _tmpBlockchain := Iter.toArray(_blockchain.entries());
    };

    system func postupgrade() {
      _tmpBalance := [];
      _tmpBlockchain := [];
    };

    private func myTokenId() : TokenIdentifier {
      Nft.TokenIdentifier.encode( Principal.fromActor(this), 0);
    };

    public query func tokenId() : async TokenIdentifier {
      myTokenId();
    };

    public query func balance(request: Nft.BalanceRequest) : async Nft.BalanceResponse {
      if (request.token != myTokenId()) return #err(#InvalidToken(request.token));
      
      let aid = Nft.User.toAccountIdentifier(request.user);
      switch(_balance.get(aid)) {
          case (?a) #ok(a);
          case (_) #ok(0);
      };
    };

    public query func dumpBalances() : async [(AccountIdentifier, Balance)] {
        Iter.toArray(_balance.entries());
    };

    public query func dumpBlockchain() : async [(BlockIndex, Block)] {
        Iter.toArray(_blockchain.entries());
    };

    public shared({caller}) func adminAllocate({user:Nft.User; amount:TransactionAmount}) : async (BlockIndex, Block) {
        let aid = Nft.User.toAccountIdentifier(user);

        assert(caller == _installer);
        let current:Nat64 = switch(_balance.get(aid)) {
            case (?a) a;
            case (_) 0;
        };

        let newBalance : Balance = current + amount;

        _balance.put(aid, newBalance);

        newBlock({from = "0"; to = aid; amount = amount})
    };

    private func newBlock({from: TransactionFrom; to:TransactionTo; amount: TransactionAmount}) : (BlockIndex, Block) {
        _blockIndex := _blockIndex + 1;
        let newBlockIndex = _blockIndex;
        let time = Time.now();
        let a = Blob.toArray(from);
        let b = Blob.toArray(to);
        let c = Blob_.nat64ToBytes(amount);
        let d = Blob_.nat64ToBytes(Nat64.fromIntWrap(time));
        let e = switch(_blockchain.get(newBlockIndex - 1 )) {
            case (?a) Blob.toArray(a.4);
            case (_) []
        };
        let f:[[Nat8]] = [a,b,c,d,e];

        let hash = Blob.fromArray(SHA256.sum224( Array.flatten(f)));

        let newBlock = (from, to, amount, time, hash);
        _blockchain.put(newBlockIndex, newBlock);

        return (newBlockIndex, newBlock)
    };
  
}