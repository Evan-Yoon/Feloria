import Phaser from 'phaser';
import { ASSETS } from '../config/assetPaths.js';

/**
 * PreloadScene
 * Responsible for loading all game assets.
 * Displays a loading bar to the user.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    console.log('PreloadScene: Loading assets...');

    // Create loading UI
    this.createLoadingUI();

    // Load assets defined in ASSETS config
    // For Phase 1, we might not have all files yet, so we handle missing files gracefully
    // Or we use placeholder textures created at runtime
    
    // In a real scenario, we would do:
    // this.load.image(ASSETS.UI.FRAME.KEY, ASSETS.UI.FRAME.PATH);
    // this.load.spritesheet(ASSETS.SPRITES.PLAYER.KEY, ASSETS.SPRITES.PLAYER.PATH, ASSETS.SPRITES.PLAYER.FRAME_CONFIG);
  }

  create() {
    console.log('PreloadScene: Assets loaded, creating placeholder textures...');

    // Create placeholder textures at runtime so the game is playable without external files
    this.createPlaceholderTextures();

    // Transition to StartScene
    this.scene.start('StartScene');
  }

  createLoadingUI() {
    const { width, height } = this.cameras.main;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading Feloria...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  /**
   * Generates simple placeholder textures for development.
   * This ensures the game is playable without external files.
   */
  createPlaceholderTextures() {
    // --- TILESET (256x256 image with 32x32 tiles) ---
    const tileGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // 1: Grass
    tileGraphics.fillStyle(0x78ab46, 1);
    tileGraphics.fillRect(32, 0, 32, 32);
    // 2: Dirt
    tileGraphics.fillStyle(0x966f33, 1);
    tileGraphics.fillRect(64, 0, 32, 32);
    // 3: Water
    tileGraphics.fillStyle(0x3498db, 1);
    tileGraphics.fillRect(96, 0, 32, 32);
    // 4: Wall
    tileGraphics.fillStyle(0x7f8c8d, 1);
    tileGraphics.fillRect(128, 0, 32, 32);
    // 5: Tall Grass
    tileGraphics.fillStyle(0x2d5a27, 1);
    tileGraphics.fillRect(160, 0, 32, 32);
    // 6: Tree
    tileGraphics.fillStyle(0x1e3a1a, 1);
    tileGraphics.fillRect(192, 0, 32, 32);

    tileGraphics.generateTexture('overworld-tiles', 256, 256);

    // --- PLAYER SPRITES ---
    const pg = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Create a 128x32 strip for the player spritesheet
    // Frame 0: Down
    pg.fillStyle(0x3498db, 1).fillRect(0, 0, 32, 32);
    pg.fillStyle(0xffffff, 1).fillRect(8, 8, 4, 4).fillRect(20, 8, 4, 4);
    // Frame 1: Up
    pg.fillStyle(0x3498db, 1).fillRect(32, 0, 32, 32);
    pg.fillStyle(0x2980b9, 1).fillRect(40, 4, 16, 8);
    // Frame 2: Left
    pg.fillStyle(0x3498db, 1).fillRect(64, 0, 32, 32);
    pg.fillStyle(0xffffff, 1).fillRect(72, 8, 4, 4);
    // Frame 3: Right
    pg.fillStyle(0x3498db, 1).fillRect(96, 0, 32, 32);
    pg.fillStyle(0xffffff, 1).fillRect(116, 8, 4, 4);

    pg.generateTexture('player-sheet', 128, 32);
    
    // Register the spritesheet
    this.textures.addSpriteSheet('player', this.textures.get('player-sheet').getSourceImage(), {
      frameWidth: 32,
      frameHeight: 32
    });

    // --- OTHER ASSETS ---
    const npcGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    npcGraphics.fillStyle(0xe67e22, 1).fillRect(0, 0, 32, 32);
    npcGraphics.generateTexture('npc', 32, 32);

    this.createStarterTexture('leafkit', 0x2ecc71);
    this.createStarterTexture('emberpaw', 0xe74c3c);
    this.createStarterTexture('misttail', 0x34ace0);

    const uiFrameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    uiFrameGraphics.fillStyle(0x000000, 0.9).fillRect(0, 0, 64, 64);
    uiFrameGraphics.lineStyle(2, 0xffffff, 1).strokeRect(0, 0, 64, 64);
    uiFrameGraphics.generateTexture('ui-frame', 64, 64);
  }

  createStarterTexture(key, color) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color, 1).fillRect(0, 0, 32, 32);
    graphics.generateTexture(key, 32, 32);
  }
}
