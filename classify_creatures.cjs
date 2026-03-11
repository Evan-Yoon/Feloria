const fs = require('fs');

const legendaries = [
  'SOLARION', 'GLACIARA', 'TEMPESTCLAW', 'VERDANTLYNX', 
  'UMBRAFANG', 'AQUARION', 'TERRACLAW', 'LUMINA', 
  'AETHERION', 'NOCTYRA'
];

const starters = [
  'LEAFKIT', 'BRAMBLECAT', 
  'EMBERPAW', 'CINDERCLAW', 
  'MISTTAIL', 'DEWTAIL'
];

function classify() {
    const filePath = 'src/game/data/creatures.js';
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    const newLines = [];
    
    let currentId = null;
    let currentBody = [];
    let state = 'out'; // out, in
    
    for (let line of lines) {
        if (state === 'out') {
            const match = line.match(/^\s*([A-Z0-9_]+):\s*\{/);
            if (match) {
                currentId = match[1];
                state = 'in';
                currentBody = [line];
            } else {
                newLines.push(line);
            }
        } else if (state === 'in') {
            currentBody.push(line);
            if (line.trim() === '},' || line.trim() === '}') {
                // Process body
                const bodyStr = currentBody.join('\n');
                
                const hpMatch = bodyStr.match(/baseHp:\s*(\d+)/);
                const atkMatch = bodyStr.match(/baseAttack:\s*(\d+)/);
                const defMatch = bodyStr.match(/baseDefense:\s*(\d+)/);
                
                const hp = hpMatch ? parseInt(hpMatch[1]) : 0;
                const atk = atkMatch ? parseInt(atkMatch[1]) : 0;
                const def = defMatch ? parseInt(defMatch[1]) : 0;
                const bst = hp + atk + def;
                
                const isEvolvable = bodyStr.includes('evolution: {') && !bodyStr.includes('evolution: null');
                
                let cls = "노말";
                if (legendaries.includes(currentId)) {
                    cls = "전설";
                } else if (starters.includes(currentId)) {
                    cls = "스타팅";
                } else if (!isEvolvable) {
                    cls = bst >= 70 ? "에픽" : "레어";
                }
                
                // Inject class before id or at second line
                let foundId = false;
                for (let i = 0; i < currentBody.length; i++) {
                    if (currentBody[i].includes('id:')) {
                        currentBody[i] = currentBody[i].replace(/id:\s*"([A-Z0-9_]+)"/, `id: "$1",\n    class: "${cls}"`);
                        foundId = true;
                        break;
                    }
                }
                
                if (!foundId) {
                    currentBody[1] = `    class: "${cls}",\n` + currentBody[1];
                }
                
                newLines.push(...currentBody);
                state = 'out';
            }
        }
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log("Classification applied successfully.");
}

classify();
