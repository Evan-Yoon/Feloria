import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'C:/Feloria/Feloria/public/assets/sprites/creatures';
const outDir = 'C:/Feloria/Feloria/public/assets/sprites/creatures_processed'; // Temporary output for verification

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

async function processAll() {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        console.log(`Processing ${file}...`);
        try {
            const inputPath = path.join(dir, file);
            const { data, info } = await sharp(inputPath)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            const { width, height, channels } = info;
            const pixels = new Uint8Array(data);
            const visited = new Uint8Array(width * height);
            
            // Background colors to ignore (taken from corners)
            const corners = [
                getPixel(0, 0),
                getPixel(width - 1, 0),
                getPixel(0, height - 1),
                getPixel(width - 1, height - 1)
            ];

            const queue = [];

            // Helper to get pixel color as [R, G, B, A]
            function getPixel(x, y) {
                const idx = (y * width + x) * channels;
                return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
            }

            // Helper to check if color matches any corner with tolerance
            function isBackground(x, y) {
                const [r, g, b, a] = getPixel(x, y);
                const tolerance = 15;
                for (const corner of corners) {
                    if (Math.abs(r - corner[0]) < tolerance &&
                        Math.abs(g - corner[1]) < tolerance &&
                        Math.abs(b - corner[2]) < tolerance) {
                        return true;
                    }
                }
                return false;
            }

            // Seed BFS with border pixels that are background-like
            for (let x = 0; x < width; x++) {
                if (isBackground(x, 0)) queue.push([x, 0]);
                if (isBackground(x, height - 1)) queue.push([x, height - 1]);
            }
            for (let y = 0; y < height; y++) {
                if (isBackground(0, y)) queue.push([0, y]);
                if (isBackground(width - 1, y)) queue.push([width - 1, y]);
            }

            // BFS
            while (queue.length > 0) {
                const [cx, cy] = queue.shift();
                const idx = cy * width + cx;
                if (visited[idx]) continue;
                visited[idx] = 1;

                // Set transparency
                const pIdx = (cy * width + cx) * channels;
                pixels[pIdx + 3] = 0;

                // Check neighbors
                const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (const [dx, dy] of directions) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        if (!visited[ny * width + nx] && isBackground(nx, ny)) {
                            queue.push([nx, ny]);
                        }
                    }
                }
            }

            // Save back
            await sharp(pixels, { raw: { width, height, channels } })
                .png()
                .toFile(path.join(dir, file)); // Overwriting original as requested
                
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
    console.log('Finished processing all sprites.');
}

processAll();
