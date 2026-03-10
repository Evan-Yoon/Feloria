import Phaser from 'phaser';
import { shopSystem } from '../systems/shopSystem.js';

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
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    const mWidth = 700;
    const mHeight = 500;
    const bg = this.add.rectangle(width / 2, height / 2, mWidth, mHeight, 0x34495e).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2, mWidth, mHeight).setStrokeStyle(4, 0xecf0f1).setOrigin(0.5);

    // Header
    this.add.text(width / 2, height / 2 - 210, "Village Shop", { font: 'bold 36px Arial', fill: '#f1c40f' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 220, "Press ESC to close", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

    this.goldText = this.add.text(width / 2 + mWidth/2 - 20, height / 2 - 210, `Gold: 0`, { font: '24px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5);

    // Notification Text
    this.notifText = this.add.text(width / 2, height / 2 + 180, "", { font: '20px Arial', fill: '#e74c3c' }).setOrigin(0.5);

    this.updateGoldText();
    this.renderItems(width, height);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume('WorldScene');
      this.scene.stop();
    });
  }

  updateGoldText() {
      const gold = this.registry.get('playerGold') || 0;
      this.goldText.setText(`Gold: ${gold}`);
  }

  renderItems(width, height) {
    const inventory = shopSystem.getShopInventory();
    
    inventory.forEach((item, index) => {
        const itemY = height / 2 - 120 + (index * 80);
        
        // Item Backing
        const rowBg = this.add.rectangle(width / 2, itemY, 600, 60, 0x2c3e50).setOrigin(0.5);
        
        // Text
        this.add.text(width / 2 - 280, itemY, item.name, { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0, 0.5);
        this.add.text(width / 2 - 50, itemY, item.description, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0, 0.5);
        this.add.text(width / 2 + 200, itemY, `${item.price} G`, { font: '24px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5);

        // Buy Button
        const buyBtn = this.add.rectangle(width / 2 + 250, itemY, 80, 40, 0x27ae60).setInteractive({ useHandCursor: true });
        const buyLabel = this.add.text(width / 2 + 250, itemY, 'BUY', { font: 'bold 18px Arial', fill: '#fff' }).setOrigin(0.5);

        buyBtn.on('pointerout', () => buyBtn.setFillStyle(0x27ae60));
        buyBtn.on('pointerover', () => buyBtn.setFillStyle(0x2ecc71));
        buyBtn.on('pointerdown', () => this.handleBuy(item.id));
    });
  }

  handleBuy(itemId) {
      const result = shopSystem.buyItem(this.registry, itemId, 1);
      
      this.notifText.setText(result.message);
      this.notifText.setFill(result.success ? '#2ecc71' : '#e74c3c');
      
      this.updateGoldText();

      // Clear notif after 2s
      this.time.delayedCall(2000, () => {
          if (this.notifText && this.notifText.active) {
              this.notifText.setText("");
          }
      });
  }
}
