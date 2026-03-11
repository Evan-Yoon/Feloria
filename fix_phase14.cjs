const fs = require('fs');

const skillsPath = 'src/game/data/skills.js';
const skillsText = fs.readFileSync(skillsPath, 'utf8');
const match = skillsText.match(/export const SKILLS = ([\s\S]+?);\s*$/);
let SKILLS;
eval("SKILLS = " + match[1]);

const legendariesExtra = [
  "supernova", "permafrost", "typhoon_fury", "world_tree_root", "abyssal_devour",
  "tsunami_burst", "tectonic_slam", "genesis_light", "astral_judgment", "dream_eater"
];

// Re-generate correct power ranges
function getRandomPower(grade) {
  if (grade === 3) return Math.floor(Math.random() * (38 - 20 + 1)) + 20;
  if (grade === 2) return Math.floor(Math.random() * (55 - 35 + 1)) + 35;
  if (grade === 1) return Math.floor(Math.random() * (78 - 50 + 1)) + 50;
  if (grade === 0) return Math.floor(Math.random() * (110 - 75 + 1)) + 75;
  return 30;
}

const translationFixes = {
  "whip": "채찍",
  "beam": "빔",
  "shatter": "분쇄",
  "throw": "던지기",
  "roll": "구르기",
  "drain": "흡수",
  "whip": "채찍",
  "void": "공허",
  "spectral": "스펙트럴",
  "celestial": "천상의",
  "spirit": "영혼",
  "hurricane": "허리케인",
  "mountain": "산매",
  "shield": "방패",
  "radiant": "빛나는",
  "divine": "신성한",
  "aether": "에테르",
  "blast": "폭발"
};

for (const [id, skill] of Object.entries(SKILLS)) {
  // Fix Legendaries
  if (legendariesExtra.includes(id) || id === "firestorm" || id === "absolute_zero" || id === "hurricane_strike" || id === "soul_reap") {
    // Some are unique legendary level
    if (legendariesExtra.includes(id)) {
        skill.grade = 0;
        skill.power = getRandomPower(0);
    }
  }

  // Fix _g3 skills (Basic cats)
  if (id.endsWith("_g3")) {
    skill.grade = 3;
    skill.power = getRandomPower(3);
  }

  // Fix Grade 1 (Final forms of starters/others)
  // Let's assume anything not starting with _g3 and not legendary extra is properly graded?
  // Re-check grade 1 power if it is grade 1
  if (skill.grade === 1) {
    if (skill.power < 50 || skill.power > 78) {
       skill.power = getRandomPower(1);
    }
  }

  // Fix translations in name
  let name = skill.name;
  for (const [eng, kor] of Object.entries(translationFixes)) {
    const regex = new RegExp(eng, "gi");
    if (name.match(regex)) {
      name = name.replace(regex, kor);
    }
  }
  // Remove spaces between Korean words for a more 'skill-like' feel if needed, but let's keep one space.
  skill.name = name.trim();
}

let outputStr = "export const SKILLS = {\n";
for (const [key, val] of Object.entries(SKILLS)) {
  outputStr += `  ${key}: ${JSON.stringify(val)},\n`;
}
outputStr += "};\n";

fs.writeFileSync(skillsPath, outputStr, 'utf8');
console.log("Fixed skill grades, powers, and translations.");
