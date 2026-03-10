import Phaser from 'phaser';

/**
 * MenuScene
 * Overlay menu accessible from the WorldScene.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    // Menu Container
    const menuWidth = 300;
    const menuHeight = 400;
    const menuBg = this.add.rectangle(width - menuWidth - 20, 20, menuWidth, menuHeight, 0xecf0f1).setOrigin(0);
    const border = this.add.rectangle(width - menuWidth - 20, 20, menuWidth, menuHeight).setStrokeStyle(4, 0x2c3e50).setOrigin(0);

    // Title
    this.add.text(width - menuWidth / 2 - 20, 50, 'Menu', {
      font: 'bold 32px Arial', fill: '#2c3e50'
    }).setOrigin(0.5);

    // Buttons
    const buttons = [
      { text: 'Party', action: () => { this.scene.pause(); this.scene.launch('PartyScene'); } },
      { text: 'Inventory', action: () => { this.scene.pause(); this.scene.launch('InventoryScene'); } },
      { text: 'Codex', action: () => { this.scene.pause(); this.scene.launch('CodexScene'); } },
      { text: 'Quests', action: () => { this.scene.pause(); this.scene.launch('QuestScene'); } },
      { text: 'Close', action: () => { this.scene.resume('WorldScene'); this.scene.stop(); } }
    ];

    // Adjust container start Y slightly higher for 5 buttons
    let startY = 100;

    buttons.forEach((btn, i) => {
      const buttonBg = this.add.rectangle(width - menuWidth / 2 - 20, startY + (i * 60), 200, 45, 0x34495e)
        .setInteractive({ useHandCursor: true });
        
      const buttonText = this.add.text(width - menuWidth / 2 - 20, startY + (i * 60), btn.text, {
        font: '24px Arial', fill: '#ffffff'
      }).setOrigin(0.5);

      buttonBg.on('pointerdown', btn.action);
      buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x2c3e50));
      buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x34495e));
    });

    // Handle Escape to close
    this.input.keyboard.on('keydown-ESC', () => {
        this.scene.resume('WorldScene');
        this.scene.stop();
    });
  }
}
