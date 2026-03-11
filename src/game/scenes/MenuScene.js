import Phaser from 'phaser';
import { saveSystem } from '../systems/saveSystem.js';

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

    // Elegant Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    // Menu Container - Centered better on the right
    const menuWidth = 320;
    const menuHeight = 500;
    const padX = width - menuWidth - 40;
    const padY = (height - menuHeight) / 2;

    const menuBg = this.add.rectangle(padX, padY, menuWidth, menuHeight, 0x1a252f).setOrigin(0);
    const border = this.add.rectangle(padX, padY, menuWidth, menuHeight).setStrokeStyle(4, 0x3498db).setOrigin(0);

    // Title
    this.add.text(padX + menuWidth / 2, padY + 40, '메뉴', {
      font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);

    // Buttons
    const buttons = [
      { text: '파티', action: () => { this.scene.pause(); this.scene.launch('PartyScene'); } },
      { text: '가방', action: () => { this.scene.pause(); this.scene.launch('InventoryScene'); } },
      { text: '도감', action: () => { this.scene.pause(); this.scene.launch('CodexScene'); } },
      { text: '퀘스트', action: () => { this.scene.pause(); this.scene.launch('QuestScene'); } },
      { text: '저장', action: () => { this.scene.pause(); this.scene.launch('SaveLoadScene', { mode: 'save' }); } },
      { text: '닫기', action: () => { this.scene.resume('WorldScene'); this.scene.stop(); }, color: 0xc0392b }
    ];

    let startY = padY + 110;

    buttons.forEach((btn, i) => {
      const baseColor = btn.color || 0x2c3e50;
      const hoverColor = btn.color ? 0xe74c3c : 0x34495e;

      const buttonBg = this.add.rectangle(padX + menuWidth / 2, startY + (i * 65), 240, 50, baseColor)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xecf0f1);
        
      const buttonText = this.add.text(padX + menuWidth / 2, startY + (i * 65), btn.text, {
        font: 'bold 22px Arial', fill: '#ffffff'
      }).setOrigin(0.5);

      buttonBg.on('pointerdown', btn.action);
      buttonBg.on('pointerover', () => buttonBg.setFillStyle(hoverColor));
      buttonBg.on('pointerout', () => buttonBg.setFillStyle(baseColor));
    });

    // Handle Escape to close
    this.input.keyboard.on('keydown-ESC', () => {
        this.scene.resume('WorldScene');
        this.scene.stop();
    });
  }
}
