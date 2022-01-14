import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Nft  "../mo/type/nft_interface";
import Account "../mo/account";

import Array_ "../mo/lib/Array"


let meta: Nft.MetadataInput = {
            domain = ?"";
            name = ?"Some";
            lore = ?"Other";
            quality= 1;
            transfer= #unrestricted;
            ttl= null; // time to live
            content= null;// ?#internal({contentType="image/jpeg"; size=703123;idx = null});
            thumb= #internal({contentType="image/jpeg"; size=123123;idx = null}); 
            attributes=[];
            secret=false;
            custom=null;
            tags=[];
            authorShare=0;
            price={amount=0;marketplace=null;affiliate=null};
            };

let price = Nft.MetadataInput.price(meta);         

Debug.print(debug_show(price));