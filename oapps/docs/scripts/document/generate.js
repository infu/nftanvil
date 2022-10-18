const fs = require("fs");
const path = require("path");

const dir_mo_type = "../../packages/nftanvil_canisters/mo/type";
const dir_output = "./docs/motoko";
fs.rmSync(dir_output, { recursive: true, force: true });

const template = ({ title, md, position }) => {
  return `---
title: ${title}
${position ? "sidebar_position: " + position : ""}
---

# ${title}

${md}
`;
};

const categoryFile = (dir, name, position = 0) => {
  fs.writeFileSync(
    dir + "/_category_.json",
    JSON.stringify({
      label: name,
      position: position,
    })
  );
};

const match = (str) => {
  const regex = /\/\/\((\d*)([^\n+]*)(.*?)\/\/\)/gs;
  let m;
  let rez = [];
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    let [_, position, name, code] = m;
    let id = name
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/\-+/, "-")
      .replace(/^\-/, "")
      .trim("-")
      .toLowerCase();

    rez.push({ name, code, id, position });
  }

  return rez;
};

const matchName = (str) => {
  const regex = /\s*\/\/@name\=\s*([^\s]+)/g;

  m = regex.exec(str);
  if (!m) return false;
  return m[1];
};

let files = fs.readdirSync(dir_mo_type).map((fn) => {
  let str = fs.readFileSync(dir_mo_type + "/" + fn);
  console.log(fn, str.length);
  let rez = match(str);
  let module_id = matchName(str);
  if (!module_id) {
    console.log("Skipping ", fn, "has no @name parameter");
    return;
  }

  for (let { name, code, id, position } of rez) {
    let ofd = dir_output + "/" + module_id;
    fs.mkdirSync(ofd, { recursive: true });
    categoryFile(ofd, capitalizeFirstLetter(module_id));
    let ofn = ofd + "/" + id + ".md";
    let md = "";

    let impA = fn.split(".")[0];

    let imp =
      "import " +
      capitalizeFirstLetter(module_id) +
      ' "mo:anvil/type/' +
      impA +
      '"';

    let relPath = path.relative("../../", dir_mo_type + "/" + fn);
    md += `\nGithub: [${relPath}](https://github.com/infu/nftanvil/blob/main/${relPath})\n`;

    md += "\n```motoko\n" + imp + "\n```\n";

    md += "\n\n```motoko\nmodule {\n...\n" + code + "\n...\n}\n```";
    fs.writeFileSync(ofn, template({ title: name, md, position }));
  }
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

categoryFile(dir_output, "Motoko", 20);
