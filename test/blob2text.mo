import Transform "../lib/transform/Transform"

let txt_start = "something 😇 special";
// Debug.print("START: " # txt_start);

let blo : Blob = Transform.TextToBlob(txt_start);

// Debug.print(debug_show(blo));

let txt :Text = Transform.blobToText(blo);

assert(txt_start == txt); //
 

 


