var c = require("child_process");
var process = require("process");

let icpusdt_t = JSON.parse(
  c
    .execSync("curl -s https://api.binance.com/api/v3/avgPrice?symbol=ICPUSDT")
    .toString()
); //returns stdout

let usdxdr_t = JSON.parse(
  c
    .execSync("curl -s https://www.freeforexapi.com/api/live?pairs=USDXDR")
    .toString()
); //returns stdout

let icpusdt = parseFloat(icpusdt_t.price);
let usdxdr = usdxdr_t.rates.USDXDR.rate;
let icpxdr = icpusdt * usdxdr;
let e8scycles = Math.round(icpxdr * 10000);

// console.log("icpusdt", icpusdt);
// console.log("usdxdr", usdxdr);
// console.log("icpxdr", icpxdr);
process.stdout.write(e8scycles + "");
// process.stdout.write(e8scycles);
