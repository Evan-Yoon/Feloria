const fs = require('fs');
const path = require('path');

const mapDir = 'src/game/data/maps';
const mapNames = {
    'starwhisk_village.json': '스타위스크 마을',
    'greenpaw_forest.json': '그린포 숲',
    'mosslight_path.json': '모스라이트 길',
    'mosslight_shrine.json': '모스라이트 제단',
    'ancient_forest.json': '고대 숲'
};

for (const [filename, korName] of Object.entries(mapNames)) {
    const fullPath = path.join(mapDir, filename);
    if (fs.existsSync(fullPath)) {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        data.name = korName;
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Localized ${filename} to ${korName}`);
    }
}
