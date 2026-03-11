const fs = require('fs');

const creaturesPath = 'src/game/data/creatures.js';
const skillsPath = 'src/game/data/skills.js';

let creaturesText = fs.readFileSync(creaturesPath, 'utf8');

// Match the object inside export const CREATURES
let match = creaturesText.match(/export const CREATURES = ([\s\S]+?);\s*$/);
let CREATURES;
eval("CREATURES = " + match[1]);

const legendaries = [
  "SOLARION", "GLACIARA", "TEMPESTCLAW", "VERDANTLYNX", "UMBRAFANG", 
  "AQUARION", "TERRACLAW", "LUMINA", "AETHERION", "NOCTYRA"
];

const legExtraSkills = {
  SOLARION: "supernova",
  GLACIARA: "permafrost",
  TEMPESTCLAW: "typhoon_fury",
  VERDANTLYNX: "world_tree_root",
  UMBRAFANG: "abyssal_devour",
  AQUARION: "tsunami_burst",
  TERRACLAW: "tectonic_slam",
  LUMINA: "genesis_light",
  AETHERION: "astral_judgment",
  NOCTYRA: "dream_eater"
};

let modifiedCreatures = false;
for (const leg of legendaries) {
  if (CREATURES[leg] && CREATURES[leg].skills && CREATURES[leg].skills.length === 3) {
    CREATURES[leg].skills.push(legExtraSkills[leg]);
    modifiedCreatures = true;
  }
}

if (modifiedCreatures) {
  const newCreaturesText = "export const CREATURES = " + JSON.stringify(CREATURES, null, 2).replace(/"([^"]+)":/g, '$1:') + ";\n";
  fs.writeFileSync(creaturesPath, newCreaturesText, 'utf8');
}

let skillsText = fs.readFileSync(skillsPath, 'utf8');
let match2 = skillsText.match(/export const SKILLS = ([\s\S]+?);\s*$/);
let existingSkills = {};
if (match2) {
  eval("existingSkills = " + match2[1]);
}

const allSkills = {};
const usedSkillIds = new Set();
const gradeAssigns = {};

for (const [id, c] of Object.entries(CREATURES)) {
  let grade = 3;
  if (legendaries.includes(id)) {
    grade = 0;
  } else if (!c.evolution) {
    grade = 1;
  }
  
  if (c.skills) {
    c.skills.forEach(skillId => {
      usedSkillIds.add(skillId);
      gradeAssigns[skillId] = grade;
    });
  }
}

function getRandomPower(grade) {
  if (grade === 3) return Math.floor(Math.random() * (38 - 20 + 1)) + 20;
  if (grade === 2) return Math.floor(Math.random() * (55 - 35 + 1)) + 35;
  if (grade === 1) return Math.floor(Math.random() * (78 - 50 + 1)) + 50;
  if (grade === 0) return Math.floor(Math.random() * (110 - 75 + 1)) + 75;
  return 30;
}

const wordToKorean = {
  ice: "얼음", claw: "발톱", silver: "은빛", gaze: "응시", cold: "차가운", step: "걸음", 
  heat: "열기", bite: "물기", ember: "불씨", tail: "꼬리", sun: "태양", stare: "시선", 
  light: "빛의", paw: "발바닥", silk: "비단", guard: "방어", glow: "불빛", breath: "숨결", 
  earth: "대지", heavy: "무거운", push: "밀치기", wild: "야생의", roar: "포효", spark: "전기", 
  quick: "빠른", pounce: "덮치기", flash: "섬광", water: "물", touch: "손길", soft: "부드러운", 
  wave: "물결", mist: "안개", wrap: "감싸기", leaf: "나뭇잎", vine: "덩굴", bat: "타격", 
  nature: "자연", hide: "숨기", snow: "눈결", frost: "서리", winter: "겨울", mind: "정신", 
  arcane: "비전", mystic: "신비한", blink: "점멸", stone: "바위", solid: "단단한", 
  stance: "자세", rock: "돌", nudge: "밀기", sand: "모래", fire: "불꽃", dash: "돌진", 
  slash: "베기", gleam: "번쩍이는", halo: "광륜", gust: "돌풍", storm: "폭풍", rush: "러시", 
  tiny: "작은", mana: "마나", lucky: "행운의", holy: "신성한", blessing: "축복의", 
  zigzag: "지그재그", wind: "바람", nip: "깨물기", air: "공기", slice: "가르기", turn: "돌기", 
  whirl: "소용돌이", focus: "집중", spike: "가시", tap: "두드리기", steady: "안정된", 
  plain: "평범한", strike: "일격", mark: "표식", relic: "유물", lake: "호수", splash: "튀기기", 
  wet: "젖은", tail_less: "꼬리없는", jump: "도약", hard: "강력한", shadow: "그림자", 
  dark: "어둠", swipe: "휘두르기", night: "야간", warm: "따뜻한", brown: "갈색", flare: "플레어", 
  healing: "치유의", drop: "방울", calm: "차분한", sky: "하늘", silent: "고요한", blue: "푸른", 
  electric: "전류", red: "붉은", stripe: "줄무늬", hunter: "사냥꾼", mirror: "거울", 
  curl: "곱슬", rough: "거친", supernova: "초신성", permafrost: "영구동토", typhoon: "태풍의",
  fury: "격노", world: "세계수", tree: "나무", root: "뿌리", abyssal: "심연의", devour: "포식",
  tsunami: "해일", burst: "작렬", tectonic: "지각의", slam: "강타", genesis: "창세의",
  astral: "성운의", judgment: "심판", dream: "꿈", eater: "먹는자"
};

function generateKoreanName(id) {
  let parts = id.replace(/_g\d+/, '').split('_');
  let name = parts.map(p => wordToKorean[p] || p).join(' ');
  return name;
}

for (const skillId of usedSkillIds) {
  const grade = gradeAssigns[skillId] || 3;
  if (existingSkills[skillId]) {
    allSkills[skillId] = {
      id: skillId,
      name: existingSkills[skillId].name,
      grade: grade,
      type: existingSkills[skillId].type || 'Normal',
      power: existingSkills[skillId].power > 10 ? existingSkills[skillId].power : getRandomPower(grade),
      accuracy: 100,
      category: 'attack',
      animationKey: 'default_anim',
      effectType: existingSkills[skillId].effectType || 'slash'
    };
  } else {
    allSkills[skillId] = {
      id: skillId,
      name: generateKoreanName(skillId),
      grade: grade,
      type: 'Normal',
      power: getRandomPower(grade),
      accuracy: 90 + Math.floor(Math.random()*10),
      category: 'attack',
      animationKey: 'default_anim',
      effectType: 'slash'
    };
  }
}

let fillerId = 1;
while(Object.keys(allSkills).length < 200) {
  const sid = `filler_skill_${fillerId}`;
  const grade = 2;
  allSkills[sid] = {
    id: sid,
    name: `비전기 ${fillerId}`,
    grade: grade,
    type: "Normal",
    power: getRandomPower(grade),
    accuracy: 100,
    category: "attack",
    animationKey: "default_anim",
    effectType: "impact"
  };
  fillerId++;
}

let outputStr = "export const SKILLS = {\n";
for (const [key, val] of Object.entries(allSkills)) {
  outputStr += `  ${key}: ${JSON.stringify(val)},\n`;
}
outputStr += "};\n";

fs.writeFileSync(skillsPath, outputStr, 'utf8');

console.log("Updated creatures with legendaries 4th skills.");
console.log("Total unique skills generated: " + Object.keys(allSkills).length);
