/**
 * pixelArtGenerator.js
 * Programmatic pixel art utility to generate rich textures without external files.
 */

// Color palette mapping based on 16-bit style
const PALETTE = {
  '.': null, // Transparent
  '0': 0x000000, '1': 0x222222, '2': 0x555555, '3': 0xaaaaaa, '4': 0xffffff, // Grays
  'R': 0xc0392b, 'r': 0xe74c3c, 'p': 0xff7979, // Reds
  'G': 0x27ae60, 'g': 0x2ecc71, 'l': 0xbadc58, // Greens
  'B': 0x2980b9, 'b': 0x3498db, 'c': 0x7ed6df, // Blues
  'Y': 0xf39c12, 'y': 0xf1c40f, 'e': 0xf6e58d, // Yellows
  'D': 0x8e44ad, 'd': 0x9b59b6, // Purples
  'O': 0xd35400, 'o': 0xe67e22, // Orange
  'W': 0x8B4513, 'w': 0xA0522D, 't': 0xCD853F, // Wood/Brown
  'f': 0xFFDBAC, // Flesh/Skin Tone
  'H': 0x3E2723, // Dark Hair
  'K': 0xF1C27D, // Khaki/Tan
  'U': 0x6D214F, // Unique Purple/Deep Dress
  'S': 0xbdc3c7, 's': 0xecf0f1, // Silver
  'E': 0x78ab46, 'v': 0x966f33 // Earth/Environment logic
};

export const pixelArtGenerator = {
  /**
   * Generates a Phaser texture from an array of strings.
   * @param {Phaser.Scene} scene 
   * @param {string} key 
   * @param {string[]} pattern 
   * @param {number} pixelSize 
   */
  createTexture: (scene, key, pattern, pixelSize = 2) => {
    const height = pattern.length;
    const width = pattern[0].length;
    
    // Check if texture exists
    if (scene.textures.exists(key)) return;

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = pattern[y][x];
        const color = PALETTE[char];
        
        if (color !== undefined && color !== null) {
          graphics.fillStyle(color, 1);
          graphics.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    graphics.generateTexture(key, width * pixelSize, height * pixelSize);
    graphics.destroy();
  },

  /**
   * Create a spritesheet from multiple frames (array of 2D string arrays)
   */
  createSpritesheet: (scene, key, frames, frameWidthTiles, frameHeightTiles, pixelSize = 2) => {
    if (scene.textures.exists(key)) return;
    if (!frames || frames.length === 0) return;

    const totalWidthTiles = frameWidthTiles * frames.length;
    const totalHeightTiles = frameHeightTiles;

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    frames.forEach((frame, frameIndex) => {
      const offsetX = frameIndex * frameWidthTiles;
      for (let y = 0; y < frameHeightTiles; y++) {
        for (let x = 0; x < frameWidthTiles; x++) {
          const char = frame[y][x];
          const color = PALETTE[char];
          
          if (color !== undefined && color !== null) {
            graphics.fillStyle(color, 1);
            graphics.fillRect((offsetX + x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    });

    graphics.generateTexture(key + '-sheet', totalWidthTiles * pixelSize, totalHeightTiles * pixelSize);
    graphics.destroy();

    scene.textures.addSpriteSheet(key, scene.textures.get(key + '-sheet').getSourceImage(), {
      frameWidth: frameWidthTiles * pixelSize,
      frameHeight: frameHeightTiles * pixelSize
    });
  },

  /**
   * Create a horizontal tileset from an array of 2D string patterns
   */
  createTileset: (scene, key, tilePatterns, pixelSize = 2) => {
    if (scene.textures.exists(key)) return;
    if (!tilePatterns || tilePatterns.length === 0) return;

    const tileHeight = tilePatterns[0].length;
    const tileWidth = tilePatterns[0][0].length;
    const totalWidth = tileWidth * tilePatterns.length;

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    tilePatterns.forEach((pattern, index) => {
        const offsetX = index * tileWidth;
        for (let y = 0; y < tileHeight; y++) {
          for (let x = 0; x < tileWidth; x++) {
            const char = pattern[y][x];
            const color = PALETTE[char];
            
            if (color !== undefined && color !== null) {
              graphics.fillStyle(color, 1);
              graphics.fillRect((offsetX + x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
          }
        }
    });

    // Provide some padding texture space (e.g. 256x256 if needed)
    graphics.generateTexture(key, totalWidth * pixelSize, Math.max(256, tileHeight * pixelSize));
    graphics.destroy();
  }
};
