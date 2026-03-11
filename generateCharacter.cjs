const fs = require("fs");
const path = require("path");

const folder = "./public/assets/characters"; // 캐릭터 폴더
const files = fs.readdirSync(folder);

const normal = [];
const objects = [];
const single = [];

files.forEach((file) => {
    if (!file.endsWith(".png")) return;

    const name = file.replace(".png", "");
    const key = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    const base = `{ KEY: '${key}', PATH: '/assets/characters/${file}', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } }`;

    if (file.startsWith("!$") || file.startsWith("$")) {
        single.push(`${name.toUpperCase()}: ${base}`);
    } else if (file.startsWith("!")) {
        objects.push(`${name.replace("!", "").toUpperCase()}: ${base}`);
    } else {
        normal.push(`${name.toUpperCase()}: ${base}`);
    }
});

const output = `
export const ASSETS = {

  CHARACTERS: {
${normal.join(",\n")}
  },

  OBJECT_CHARACTERS: {
${objects.join(",\n")}
  },

  SINGLE_CHARACTERS: {
${single.join(",\n")}
  }

};
`;

fs.writeFileSync("characters_assets.js", output);

console.log("characters_assets.js 생성 완료");