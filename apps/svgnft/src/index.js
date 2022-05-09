import { JSDOM } from "jsdom";
import fs from "fs";
import pseudoRandom from "pseudo-random";

const getSource = () => {
  let variable = {};
  let permanent = {};

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
    const gid = (group.id || gidx).toString();
    gidx++;
    countGroups++;
    let features = group.children;
    let fidx = 0;

    for (let z of features) {
      let fid = (z.id || fidx).toString();

      let match = /_(\d+)_+(.*)/gm.exec(fid);
      let regularity = 100;
      z.regularity = regularity;
      if (match !== null) {
        fid = match[2];
        regularity = parseInt(match[1], 10);
      }

      fidx++;
      countFeatures++;

      if (gid.indexOf("_") === 0) {
        if (!permanent[gid]) permanent[gid] = {};
        permanent[gid][fid] = z;
      } else {
        if (!variable[gid]) variable[gid] = {};
        variable[gid][fid] = z;
      }
    }

    groupOrder[gid] = order;

    countCombinations *= fidx + 1;
    order++;
  }

  return {
    variable,
    permanent,
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

console.log(
  "Groups",
  source.stats.groups,
  "Features",
  source.stats.features,
  "Combinations",
  source.stats.combinations
);

const opt = (defs, cnt) => {
  let own = defs.innerHTML;
  let res = "";

  for (let x of defs.children) {
    if (cnt.indexOf("#" + x.id) !== -1 || own.indexOf("#" + x.id) !== -1) {
      res += x.outerHTML;
    }
  }
  return res;
};

const tpl = (x) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${
      x.viewBox
    }">
    <defs>${opt(x.defs, x.content)}</defs>
    ${x.content}
    </svg>
    `;
};

const generate = (source, seed = 12333334, quality = 1) => {
  const pr = pseudoRandom(seed); // set seed
  let rez = {
    defs: source.defs,
    content: "",
    viewBox: source.viewBox,
  };

  let contentUnordered = [];
  const MAX_ELEMENTS = Object.keys(source.variable).length;
  const MIN_ELEMENTS = Math.floor(Object.keys(source.variable).length / 3);

  // Variables
  let numGroups =
    MIN_ELEMENTS + Math.floor(pr.random() * (MAX_ELEMENTS - MIN_ELEMENTS));

  //   numGroups += Math.floor(pr.random() * quality);
  //   if (numGroups > MAX_ELEMENTS) numGroups = MAX_ELEMENTS;

  const availGroups = Object.keys(source.variable);
  const selectedGroups = shuffle(
    Array(availGroups.length)
      .fill(0)
      .map((x, idx) => idx),
    pr
  ).slice(0, numGroups);

  //   console.log(selectedGroups);

  const tags = [];
  for (let x of selectedGroups) {
    let group = source.variable[availGroups[x]];
    let groupKeys = [].concat(
      ...Object.keys(group).map((x) => {
        let reg = group[x].regularity;
        if (reg == 100) reg = Math.floor(reg / (quality + 1));

        return Array(reg)
          .fill(0)
          .map((_) => x);
      })
    );

    let rndEl = group[groupKeys[Math.floor(pr.random() * groupKeys.length)]];
    tags.push(rndEl.id);
    contentUnordered.push({
      order: source.groupOrder[availGroups[x]],
      content: rndEl.outerHTML,
    });
  }

  //   console.log(rez.variable);

  // Permanent
  for (let p in source.permanent) {
    let group = source.permanent[p];

    let groupKeys = [].concat(
      ...Object.keys(group).map((x) => {
        let reg = group[x].regularity;
        if (reg == 100) reg = Math.floor(reg / (quality + 1));
        return Array(reg)
          .fill(0)
          .map((_) => x);
      })
    );

    let rndEl = group[groupKeys[Math.floor(pr.random() * groupKeys.length)]];

    tags.push(rndEl.id);
    contentUnordered.push({
      order: source.groupOrder[p],
      content: rndEl.outerHTML,
    });
  }

  contentUnordered.sort((a, b) => {
    return a.order - b.order;
  });

  rez.content = contentUnordered.map((x) => x.content).join("");

  return rez;
};

for (let i = 0; i < 100; i++) {
  let dna = Math.floor(Math.random() * 100000000000000);
  let quality = Math.floor(Math.random() * 7);
  //  if (quality === 7) process.exit();
  fs.writeFileSync(
    `./build/tmp_${quality}_${i}.svg`,
    tpl(generate(source, dna, quality))
  );
}

function shuffle(array, pr) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(pr.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
