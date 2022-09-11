let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.21-20220215/package-set.dhall
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions = [
  { dependencies = [] : List Text
  , name = "base"
  , repo = "https://github.com/dfinity/motoko-base.git"
  , version = "494824a2787aee24ab4a5888aa519deb05ecfd60"
  },
   { name = "sha"
   , repo = "https://github.com/aviate-labs/sha.mo"
   , version = "v0.1.1"
   , dependencies = [ "base" ]
   },
  { name = "asset-storage"
   , repo = "https://github.com/aviate-labs/asset-storage.mo"
   , version = "asset-storage-0.7.0"
   , dependencies = [ "base" ]
   },
  { name = "array"
  , repo = "https://github.com/aviate-labs/array.mo"
  , version = "v0.1.1"
  , dependencies = [ "base" ]
  },
  { name = "hash"
  , repo = "https://github.com/aviate-labs/hash.mo"
  , version = "v0.1.0"
  , dependencies = [ "base" ]
  },
  { name = "encoding"
  , repo = "https://github.com/aviate-labs/encoding.mo"
  , version = "v0.3.0"
  , dependencies = [ "base", "array" ]
  },
  { name = "principal"
  , repo = "https://github.com/aviate-labs/principal.mo"
  , version = "v0.2.3"
  , dependencies = [ "array", "base", "hash", "encoding", "sha" ],
  }
]

in  upstream # additions
