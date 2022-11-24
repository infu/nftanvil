import Nft "./nft_interface";
import Result "mo:base/Result";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Int64 "mo:base/Int64";
import Float "mo:base/Float";

module {

    public type Interface = actor {

            create_pool : shared (CreatePoolRequest) -> async CreatePoolResponse;
            add_liquidity : shared (AddLiquidityRequest) -> async AddLiquidityResponse;
            rem_liquidity : shared (RemLiquidityRequest) -> async RemLiquidityResponse;
            swap : shared (SwapRequest) -> async SwapResponse;
            balance_liquidity : query (BalanceLiquidityRequest) -> async BalanceLiquidityResponse;
            get_pools : query (PoolsRequest) -> async PoolsResponse;

    };

    
    public type FTokenId = Nft.FTokenId;
    public type Balance = Nat64;

    public func Nat64ToFloat (x : Nat64) : Float {
      Float.fromInt64( Int64.fromNat64( x ));
    };

    public func FloatToNat64 (x : Float) : Nat64 {
       Int64.toNat64( Float.toInt64( x ) );
    };

    public func Nat64ToFloatDecimals (x : Balance, decimals : Nat) : Float {
          Float.fromInt64( Int64.fromNat64( x )) /
          Float.fromInt64( Int64.fromNat64(  Nat64.fromNat( 10 ** decimals )));
    };

    public func FloatToNat64Decimals (x : Float, decimals : Nat) : Balance {
          Int64.toNat64( Float.toInt64( x * Float.fromInt64( Int64.fromNat64(  Nat64.fromNat( 10 ** decimals ))) ) );
    };

    //
    public type CreatePoolRequest = {
      token_one : FTokenId;
      token_two : FTokenId;
      token_one_decimals: Nat8;
      token_two_decimals: Nat8;
    };
    public type CreatePoolResponse = Result.Result<(), Text>;

    //
    public type AddLiquidityRequest = {
      token_one : FTokenId;
      token_two : FTokenId;
      aid: Nft.AccountIdentifier;
      token_one_amount : Balance;
      token_two_amount : Balance;
    };
    public type AddLiquidityResponse = Result.Result<Float, Text>;

    //
    public type RemLiquidityRequest = {
       token_one : FTokenId;
       token_two : FTokenId;
       aid: Nft.AccountIdentifier;
    };

    public type RemLiquidityResponse = Result.Result<{
      one : Balance;
      two : Balance;
    }, Text>;

    //
    public type SwapRequest = {
       token_one : FTokenId;
       token_two : FTokenId;
       amount : Balance;
       amount_required : Balance;
       reverse: Bool;
    };

    public type SwapResponse = Result.Result<{
      recieve : Nat64;
      refund : Nat64;
    }, Text>;
    //
    public type BalanceLiquidityRequest = {
       token_one : FTokenId;
       token_two : FTokenId;
       aid: Nft.AccountIdentifier;
    };

    public type BalanceLiquidityResponse = Result.Result<Float, Text>;
    //
    public type PoolPublic = {
      balance: Float;
      id : LPKey;
      reserve_one : Nat64;
      token_one_decimals : Nat8;
      reserve_two : Nat64;
      token_two_decimals : Nat8;
      total : Float;
    };

    public type PoolsRequest = {
      aid: Nft.AccountIdentifier;
    };
    public type PoolsResponse = [PoolPublic];
    
    //

    public type LPKey = (Nat64, Nat64);
    public module LPKey = {
            public func hash(x : LPKey) : Nat {
                Nat32.toNat( Nat32.fromNat( Nat64.toNat(Nat64.bitxor(x.0, Nat64.bitrotLeft(x.1, 3)))) & 0x3fffffff );
            };
            public func equal(a : LPKey, b : LPKey) : Bool {
                  a.0 == b.0 and a.1 == b.1
            }
    };
    public let lphash = (LPKey.hash, LPKey.equal);

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