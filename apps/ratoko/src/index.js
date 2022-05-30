import { JSDOM } from "jsdom";
import fs from "fs";

let canisters = JSON.parse(fs.readFileSync("./canister_ids.json"));

const getSource = () => {
  let variable = {};

  const filedata = fs.readFileSync("source.svg");
  const dom = new JSDOM(filedata);
  let groupOrder = {};
  let countGroups = 0;
  let countFeatures = 0;
  let groups = dom.window.document.querySelectorAll("svg > g");
  let defs = dom.window.document.querySelector("defs");
  let viewBox = dom.window.document
    .querySelector("svg")
    .getAttribute("viewBox");

  let countCombinations = 1;
  let gidx = 0;

  let order = 0;
  for (let group of groups) {
    const gid = parseInt((group.dataset.name || group.id).split(" ")[0], 10);

    if (!gid) throw new Error("Missing group layer name " + group.id);
    gidx++;
    countGroups++;
    let features = group.children;
    let fidx = 0;

    for (let z of features) {
      let fid = parseInt(z.dataset.name.split(" ")[0], 10);
      if (!fid) throw new Error("Missing feature layer name"); //(z.id || fidx).toString();

      fidx++;
      countFeatures++;

      if (!variable[gid]) variable[gid] = {};
      variable[gid][fid] = z;
    }

    groupOrder[gid] = order;

    countCombinations *= fidx + 1;
    order++;
  }

  return {
    variable,
    viewBox,
    defs,
    groupOrder,
    stats: {
      groups: countGroups,
      features: countFeatures,
      combinations: countCombinations,
    },
  };
};

let source = getSource();
let [startx, starty, width, height] = source.viewBox.split(" ");

const writeMetaFile = () => {
  let r = {};
  for (let group in source.variable) {
    r[group] = Object.keys(source.variable[group]).length;
  }

  fs.writeFileSync("meta.json", JSON.stringify({ groups: r, width, height }));
};

writeMetaFile();

const head = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='${source.viewBox}'>`;
const tail = "</svg>";

console.log(
  "Groups",
  source.stats.groups,
  "Features",
  source.stats.features,
  "Combinations",
  source.stats.combinations
);

const opt = (defs, cnt) => {
  //let own = defs.innerHTML;
  let res = "";

  for (let x of defs.children) {
    if (cnt.indexOf("#" + x.id + ")") !== -1) {
      res += x.outerHTML;
    }
  }
  // second pass for references
  for (let x of defs.children) {
    if (res.indexOf("#" + x.id + '"') !== -1) {
      res += x.outerHTML;
    }
  }

  return res;
};

let out = [];

for (let group in source.variable) {
  for (let feature in source.variable[group]) {
    let content = source.variable[group][feature].outerHTML.replace(/"/gs, "'");
    let extra = opt(
      source.defs,
      source.variable[group][feature].outerHTML
    ).replace(/"/gs, "'");

    let cnt = `
    ${extra.replace(/[\r\n]/gs, "").replace(/\s+/gs, " ")}
    ${content.replace(/[\r\n]/gs, "").replace(/\s+/gs, " ")}";    
    `;
    let fn = "f" + group + "_" + feature + ".svg";

    fs.writeFileSync("./build/svg/" + fn, cnt);

    // console.log({ group, feature, content });
  }
}
