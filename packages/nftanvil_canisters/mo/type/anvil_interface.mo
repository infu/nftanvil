import Nft "./nft_interface";
import Result "mo:base/Result";

module {

    public type Interface = actor {

            // // mint function proxy which makes sure the nft author is the smart contract
            // register_token : shared (tid: Nft.TokenIdentifier) -> async RegisterResponse;

            // // balance - check the nft icp balance
            // balance : query (request: BalanceRequest) -> async BalanceResponse;

            // // withdraw - take rewards
            // withdraw : shared (request: WithdrawRequest) -> async WithdrawResponse;

            // // refresh_icp_balance - take balance from pwr ledger and also take _config
            // refresh : shared () -> async ();

    };

    public type RegisterResponse = Result.Result<(), Text>;

    public type TokenRecord = {
          var withdrawn : Nat64;
          
    };

    public type TokenRecordSerialized = {
          withdrawn : Nat64;
    };


    public func TokenRecordSerialize(x : TokenRecord) : TokenRecordSerialized {
          {
               withdrawn = x.withdrawn;
          }
    };

    public func TokenRecordUnserialize(x:TokenRecordSerialized) : TokenRecord {
          {
               var withdrawn = x.withdrawn;
          }
    };

    public func TokenRecordBlank() : TokenRecord {
          {
               var withdrawn = 0;
          }
    };

    public type WithdrawRequest = {
         aid : Nft.AccountIdentifier; // redundancy
         subaccount : ?Nft.SubAccount;
         tx : Nft.TransactionId;
    };

    public type WithdrawResponse = Result.Result<
    {
        transactionId: Nft.TransactionId;
        amount: Nft.Balance
    },Text>;

    public type BalanceRequest =  Nft.TokenIdentifier;
  

    public type BalanceResponse = Result.Result<Nft.Balance, ()>;
}