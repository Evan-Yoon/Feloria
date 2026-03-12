import Phaser from 'phaser';

/**
 * InventoryScene
 * Allows players to view their owned items and use them.
 */
export class InventoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InventoryScene' });
  }

  init(data) {
    data = data || {};
    // We can pass an expected "target selection" mode here later if needed
    // Currently, we will just use it as a global pause menu overlay.
    this.isTargetMode = data.isTargetMode || false;
    this.selectedItemId = null;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const mWidth = 1000;
    const mHeight = 560;
    this.panelX = width / 2;
    this.panelY = height / 2;

    this.add.rectangle(this.panelX, this.panelY, mWidth, mHeight, 0x1a252f).setOrigin(0.5);
    this.add.rectangle(this.panelX, this.panelY, mWidth, mHeight).setStrokeStyle(4, 0x3498db).setOrigin(0.5);

    this.add.text(this.panelX, this.panelY - 230, "가방", { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);
    
    this.notifText = this.add.text(this.panelX, this.panelY + 200, "", { font: 'bold 20px Arial', fill: '#e74c3c' }).setOrigin(0.5);
    this.add.text(this.panelX, this.panelY + 250, "ESC를 눌러 돌아가기", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

    // Items Container
    this.itemsContainer = this.add.container(0, 0);
    this.renderInventory();

    this.setupInputs();

    this.events.on('resume', () => {
        this.setupInputs();
    });
  }

  setupInputs() {
    this.input.keyboard.off('keydown-ESC');
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('MenuScene'); 
    });
  }

  renderInventory() {
    this.itemsContainer.removeAll(true);
    
    // Quick, clean fetch of normalized items
    const inventory = this.registry.get('playerInventory') || {};
    
    import('../systems/shopSystem.js').then(({ shopSystem }) => {
        const itemDatabase = shopSystem.getShopInventory(); // Gets all items as an array
        
        let yPos = this.panelY - 120;
        let itemsRendered = 0;

        itemDatabase.forEach((itemDef) => {
            const quantity = inventory[itemDef.id] || 0;
            if (quantity <= 0) return; // Only show owned items

            const rowBg = this.add.rectangle(this.panelX, yPos, 900, 60, 0x2c3e50)
                .setOrigin(0.5)
                .setStrokeStyle(2, 0x34495e);
            this.itemsContainer.add(rowBg);
            
            // Icon
            if (itemDef.spriteKey) {
                const icon = this.add.image(this.panelX - 425, yPos, itemDef.spriteKey).setScale(1.5);
                this.itemsContainer.add(icon);
            } else {
                const iconBg = this.add.rectangle(this.panelX - 425, yPos, 40, 40, 0x34495e).setOrigin(0.5);
                this.itemsContainer.add(iconBg);
            }

            this.itemsContainer.add(this.add.text(this.panelX - 380, yPos, itemDef.name, { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0, 0.5));
            this.itemsContainer.add(this.add.text(this.panelX - 180, yPos, itemDef.description, { 
                font: '18px Arial', 
                fill: '#bdc3c7',
                wordWrap: { width: 450 }
            }).setOrigin(0, 0.5));
            this.itemsContainer.add(this.add.text(this.panelX + 320, yPos, `x${quantity}`, { font: 'bold 24px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5));

            if (itemDef.type === 'healing') {
               const useBtn = this.add.rectangle(this.panelX + 410, yPos, 90, 40, 0x27ae60).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xffffff);
               const useLbl = this.add.text(this.panelX + 410, yPos, '사용', { font: 'bold 18px Arial', fill: '#ffffff' }).setOrigin(0.5);
               
               useBtn.on('pointerover', () => useBtn.setFillStyle(0x2ecc71));
               useBtn.on('pointerout', () => useBtn.setFillStyle(0x27ae60));
               useBtn.on('pointerdown', () => this.handleUseItem(itemDef, quantity));
               
               this.itemsContainer.add([useBtn, useLbl]);
            } else {
               const passiveLbl = this.add.text(this.panelX + 410, yPos, '전투용', { font: 'bold 16px Arial', fill: '#95a5a6' }).setOrigin(0.5);
               this.itemsContainer.add(passiveLbl);
            }
            
            yPos += 80;
            itemsRendered++;
        });

        if (itemsRendered === 0) {
            this.add.text(this.panelX, this.panelY, "가방이 비어 있습니다.", { font: '24px Arial', fill: '#95a5a6', fontStyle: 'italic' }).setOrigin(0.5);
        }
    });
  }

  handleUseItem(itemDef, currentQuantity) {
      if (currentQuantity <= 0) return;

      if (itemDef.type === 'healing') {
          // Send player to PartyScene with targetMode = true
          this.scene.sleep();
          this.scene.launch('PartyScene', { 
              isTargetMode: true, 
              itemId: itemDef.id, 
              itemEffect: itemDef.effectValue,
              itemName: itemDef.name,
              returnScene: 'InventoryScene'
          });
      }
  }

  wake() {
      // Re-render immediately upon waking to reflect updated counts
      this.renderInventory();
      this.setupInputs();
  }
}
