import Time "mo:base/Time";
import Cluster  "../type/Cluster";
import Nft "../type/nft_interface";
import History "../type/history_interface";

module {

    public class Anvil()
    {
        let TIME_BETWEEN_UPDATES = 3600000000000; // 1 hour

        public var conf : Cluster.Config = Cluster.Config.default();
        public var oracle : Cluster.Oracle = Cluster.Oracle.default();
        
        var lastUpdate : Time.Time = 0; 

        public func needsUpdate() : Bool {
            Time.now() > (lastUpdate + TIME_BETWEEN_UPDATES);
        };

        public func update() : async () {
            let (a, b) = await Cluster.router(conf).settings_get();
            conf := a;
            oracle := b;
            lastUpdate := Time.now() + TIME_BETWEEN_UPDATES;
        };

        public func getTransaction (tx: Nft.TransactionId) : async ?Nft.Transaction {
            if (needsUpdate()) await update();

            // 1. decode tx
            let {history_slot; idx} = Nft.TransactionId.decode(tx);

            // 2. check if history canister is from cluster
            assert(Nft.APrincipal.isLegitimateSlot(conf.space, history_slot));

            // 3. query tx details
            await Cluster.history(conf).get(idx);
        }

    }

}
