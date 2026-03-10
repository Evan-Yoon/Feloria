import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
    this.add.text(width / 2, height / 2, 'Battle Scene\n(Coming in Phase 4)', {
      font: '32px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 2 + 100, 'Press W to return to WorldScene', {
      font: '16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-W', () => this.scene.start('WorldScene'));
  }
}
