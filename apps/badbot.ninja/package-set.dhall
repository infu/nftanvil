let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.20-20220131/package-set.dhall
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions = [
  { name = "anvil"
  , repo = "https://github.com/infu/anvil.mo"
  , version = "v0.1.7"
  , dependencies = ["array", "base", "hash", "encoding", "sha"]
  },
  { name = "sha"
   , repo = "https://github.com/aviate-labs/sha.mo"
   , version = "v0.1.1"
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
