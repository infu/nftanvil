import Array "mo:base/Array";
import Array_ "mo:array/Array";
import Base32 "mo:encoding/Base32";
import Binary "mo:encoding/Binary";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
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
          pwr_withdraw         : shared WithdrawRequest       -> async WithdrawIntermediateResponse;
    };

    public type AccountIdentifier = Nft.AccountIdentifier;
    public type Balance = Nft.Balance;
    public type User = Nft.User;
    public type SubAccount = Nft.SubAccount;
    public type Memo = Nft.Memo;
    
    public type WithdrawRequest = {
        from       : User;
        to         : User;
        amount     : Balance;
        subaccount : ?SubAccount;
    };

    public type WithdrawIntermediateResponse = Ledger.TransferResult;
    public type WithdrawResponse = Result.Result<{transactionId: Blob}, Nft.TransferResponseError>;


}   