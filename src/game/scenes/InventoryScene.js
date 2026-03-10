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
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    const mWidth = 700;
    const mHeight = 500;
    this.panelX = width / 2;
    this.panelY = height / 2;

    this.add.rectangle(this.panelX, this.panelY, mWidth, mHeight, 0x2c3e50).setOrigin(0.5);
    this.add.rectangle(this.panelX, this.panelY, mWidth, mHeight).setStrokeStyle(4, 0xecf0f1).setOrigin(0.5);

    this.add.text(this.panelX, this.panelY - 210, "Bag", { font: 'bold 36px Arial', fill: '#ecf0f1' }).setOrigin(0.5);
    this.notifText = this.add.text(this.panelX, this.panelY + 180, "", { font: '20px Arial', fill: '#e74c3c' }).setOrigin(0.5);
    this.add.text(this.panelX, this.panelY + 220, "Press ESC to return", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

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
    
    // In our architecture ITEMS is defined in items.js, but since ES modules don't allow synchronous 
    // imports perfectly inside class bodies without top level, we will dynamically fetch it using the system 
    // or just assume we have access to it via a system call. We'll use shopSystem to get all items to map data.
    import('../systems/shopSystem.js').then(({ shopSystem }) => {
        const itemDatabase = shopSystem.getShopInventory(); // Gets all items as an array
        
        let yPos = this.panelY - 120;
        let itemsRendered = 0;

        itemDatabase.forEach((itemDef) => {
            const quantity = inventory[itemDef.id] || 0;
            if (quantity <= 0) return; // Only show owned items

            const rowBg = this.add.rectangle(this.panelX, yPos, 600, 60, 0x34495e).setOrigin(0.5);
            this.itemsContainer.add(rowBg);
            
            this.itemsContainer.add(this.add.text(this.panelX - 280, yPos, itemDef.name, { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0, 0.5));
            this.itemsContainer.add(this.add.text(this.panelX - 280 + 200, yPos, itemDef.description, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0, 0.5));
            this.itemsContainer.add(this.add.text(this.panelX + 200, yPos, `x${quantity}`, { font: 'bold 24px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5));

            if (itemDef.type === 'healing') {
               const useBtn = this.add.rectangle(this.panelX + 250, yPos, 80, 40, 0x27ae60).setInteractive({ useHandCursor: true });
               const useLbl = this.add.text(this.panelX + 250, yPos, 'USE', { font: 'bold 18px Arial', fill: '#ffffff' }).setOrigin(0.5);
               useBtn.on('pointerdown', () => this.handleUseItem(itemDef, quantity));
               this.itemsContainer.add([useBtn, useLbl]);
            } else {
               const passiveLbl = this.add.text(this.panelX + 250, yPos, 'BATTLE', { font: 'bold 16px Arial', fill: '#95a5a6' }).setOrigin(0.5);
               this.itemsContainer.add(passiveLbl);
            }
            
            yPos += 80;
            itemsRendered++;
        });

        if (itemsRendered === 0) {
            this.add.text(this.panelX, this.panelY, "Your bag is empty.", { font: '24px Arial', fill: '#95a5a6', fontStyle: 'italic' }).setOrigin(0.5);
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
