import Phaser from 'phaser';

/**
 * WorldScene Placeholder
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0x27ae60).setOrigin(0);
    this.add.text(width / 2, height / 2, 'World Scene\n(Coming in Phase 2)', {
      font: '32px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2 + 100, 'Press B to test Battle transition', {
      font: '16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-B', () => this.scene.start('BattleScene'));
  }
}
