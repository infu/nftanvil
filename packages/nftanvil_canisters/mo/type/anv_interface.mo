import Array "mo:base/Array";
import Array_ "mo:array/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import CRC32 "mo:hash/CRC32";
import SHA256 "mo:sha/SHA256";
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
        balance          : query BalanceRequest        -> async BalanceResponse;

        // (ANV)
        transfer         : shared TransferRequest       -> async TransferResponse;
    };

    public type AccountIdentifier = Nft.AccountIdentifier;
    public type Balance = Nft.Balance;
    public type User = Nft.User;
    public type SubAccount = Nft.SubAccount;
    public type Memo = Nft.Memo;

    public type BalanceRequest = {
        user: Nft.User;
    };

    public type BalanceResponse = Balance;

    public type TransferRequest = {
        from       : User;
        to         : User;
        amount     : Balance;
        memo       : Memo;
        subaccount : ?SubAccount;
    };

    public type TransferResponse = Result.Result<Balance, {
        #Unauthorized : AccountIdentifier;
        #InsufficientBalance;
        #Rejected;
        #Other        : Text;
    }>;

}