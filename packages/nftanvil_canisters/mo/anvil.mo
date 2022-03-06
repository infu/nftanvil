// Anvil NFT collection
import Anvil "./type/anvil_interface";
import Nft "./type/nft_interface";
import Cluster  "./type/Cluster";
import Pwr "./type/pwr_interface";
import Array "mo:base/Array";
import TrieRecord "./lib/TrieRecord";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";


shared({caller = _installer}) actor class Class() : async Anvil.Interface = this {

  type TokenIdentifier = Nft.TokenIdentifier;

  private stable var _conf : Cluster.Config = Cluster.Config.default();
  private stable var _oracle : Cluster.Oracle = Cluster.Oracle.default();

  private stable var _tmpToken: [(TokenIdentifier, Anvil.TokenRecordSerialized)] = [];
  private var _token : TrieRecord.TrieRecord<TokenIdentifier, Anvil.TokenRecord, Anvil.TokenRecordSerialized> = TrieRecord.TrieRecord<TokenIdentifier, Anvil.TokenRecord, Anvil.TokenRecordSerialized>( _tmpToken.vals(),  Nft.TokenIdentifier.equal, Nft.TokenIdentifier.hash, Anvil.TokenRecordSerialize, Anvil.TokenRecordUnserialize);

  private stable var _registeredTokens : Nat = 0;
  private stable var _current_balance : Nft.Balance = 0;
  private stable var _total_withdrawn : Nft.Balance = 0;
  private stable var _total_earned : Nft.Balance = 0;


  system func preupgrade() {
      _tmpToken := Iter.toArray(_token.serialize());
  };

  system func postupgrade() {
      _tmpToken := [];
  };



  public shared({caller}) func register_token(tid: TokenIdentifier) : async Anvil.RegisterResponse {

    _registeredTokens += 1;
    
    if (_registeredTokens >= 10000) return #err("Limit reached");

    _token.put(tid, Anvil.TokenRecordBlank());

    #ok();
       
  };



  public query func all_tokens() : async [(TokenIdentifier, Anvil.TokenRecordSerialized)] {
      Iter.toArray(_token.serialize());
  };

  public shared({caller}) func withdraw(request: Anvil.WithdrawRequest) : async Anvil.WithdrawResponse {

      let caller_aid:Nft.AccountIdentifier = Nft.AccountIdentifier.fromPrincipal(caller, request.subaccount);
      if (request.aid != caller_aid) return #err("Request aid and calculated subaccount aid are different");

      // 1. decode tx
      let {history_slot; idx} = Nft.TransactionId.decode(request.tx);

      // 2. check if history canister is from cluster
      if (Nft.APrincipal.isLegitimateSlot(_conf.space, history_slot) == false) return #err("Invalid TX");

      // 3. query tx details
      let tx = switch(await Cluster.history(_conf).get(idx)) {
          case (?tx) tx;
          case (null) return #err("Can't get TX info");
      };

      // 4. take account_id from tx memo
      let (bearer, token) = switch(tx.info) {
          case (#nft(#use({memo; user; created; token}))) {

              // Check if transaction is from the last 60 min
            //   Debug.print("created" # debug_show(created));
            //   Debug.print("now" # debug_show(Time.now() - 60*60*1000000000));
              if (created < Time.now() - 60*60*1000000000) return #err("Transaction is too old (>1h)");

              // 5. take nft_id from tx and check if its anvil nft against saved ids
              switch(_token.get(token)) {
                  case (?x) ();
                  case (_) return #err("Token is not original Anvil token");
              };

              // 5.1 check if tx user = caller aid
              if (user != caller_aid) return #err("Caller aid not the same as tx user aid");

              let (nftslot, nftidx) = Nft.TokenIdentifier.decode(token);

               // 6. query nft bearer
              let bearer = switch(await Cluster.nft(_conf, nftslot).bearer(token)) {
                  case (#ok(aid)) aid;
                  case (#err(e)) return #err("Retrieving token bearer error");
              };

              // 7. check if (owner aid = tx aid)
              if (bearer != user) return #err("Tx user and token bearer are not the same");

              (bearer, token)
          };
          case (_) return #err("Bad TX type");
      };
    

      // 8. calculate balance

      let total = getTotalShare();

      let balance = switch(getBalance(token)) {
          case (#ok(bal)) bal;
          case (#err(e)) return #err("Error getting token balance");
      };

      // 9. take balance out and save new 0 balance in memory
      switch(_token.get(token)) {
          case (?tr) {

              if (total - tr.withdrawn < _oracle.pwrFee) return #err("Payout lower than transfer fee");

              let payout = total - tr.withdrawn - _oracle.pwrFee;

              Debug.print("DBGPamount " # debug_show(payout));

              let prev_amount = tr.withdrawn;

              tr.withdrawn := total;

              // 10. send balance from contract account to user account - with wrapped icp(pwr) transfer
              try {
                switch(await Cluster.pwr(_conf).pwr_transfer({
                    from = #address(Cluster.treasury_address(_conf));
                    to = #address(bearer);
                    amount = payout;
                    memo = Blob.fromArray([]);
                    subaccount = null;
                })) {
                    case (#ok({transactionId})) {
                        _total_withdrawn += payout + _oracle.pwrFee;
                        _current_balance -= payout + _oracle.pwrFee;
                        return #ok({transactionId; amount = payout});
                    };
                    case (#err(e)) {
                        if (prev_amount < _oracle.pwrFee) { tr.withdrawn := 0; } // Contract may get charged a fee even if things fail
                        else { tr.withdrawn := prev_amount - _oracle.pwrFee; };

                        return #err("Transfer error. Try again...");
                    };
                };
              } catch (e) {
                    if (prev_amount < _oracle.pwrFee) { tr.withdrawn := 0; }
                    else { tr.withdrawn := prev_amount - _oracle.pwrFee; };
                        
                   return #err("Network error. Try again...");
              };
              
          };
          case (null) return #err("System error");
      };

  };

  private func getTotalShare() : Nft.Balance {
      _total_earned / 10000;
  };

  private func getBalance(token : Anvil.BalanceRequest) : Anvil.BalanceResponse {
     let shareTotal = getTotalShare();
     let withdrawn = switch(_token.get(token)) { 
         case (?tr) {
             tr.withdrawn;
         };
         case (_) return #err();
     };
     let shareLeft = shareTotal - withdrawn;

     return #ok(shareLeft);
  };

  public query func balance(token : Anvil.BalanceRequest) : async Anvil.BalanceResponse {
     getBalance(token);
  };

   public shared({caller}) func config_set(conf : Cluster.Config) : async () {
        assert(caller == _installer);
        _conf := conf
        
    };

   public shared({caller}) func oracle_set(oracle : Cluster.Oracle) : async () {
        assert(caller == _installer);
        _oracle := oracle
    };


  public shared({caller}) func refresh() : async () {
      //TODO: this func can be called by anyone, but only once a day

      let {pwr} = await Cluster.pwr(_conf).balance({user=#address(Cluster.treasury_address(_conf))} );

      let diff = pwr - _current_balance;
      
      _total_earned += diff;
      
      _current_balance := pwr;

  };

  

}








//   public shared({caller}) func nft_mint(slot: Nft.CanisterSlot, request: Nft.MintRequest) : async Nft.MintResponse {

//       // redirect mint request
//       if (_registeredTokens >= 10000) return #err(#Rejected);

//       let pwr = Cluster.pwr(_conf);

//       switch(await pwr.nft_mint(slot, request)) {
//           case (#ok(resp)) {
//                 let {tokenIndex} = resp;
//                 let tokenId = Nft.TokenIdentifier.encode(slot, tokenIndex);
//                 _registeredTokens += 1;

//                 if (_registeredTokens >= 10000) return #err(#Rejected);

//                 _token.put(tokenId, Anvil.TokenRecordBlank());

//                 #ok(resp);
//           };

//           case (#err(e)) return #err(e);
//       };

//   };
