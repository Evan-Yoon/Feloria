const fs = require('fs');

const typeMap = {
  "Forest": "숲",
  "Fire": "불",
  "Water": "물",
  "Grass": "풀",
  "Rock": "바위",
  "Shadow": "그림자",
  "Ice": "얼음",
  "Storm": "폭풍",
  "Spirit": "영혼",
  "Mystic": "신비",
  "Light": "빛",
  "Normal": "노말",
  "Electric": "전기",
  "Ice/Mystic": "얼음/신비",
  "Fire/Storm": "불/폭풍",
  "Forest/Spirit": "숲/영혼",
  "Spirit/Shadow": "영혼/그림자"
};

function translateContent(path, isSkills = false) {
    let text = fs.readFileSync(path, 'utf8');
    
    // Translate types
    for (const [en, kor] of Object.entries(typeMap)) {
        const regex = new RegExp(`"type":\\s*"${en}"`, 'g');
        text = text.replace(regex, `"type": "${kor}"`);
    }

    // Clean up any double quotes or formatting issues if any
    fs.writeFileSync(path, text, 'utf8');
    console.log(`Translated types in ${path}`);
}

translateContent('src/game/data/creatures.js');
translateContent('src/game/data/skills.js');

console.log("Translation sweep complete.");
