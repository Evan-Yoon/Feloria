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

    const mWidth = 1040;
    const mHeight = 600;
    this.panelX = width / 2;
    this.panelY = height / 2;

    const panelG = this.add.graphics();
    // Glassy background
    panelG.fillStyle(0x011627, 0.85);
    panelG.fillRoundedRect(this.panelX - mWidth / 2, this.panelY - mHeight / 2, mWidth, mHeight, 20);
    // Glowing border
    panelG.lineStyle(4, 0x3498db, 1);
    panelG.strokeRoundedRect(this.panelX - mWidth / 2, this.panelY - mHeight / 2, mWidth, mHeight, 20);

    this.add.text(this.panelX, this.panelY - 250, "가방", { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);
    
    this.notifText = this.add.text(this.panelX, this.panelY + 220, "", { font: 'bold 20px Arial', fill: '#e74c3c' }).setOrigin(0.5);
    this.add.text(this.panelX, this.panelY + 270, "ESC를 눌러 돌아가기", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

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
    
    // Import ITEMS directly for comprehensive rendering
    import('../data/items.js').then(({ ITEMS }) => {
        const itemDatabase = Object.values(ITEMS);
        
        let yPos = this.panelY - 120;
        let itemsRendered = 0;

        itemDatabase.forEach((itemDef) => {
            const quantity = inventory[itemDef.id] || 0;
            if (quantity <= 0) return; // Only show owned items

            const rowX = this.panelX;
            const rowY = yPos;
            const rowW = 940;
            const rowH = 65;

            const rowG = this.add.graphics();
            rowG.fillStyle(0x2c3e50, 0.6);
            rowG.fillRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
            rowG.lineStyle(2, 0x34495e, 1);
            rowG.strokeRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
            this.itemsContainer.add(rowG);
            
            // Icon
            if (itemDef.spriteKey) {
                const icon = this.add.image(this.panelX - 440, yPos, itemDef.spriteKey).setScale(1.5);
                this.itemsContainer.add(icon);
            } else {
                const iconBg = this.add.rectangle(this.panelX - 440, yPos, 40, 40, 0x34495e).setOrigin(0.5);
                this.itemsContainer.add(iconBg);
            }

            this.itemsContainer.add(this.add.text(this.panelX - 390, yPos, itemDef.name, { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0, 0.5));
            this.itemsContainer.add(this.add.text(this.panelX - 180, yPos, itemDef.description, { 
                font: '18px Arial', 
                fill: '#bdc3c7',
                wordWrap: { width: 450 }
            }).setOrigin(0, 0.5));
            this.itemsContainer.add(this.add.text(this.panelX + 320, yPos, `x${quantity}`, { font: 'bold 24px Arial', fill: '#f1c40f' }).setOrigin(1, 0.5));

            if (itemDef.type === 'healing') {
               // Use a rounded button style here too
               const btnX = this.panelX + 410;
               const btnY = yPos;
               const btnW = 90;
               const btnH = 40;

               const useBtnG = this.add.graphics();
               useBtnG.fillStyle(0x27ae60, 0.8);
               useBtnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
               useBtnG.lineStyle(2, 0xffffff, 0.9);
               useBtnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
               this.itemsContainer.add(useBtnG);

               const useLbl = this.add.text(btnX, btnY, '사용', { font: 'bold 18px Arial', fill: '#ffffff' }).setOrigin(0.5);
               this.itemsContainer.add(useLbl);

               const hitArea = this.add.rectangle(btnX, btnY, btnW, btnH, 0x000000, 0).setInteractive({ useHandCursor: true });
               
               hitArea.on('pointerover', () => {
                 useBtnG.clear();
                 useBtnG.fillStyle(0x2ecc71, 0.9);
                 useBtnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
                 useBtnG.lineStyle(2, 0xffffff, 1);
                 useBtnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
               });
               hitArea.on('pointerout', () => {
                 useBtnG.clear();
                 useBtnG.fillStyle(0x27ae60, 0.8);
                 useBtnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
                 useBtnG.lineStyle(2, 0xffffff, 0.9);
                 useBtnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
               });
               hitArea.on('pointerdown', () => this.handleUseItem(itemDef, quantity));
               this.itemsContainer.add(hitArea);
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
          // Emit notification
          const worldScene = this.scene.manager.getScene('WorldScene');
          if (worldScene) {
              worldScene.events.emit('notifyItem', { 
                  message: `${itemDef.name} x1 사용됨`,
                  color: 0xe67e22 
              });
          }

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
