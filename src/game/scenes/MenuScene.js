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

    // Menu Panel - Centered better on the right
    const menuWidth = 320;
    const menuHeight = 520;
    const padX = width - menuWidth - 40;
    const padY = (height - menuHeight) / 2;

    const menuGraphics = this.add.graphics();
    // Glassy background
    menuGraphics.fillStyle(0x011627, 0.8);
    menuGraphics.fillRoundedRect(padX, padY, menuWidth, menuHeight, 20);
    // Glowing border
    menuGraphics.lineStyle(3, 0x3498db, 1);
    menuGraphics.strokeRoundedRect(padX, padY, menuWidth, menuHeight, 20);

    // Title
    this.add.text(padX + menuWidth / 2, padY + 45, '메뉴', {
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

    let startY = padY + 130;

    buttons.forEach((btn, i) => {
      const bX = padX + menuWidth / 2;
      const bY = startY + (i * 68);
      const bW = 260;
      const bH = 50;

      const baseColor = btn.color || 0x2c3e50;
      const hoverColor = btn.color ? 0xe74c3c : 0x34495e;

      // Button background using Graphics for rounded corners
      const btnG = this.add.graphics();
      btnG.fillStyle(baseColor, 0.7);
      btnG.fillRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 12);
      btnG.lineStyle(2, 0xecf0f1, 0.8);
      btnG.strokeRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 12);

      const buttonText = this.add.text(bX, bY, btn.text, {
        font: 'bold 22px Arial', fill: '#ffffff'
      }).setOrigin(0.5);

      // Interactive hit area
      const hitArea = this.add.rectangle(bX, bY, bW, bH, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerdown', btn.action);
      hitArea.on('pointerover', () => {
        btnG.clear();
        btnG.fillStyle(hoverColor, 0.9);
        btnG.fillRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 12);
        btnG.lineStyle(2, 0xffffff, 1);
        btnG.strokeRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 12);
        buttonText.setStyle({ fill: '#f1c40f' });
      });
      hitArea.on('pointerout', () => {
        btnG.clear();
        btnG.fillStyle(baseColor, 0.7);
        btnG.fillRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 12);
        btnG.lineStyle(2, 0xecf0f1, 0.8);
        btnG.strokeRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 12);
        buttonText.setStyle({ fill: '#ffffff' });
      });
    });

    // Handle Escape to close
    this.input.keyboard.on('keydown-ESC', () => {
        this.scene.resume('WorldScene');
        this.scene.stop();
    });
  }
}
