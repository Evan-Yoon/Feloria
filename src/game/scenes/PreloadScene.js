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
   * This ensures the game runs even if external assets are missing.
   */
  createPlaceholderTextures() {
    // Player placeholder (Blue square with eyes)
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(4, 4, 8, 8);
    playerGraphics.fillRect(20, 4, 8, 8);
    playerGraphics.generateTexture('player', 32, 32);

    // Leafkit placeholder (Green)
    const leafkitGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    leafkitGraphics.fillStyle(0x2ecc71, 1);
    leafkitGraphics.fillRect(0, 0, 32, 32);
    leafkitGraphics.generateTexture('leafkit', 32, 32);

    // Emberpaw placeholder (Red)
    const emberpawGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    emberpawGraphics.fillStyle(0xe74c3c, 1);
    emberpawGraphics.fillRect(0, 0, 32, 32);
    emberpawGraphics.generateTexture('emberpaw', 32, 32);

    // Misttail placeholder (Blue)
    const misttailGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    misttailGraphics.fillStyle(0x34ace0, 1);
    misttailGraphics.fillRect(0, 0, 32, 32);
    misttailGraphics.generateTexture('misttail', 32, 32);

    // UI Frame (Gray border)
    const uiFrameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    uiFrameGraphics.lineStyle(4, 0xffffff, 1);
    uiFrameGraphics.strokeRect(0, 0, 32, 32);
    uiFrameGraphics.fillStyle(0x000000, 0.8);
    uiFrameGraphics.fillRect(0, 0, 32, 32);
    uiFrameGraphics.generateTexture('ui-frame', 32, 32);
  }
}
