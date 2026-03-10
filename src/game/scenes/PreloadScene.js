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
    // --- TILESET (32x32 tiles in a grid) ---
    // We'll create a tileset image with several different tiles
    const tileWidth = 32;
    const tileHeight = 32;
    const tilesetWidth = 256; // 8 tiles wide
    const tilesetHeight = 256; // 8 tiles high
    const tileGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    // 0: Empty/Transparent (default)
    
    // 1: Grass (light green)
    tileGraphics.fillStyle(0x78ab46, 1);
    tileGraphics.fillRect(tileWidth * 1, 0, tileWidth, tileHeight);
    tileGraphics.fillStyle(0x86b94d, 1);
    tileGraphics.fillRect(tileWidth * 1 + 2, 2, 4, 4);

    // 2: Dirt/Path (brown)
    tileGraphics.fillStyle(0x966f33, 1);
    tileGraphics.fillRect(tileWidth * 2, 0, tileWidth, tileHeight);

    // 3: Water (blue)
    tileGraphics.fillStyle(0x3498db, 1);
    tileGraphics.fillRect(tileWidth * 3, 0, tileWidth, tileHeight);

    // 4: Wall/Collision (gray) - Though not rendered, good to have a placeholder
    tileGraphics.fillStyle(0x7f8c8d, 1);
    tileGraphics.fillRect(tileWidth * 4, 0, tileWidth, tileHeight);
    tileGraphics.lineStyle(2, 0x2c3e50, 1);
    tileGraphics.strokeRect(tileWidth * 4 + 2, 2, 28, 28);

    // 5: Tall Grass (darker green with detail)
    tileGraphics.fillStyle(0x2d5a27, 1);
    tileGraphics.fillRect(tileWidth * 5, 0, tileWidth, tileHeight);
    tileGraphics.fillStyle(0x3d7a36, 1);
    tileGraphics.fillRect(tileWidth * 5 + 4, 4, 2, 10);
    tileGraphics.fillRect(tileWidth * 5 + 10, 8, 2, 12);
    tileGraphics.fillRect(tileWidth * 5 + 20, 4, 2, 10);

    // 6: Tree/Object (dark green)
    tileGraphics.fillStyle(0x1e3a1a, 1);
    tileGraphics.fillRect(tileWidth * 6, 0, tileWidth, tileHeight);

    tileGraphics.generateTexture('overworld-tiles', tilesetWidth, tilesetHeight);

    // --- PLAYER SPRITES (4 directions) ---
    // We'll create a small spritesheet for the player
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Down (Facing front)
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(6, 10, 6, 6); // Left eye
    playerGraphics.fillRect(20, 10, 6, 6); // Right eye
    
    // Up (Facing back)
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(32, 0, 32, 32);
    playerGraphics.fillStyle(0x2980b9, 1);
    playerGraphics.fillRect(32 + 6, 4, 20, 10); // Back detail
    
    // Left
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(64, 0, 32, 32);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(64 + 6, 10, 6, 6); // Single eye
    
    // Right
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(96, 0, 32, 32);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(96 + 20, 10, 6, 6); // Single eye

    playerGraphics.generateTexture('player', 128, 32);

    // --- OTHER ASSETS ---
    // NPC (Orange square)
    const npcGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    npcGraphics.fillStyle(0xe67e22, 1);
    npcGraphics.fillRect(0, 0, 32, 32);
    npcGraphics.generateTexture('npc', 32, 32);

    // Starters (Same as before but cleaned up)
    this.createStarterTexture('leafkit', 0x2ecc71);
    this.createStarterTexture('emberpaw', 0xe74c3c);
    this.createStarterTexture('misttail', 0x34ace0);

    // UI Frame
    const uiFrameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    uiFrameGraphics.lineStyle(4, 0xffffff, 1);
    uiFrameGraphics.strokeRect(0, 0, 64, 64);
    uiFrameGraphics.fillStyle(0x000000, 0.9);
    uiFrameGraphics.fillRect(0, 0, 64, 64);
    uiFrameGraphics.generateTexture('ui-frame', 64, 64);
  }

  createStarterTexture(key, color) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillRect(4, 4, 8, 8);
    graphics.generateTexture(key, 32, 32);
  }
}
