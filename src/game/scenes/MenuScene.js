import Phaser from 'phaser';
import { buttonFactory } from '../systems/uiHelpers/buttonFactory.js';

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

    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    // Panel
    const menuWidth = 320;
    const menuHeight = 520;
    const padX = width - menuWidth - 40;
    const padY = (height - menuHeight) / 2;

    const menuGraphics = this.add.graphics();
    menuGraphics.fillStyle(0x011627, 0.8);
    menuGraphics.fillRoundedRect(padX, padY, menuWidth, menuHeight, 20);
    menuGraphics.lineStyle(3, 0x3498db, 1);
    menuGraphics.strokeRoundedRect(padX, padY, menuWidth, menuHeight, 20);

    this.add.text(padX + menuWidth / 2, padY + 45, '메뉴', {
      font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Buttons
    const buttons = [
      { text: '파티',   onClick: () => { this.scene.pause(); this.scene.launch('PartyScene'); } },
      { text: '가방',   onClick: () => { this.scene.pause(); this.scene.launch('InventoryScene'); } },
      { text: '도감',   onClick: () => { this.scene.pause(); this.scene.launch('CodexScene'); } },
      { text: '퀘스트', onClick: () => { this.scene.pause(); this.scene.launch('QuestScene'); } },
      { text: '저장',   onClick: () => { this.scene.pause(); this.scene.launch('SaveLoadScene', { mode: 'save' }); } },
      { text: '닫기',   onClick: () => { this.scene.resume('WorldScene'); this.scene.stop(); }, baseColor: 0xc0392b, hoverColor: 0xe74c3c },
    ];

    const bX = padX + menuWidth / 2;
    const startY = padY + 130;

    buttons.forEach((btn, i) => {
      buttonFactory.create(
        this, bX, startY + i * 68, btn.text, 260, 50,
        { onClick: btn.onClick, baseColor: btn.baseColor, hoverColor: btn.hoverColor }
      );
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume('WorldScene');
      this.scene.stop();
    });
  }
}
