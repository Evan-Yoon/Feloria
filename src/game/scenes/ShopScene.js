import Phaser from 'phaser';
import { shopSystem } from '../systems/shopSystem.js';
import { saveSystem } from '../systems/saveSystem.js';

/**
 * ShopScene
 * An interactive overlay layer allowing the player to buy items with Gold.
 */
export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const mWidth = 1040;
    const mHeight = 600;
    const panelX = width / 2;
    const panelY = height / 2;

    const panelG = this.add.graphics();
    // Glassy background
    panelG.fillStyle(0x011627, 0.85);
    panelG.fillRoundedRect(panelX - mWidth / 2, panelY - mHeight / 2, mWidth, mHeight, 20);
    // Glowing border
    panelG.lineStyle(4, 0x3498db, 1);
    panelG.strokeRoundedRect(panelX - mWidth / 2, panelY - mHeight / 2, mWidth, mHeight, 20);

    // Header
    this.add.text(width / 2 - 250, height / 2 - 250, "아이템 상점", { 
        font: 'bold 44px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);
        
    this.add.text(width / 2, height / 2 + 270, "ESC를 눌러 닫기", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

    this.goldText = this.add.text(width / 2 + mWidth/2 - 50, height / 2 - 250, `보유 골드: 0`, { font: 'bold 34px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5);

    // Notification Text
    this.notifText = this.add.text(width / 2, height / 2 + 220, "", { font: 'bold 20px Arial', fill: '#e74c3c' }).setOrigin(0.5);

    this.updateGoldText();
    this.renderItems(width, height);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume('WorldScene');
      this.scene.stop();
    });
  }

  updateGoldText() {
      const gold = this.registry.get('playerGold') || 0;
      this.goldText.setText(`보유 골드: ${gold}`);
  }

  renderItems(width, height) {
    const inventory = shopSystem.getShopInventory();
    
    inventory.forEach((item, index) => {
        const itemY = height / 2 - 140 + (index * 85);
        const rowX = width / 2;
        const rowW = 960;
        const rowH = 70;
        
        // Item Backing (Glassy)
        const rowG = this.add.graphics();
        rowG.fillStyle(0x2c3e50, 0.6);
        rowG.fillRoundedRect(rowX - rowW / 2, itemY - rowH / 2, rowW, rowH, 12);
        rowG.lineStyle(2, 0x34495e, 1);
        rowG.strokeRoundedRect(rowX - rowW / 2, itemY - rowH / 2, rowW, rowH, 12);
            
        // Icon
        if (item.spriteKey) {
            this.add.image(width / 2 - 440, itemY, item.spriteKey).setScale(1.5);
        } else {
            this.add.rectangle(width / 2 - 440, itemY, 40, 40, 0x34495e).setOrigin(0.5);
        }
        
        // Text
        this.add.text(width / 2 - 390, itemY, item.name, { font: 'bold 28px Arial', fill: '#ffffff' }).setOrigin(0, 0.5);
        this.add.text(width / 2 - 180, itemY, item.description, { 
            font: '20px Arial', 
            fill: '#bdc3c7',
            wordWrap: { width: 450 } 
        }).setOrigin(0, 0.5);
        this.add.text(width / 2 + 320, itemY, `${item.price} G`, { font: 'bold 28px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5);

        // Buy Button (Glassy Rounded)
        const btnX = width / 2 + 410;
        const btnY = itemY;
        const btnW = 90;
        const btnH = 40;

        const buyBtnG = this.add.graphics();
        buyBtnG.fillStyle(0x27ae60, 0.8);
        buyBtnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        buyBtnG.lineStyle(2, 0xffffff, 0.9);
        buyBtnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);

        const buyLabel = this.add.text(btnX, btnY, '구매', { font: 'bold 18px Arial', fill: '#fff' }).setOrigin(0.5);

        const hitArea = this.add.rectangle(btnX, btnY, btnW, btnH, 0x000000, 0).setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            buyBtnG.clear();
            buyBtnG.fillStyle(0x2ecc71, 1);
            buyBtnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
            buyBtnG.lineStyle(2, 0xffffff, 1);
            buyBtnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        });
        hitArea.on('pointerout', () => {
            buyBtnG.clear();
            buyBtnG.fillStyle(0x27ae60, 0.8);
            buyBtnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
            buyBtnG.lineStyle(2, 0xffffff, 0.9);
            buyBtnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        });
        hitArea.on('pointerdown', () => this.handleBuy(item.id));
    });
  }

  handleBuy(itemId) {
      const result = shopSystem.buyItem(this, itemId, 1);
      
      this.notifText.setText(result.message);
      this.notifText.setFill(result.success ? '#2ecc71' : '#e74c3c');
      
      this.updateGoldText();

      if (result.success) {
        const mapId = this.registry.get('world_mapId') || 'starwhisk_village';
        const spawnX = this.registry.get('world_spawnX') || 10;
        const spawnY = this.registry.get('world_spawnY') || 10;
        saveSystem.saveData(this.registry, mapId, spawnX, spawnY);
      }

      // Clear notif after 2s
      this.time.delayedCall(2000, () => {
          if (this.notifText && this.notifText.active) {
              this.notifText.setText("");
          }
      });
  }
}
