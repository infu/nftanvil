import Array "mo:base/Array";
import Array_ "mo:array/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import Blob_ "../lib/Blob";
import CRC32 "mo:hash/CRC32";
import Hash "mo:base/Hash";
import Hex "mo:encoding/Hex";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Principal "mo:principal/Principal";
import RawAccountId "mo:principal/AccountIdentifier";
import Text "mo:base/Text";
import Nft "./nft_interface";
import Ledger "./ledger_interface"

module {
    public type Interface = actor {
        // Take all ICP you are owed
        withdraw        : shared WithdrawRequest       -> async WithdrawResponse;
        
        // (internal) On sale, notify treasury so it can split incoming amount
        notify_NFTPurchase  : shared NFTPurchase -> async NFTPurchaseResponse;

        // Check your balance
        balance         : BalanceRequest        -> async BalanceResponse;
    };

    public type AccountIdentifier = Nft.AccountIdentifier;
    public type TokenIdentifierBlob = Nft.TokenIdentifierBlob;

    public type Share = Nft.Share;
    public type Balance = Nft.Balance;
    public type TokenIdentifier = Nft.TokenIdentifier;

    public type BalanceRequest = {
        user: Nft.User;
        subaccount : ?Nft.SubAccount
    };

    public type BalanceResponse = Balance;

    public type WithdrawRequest = {
        user: Nft.User;
        subaccount : ?Nft.SubAccount
    };

    public type WithdrawResponse = Result.Result<Balance,{
        #TransferFailed;
        #NotEnoughForTransfer;
    }>;

    public type NFTPurchase = {
            created : Time.Time;
            ledgerBlock : Ledger.BlockIndex;
            amount : Ledger.ICP;

            token: TokenIdentifierBlob;
            
            buyer : AccountIdentifier;
            seller : AccountIdentifier;

            author : {
                address : AccountIdentifier;
                share : Share
                };

            marketplace : ?{
                address : AccountIdentifier;
                share : Share
                };

            affiliate : ?{
                address : AccountIdentifier;
                share : Share
                };

            purchaseAccount : AccountIdentifier; 
    };

    public module NFTPurchase {
        public func hash (e : NFTPurchase) : [Nat8] {
            Array.flatten<Nat8>([
                        [9:Nat8],
                        Blob_.intToBytes(e.created),
                        Blob_.nat64ToBytes(e.ledgerBlock),
                        Blob_.nat64ToBytes(e.amount.e8s),
                        Blob.toArray(e.token),
                        Blob.toArray(e.buyer),
                        Blob.toArray(e.seller),
                        Blob.toArray(e.author.address),
                        Blob_.nat16ToBytes(e.author.share),
                        switch(e.marketplace) { 
                            case (?a) Array.flatten<Nat8>([ 
                                  Blob.toArray(a.address),
                                  Blob_.nat16ToBytes(a.share)
                            ]);
                            case (null) []
                        },
                        switch(e.affiliate) { 
                            case (?a) Array.flatten<Nat8>([ 
                                  Blob.toArray(a.address),
                                  Blob_.nat16ToBytes(a.share)
                            ]);
                            case (null) []
                        },
                        Blob.toArray(e.purchaseAccount)
                    ])
        };
    };

    public type NFTPurchaseResponse = Result.Result<(), Text>;
}   