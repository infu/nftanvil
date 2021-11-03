import Blob_  "mo:vvv/Blob";
import Debug  "mo:base/Debug";

let txt_start = "something 😇 special";
// Debug.print("START: " # txt_start);

let blo : Blob = Blob_.textToBlob(txt_start);

// Debug.print(debug_show(blo));

let txt :Text = Blob_.blobToText(blo);

assert(txt_start == txt); //
 

 


