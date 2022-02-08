import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

import Router "./router_interface";
import Nft "./nft_interface";
import Pwr "./pwr_interface";
import Treasury "./treasury_interface";
import History "./history_interface";
import Anv "./anv_interface";
import Account "./account_interface";
import Ledger "./ledger_interface";
import Float "mo:base/Float";
import Int64 "mo:base/Int64";
import Nat16 "mo:base/Nat16";

module {
    public type CanisterSlot = Nft.CanisterSlot;
    public type CanisterRange = Nft.CanisterRange;
    public type Oracle = Nft.Oracle;
    
    public type Config = {
        router: CanisterSlot;
        nft: CanisterRange;
        nft_avail: [CanisterSlot];
        account: CanisterRange;
        pwr: CanisterSlot;
        anv: CanisterSlot;
        treasury: CanisterSlot;
        history: CanisterSlot;
        space:[[Nat64]];
    };

    public module Config = {
        public func default() : Config {
            {
                nft = (0,5000);
                nft_avail = [];
                account = (5010,5013);
                router = 5001;
                pwr = 5002;
                anv = 5003;
                treasury = 5004;
                history = 5100;
                space = [[17830671, 17836454]]
            };
        };
    };
    
    public type CommonActor =  actor {
            config_set   : shared (conf : Config) -> async ();
            oracle_set   : shared (oracle : Oracle) -> async ();
        };

    public module Oracle = {
        public func default() : Oracle {
            {        
                icpCycles = 160000; // e8s to cycles
                icpFee = 10000; 
                pwrFee = 10000;
                anvFee = 10000;
            }
        };
        public func cycle_to_pwr(oracle:Oracle, cycles:Nat64) : Nat64 {
             cycles / oracle.icpCycles
        };
    };

    public func router(conf : Config) : Router.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, conf.router))) : Router.Interface;
    };

    // public func collection(conf : Config) : Collection.Interface {
    //     actor(Principal.toText(conf.collection)) : Collection.Interface;
    // };
   
    public func treasury(conf : Config) : Treasury.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, conf.treasury))) : Treasury.Interface;
    };

    public func treasury_address(conf : Config) : Nft.AccountIdentifier {
        Nft.AccountIdentifier.fromPrincipal(Nft.APrincipal.fromSlot(conf.space, conf.treasury), null);
    };

    public func nft_address(conf : Config, slot : CanisterSlot) : Nft.AccountIdentifier {
        Nft.AccountIdentifier.fromPrincipal(Nft.APrincipal.fromSlot(conf.space, slot), null);
    };

    public func anv(conf : Config) : Anv.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, conf.anv))) : Anv.Interface;
    };
   
    public func pwr(conf : Config) : Pwr.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, conf.pwr))) : Pwr.Interface;
    };

    public func history(conf : Config) : History.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, conf.history))) : History.Interface;
    };

    public func nft(conf : Config, slot : CanisterSlot) : Nft.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, slot))) : Nft.Interface;
    };

    public func account(conf : Config, slot : CanisterSlot) : Account.Interface {
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, slot))) : Account.Interface;
    };

    public func accountFromAid(conf : Config, aid : Nft.AccountIdentifier) : Account.Interface {
        let (start, end) = conf.account;
        let max = end - start;
        actor(Principal.toText(Nft.APrincipal.fromSlot(conf.space, start + Nft.AccountIdentifier.slot(aid, max)))) : Account.Interface;
    };

    public func ledger(conf: Config): Ledger.Interface {
        actor("ryjl3-tyaaa-aaaaa-aaaba-cai") : Ledger.Interface;
    };
      

}