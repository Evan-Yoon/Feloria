import Phaser from 'phaser';

/**
 * BootScene
 * The very first scene that runs.
 * Used for basic system initialization and then immediately transitions to PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Usually we load a small loading bar image here before the main PreloadScene
    console.log('BootScene: Preloading basic assets...');
  }

  create() {
    console.log('BootScene: Initializing global game state...');
    
    // Initialize global registry for player data
    this.registry.set('playerName', 'Hero');
    this.registry.set('selectedStarter', null);
    this.registry.set('playerData', {
      level: 1,
      exp: 0,
      money: 100,
      inventory: [],
      party: []
    });

    // Move to PreloadScene
    this.scene.start('PreloadScene');
  }
}
