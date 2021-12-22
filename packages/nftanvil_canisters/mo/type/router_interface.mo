
module {
        public type Interface = actor {
                reportOutOfMemory : shared () -> async ();
                isLegitimate : query (p:Principal) -> async Bool;
        }
}
