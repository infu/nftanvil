let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.6-20210809/package-set.dhall sha256:bd11878d8690bcdedc5a9d386a0ce77f8e9de69b65f6ecbed930cbd79bf43338
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions = [
 { name = "std"
  , repo = "https://github.com/infu/ext.std"
  , version = "v0.1.3"
  , dependencies = ["base", "principal"]
  },
  { name = "vvv"
  , repo = "https://github.com/vvv-interactive/vvv.mo"
  , version = "v0.1.0"
  , dependencies = ["base"]
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
  },
  { name = "json"
  , repo = "https://github.com/aviate-labs/json.mo"
  , version = "v0.1.0"
  , dependencies = [ "base" ],
  },
  { name = "parser-combinators"
  , repo = "https://github.com/aviate-labs/parser-combinators.mo"
  , version = "v0.1.0"
  , dependencies = ["base"]
  }
]

in  upstream # additions
