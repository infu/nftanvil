import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

import Router "./router_interface";
import Collection "./collection_interface";
import Nft "./nft_interface";
import Pwr "./pwr_interface";
import Treasury "./treasury_interface";
import History "./history_interface";
import Anv "./anv_interface";
import Account "./account_interface";
import Ledger "./ledger_interface";
import Float "mo:base/Float";
import Int64 "mo:base/Int64";

module {
    public type Config = {
        router:Principal;
        nft: [Principal];
        nft_avail: [Principal];
        account:[Principal];
        pwr: Principal;
        anv: Principal;
        // collection: Principal;
        treasury:Principal;
        history:Principal;
        slot:Nat;
    };

    public module Config = {
        public func default() : Config {
            {
                router= Principal.fromText("aaaaa-aa");
                nft= [];
                nft_avail= [];
                account= [];
                pwr= Principal.fromText("aaaaa-aa");
                anv= Principal.fromText("aaaaa-aa");
                collection= Principal.fromText("aaaaa-aa");
                treasury= Principal.fromText("aaaaa-aa");
                history= Principal.fromText("aaaaa-aa");
                slot=0;
            };
        };
    };
    
    public type Oracle = {
        cycle_to_pwr : Float
    };

    public module Oracle = {
        public func default() : Oracle {
            { 
                cycle_to_pwr = 0.123
            }
        };
        public func cycle_to_pwr(oracle:Oracle, cycles:Nat64) : Nat64 {
            Int64.toNat64(Float.toInt64(Float.fromInt64(Int64.fromNat64(cycles)) * oracle.cycle_to_pwr))
        };
        
    };

    public func router(conf : Config) : Router.Interface {
        actor(Principal.toText(conf.router)) : Router.Interface;
    };
   
    // public func collection(conf : Config) : Collection.Interface {
    //     actor(Principal.toText(conf.collection)) : Collection.Interface;
    // };
   
    public func treasury(conf : Config) : Treasury.Interface {
        actor(Principal.toText(conf.treasury)) : Treasury.Interface;
    };

    public func treasury_address(conf : Config) : Nft.AccountIdentifier {
        Nft.AccountIdentifier.fromPrincipal(conf.treasury, null);
    };

    public func nft_address(conf : Config, slot:Nat) : Nft.AccountIdentifier {
        Nft.AccountIdentifier.fromPrincipal(conf.nft[slot], null);
    };

    public func anv(conf : Config) : Anv.Interface {
        actor(Principal.toText(conf.anv)) : Anv.Interface;
    };
   
    public func pwr(conf : Config) : Pwr.Interface {
        actor(Principal.toText(conf.pwr)) : Pwr.Interface;
    };

    public func history(conf : Config) : History.Interface {
        actor(Principal.toText(conf.history)) : History.Interface;
    };

    public func nft(conf : Config, slot:Nat) : Nft.Interface {
        actor(Principal.toText(conf.nft[slot])) : Nft.Interface;
    };

    public func account(conf : Config, slot:Nat) : Account.Interface {
        actor(Principal.toText(conf.account[slot])) : Account.Interface;
    };

    public func accountFromAid(conf : Config, aid:Nft.AccountIdentifier) : Account.Interface {
        let max = Iter.size(Iter.fromArray(conf.account));
        actor(Principal.toText(conf.account[Nft.AccountIdentifier.slot(aid, max)])) : Account.Interface;
    };

    public func ledger(conf: Config): Ledger.Interface {
        actor("ryjl3-tyaaa-aaaaa-aaaba-cai") : Ledger.Interface;
    };
      

}