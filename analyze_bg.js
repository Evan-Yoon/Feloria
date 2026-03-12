import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'C:/Feloria/Feloria/public/assets/sprites/creatures';

async function analyze() {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    const results = [];
    
    for (const file of files) {
        try {
            const { data, info } = await sharp(path.join(dir, file))
                .raw()
                .toBuffer({ resolveWithObject: true });
            
            // Get pixel at (0,0)
            const r = data[0];
            const g = data[1];
            const b = data[2];
            const a = info.channels === 4 ? data[3] : 255;
            
            results.push({ file, pixel: [r, g, b, a] });

            if (file === 'AQUARION.png') {
                console.log('AQUARION Alpha (first 10 pixels):', data.slice(0, 40).filter((_, i) => i % 4 === 3));
            }
        } catch (e) {
            console.error(`Error analyzing ${file}:`, e);
        }
    }
    
    console.log(JSON.stringify(results, null, 2));
}

analyze();
