import Router "../mo/router";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Ext "../mo/type/nft_interface";

import Treasury "../mo/treasury";


//let router = await Router.Router();
let user_john_principal = Principal.fromText("ks5fw-csuji-57tsx-mqld6-bjip7-anp4q-pecol-5k6vo-vzcmw-3wuo2-qqe");

let x = Ext.AccountIdentifier.fromPrincipal(user_john_principal, null);

Debug.print(debug_show( x ));