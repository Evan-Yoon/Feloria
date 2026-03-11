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

    const mWidth = 760;
    const mHeight = 560;
    const bg = this.add.rectangle(width / 2, height / 2, mWidth, mHeight, 0x1a252f).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2, mWidth, mHeight).setStrokeStyle(4, 0x3498db).setOrigin(0.5);

    // Header
    this.add.text(width / 2 - 120, height / 2 - 230, "ITEM SHOP", { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#00', blur: 0, fill: true }
    }).setOrigin(0.5);
        
    this.add.text(width / 2, height / 2 + 250, "Press ESC to close", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

    this.goldText = this.add.text(width / 2 + mWidth/2 - 40, height / 2 - 230, `Gold: 0`, { font: 'bold 28px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5);

    // Notification Text
    this.notifText = this.add.text(width / 2, height / 2 + 200, "", { font: 'bold 20px Arial', fill: '#e74c3c' }).setOrigin(0.5);

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
        const itemY = height / 2 - 130 + (index * 85);
        
        // Item Backing
        const rowBg = this.add.rectangle(width / 2, itemY, 660, 65, 0x2c3e50)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x34495e);
            
        // Icon Placeholder
        const iconBg = this.add.rectangle(width / 2 - 290, itemY, 40, 40, 0x34495e).setOrigin(0.5);
        
        // Text
        this.add.text(width / 2 - 250, itemY, item.name, { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0, 0.5);
        this.add.text(width / 2 - 50, itemY, item.description, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0, 0.5);
        this.add.text(width / 2 + 180, itemY, `${item.price} G`, { font: 'bold 24px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5);

        // Buy Button
        const buyBtn = this.add.rectangle(width / 2 + 250, itemY, 90, 40, 0x27ae60).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
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
