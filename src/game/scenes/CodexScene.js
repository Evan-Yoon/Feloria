import Phaser from 'phaser';
import { CREATURES } from '../data/creatures.js';
import { codexSystem } from '../systems/codexSystem.js';

export class CodexScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CodexScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const padding = 40;

    // Elegant Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const mWidth = 760;
    const mHeight = 560;
    const panelX = width / 2;
    const panelY = height / 2;

    this.add.rectangle(panelX, panelY, mWidth, mHeight, 0x1a252f).setOrigin(0.5);
    this.add.rectangle(panelX, panelY, mWidth, mHeight).setStrokeStyle(4, 0x3498db).setOrigin(0.5);

    this.add.text(panelX - 120, panelY - 230, 'CODEX', { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);

    // Scrollable Container
    this.listContainer = this.add.container(panelX - mWidth/2, panelY - 180);
    
    // Mask logic to prevent overflow
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(panelX - mWidth/2 + 10, panelY - 180, mWidth - 20, mHeight - 110);
    const mask = maskShape.createGeometryMask();
    this.listContainer.setMask(mask);

    let yPos = 10;
    
    // Convert to array of entries
    const entries = Object.values(CREATURES);

    let seenCount = 0;
    let caughtCount = 0;

    entries.forEach((creature) => {
      const isSeen = codexSystem.hasSeen(this.registry, creature.id);
      const isCaught = codexSystem.hasCaught(this.registry, creature.id);

      if (isCaught) caughtCount++;
      if (isSeen) seenCount++;

      // Row background
      const rowBg = this.add.rectangle(mWidth/2, yPos + 50, mWidth - 60, 110, 0x2c3e50).setOrigin(0.5).setStrokeStyle(2, 0x34495e);
      this.listContainer.add(rowBg);

      if (isSeen) {
        // Creature Sprite (If caught draw full alpha, if seen draw silhouette or tint)
        const spriteKey = creature.id.toLowerCase();
        const creatureSprite = this.add.sprite(80, yPos + 50, spriteKey);
        if (!isCaught) creatureSprite.setTint(0x000000); // Silhouette if not caught
        this.listContainer.add(creatureSprite);

        // Display full info
        this.listContainer.add(this.add.text(140, yPos + 20, `${creature.name} (${creature.type})`, { font: 'bold 24px Arial', fill: isCaught ? '#2ecc71' : '#f1c40f' }).setOrigin(0, 0.5));
        this.listContainer.add(this.add.text(140, yPos + 45, `Habitat: ${creature.habitat || 'Unknown'}`, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0, 0.5));
        this.listContainer.add(this.add.text(140, yPos + 75, creature.description, { font: '16px Arial', fill: '#ffffff' }).setOrigin(0, 0.5));
        
        if (isCaught) {
           this.listContainer.add(this.add.text(580, yPos + 20, 'CAUGHT', { font: 'bold 20px Arial', fill: '#2ecc71' }).setOrigin(0.5));
           this.listContainer.add(this.add.text(580, yPos + 50, `HP: ${creature.baseHp} | ATK: ${creature.baseAttack} | DEF: ${creature.baseDefense}`, { font: '16px Arial', fill: '#ecf0f1' }).setOrigin(0.5));
        }
      } else {
        // Display unknown
        this.listContainer.add(this.add.text(mWidth/2, yPos + 50, '???', { font: 'bold 32px Arial', fill: '#7f8c8d' }).setOrigin(0.5));
      }
      
      yPos += 130;
    });

    this.maxScroll = -Math.max(0, yPos - (mHeight - 110));

    this.add.text(panelX + 160, panelY - 230, `Seen: ${seenCount} | Caught: ${caughtCount}`, { font: 'bold 24px Arial', fill: '#ffffff' }).setOrigin(0.5);
    this.add.text(panelX, panelY + 250, 'Scroll to view \u2022 Press ESC to return', { font: '20px Arial', fill: '#95a5a6' }).setOrigin(0.5);

    // Scroll Logic
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        this.listContainer.y -= deltaY;
        // Clamp
        const topLimit = panelY - 180;
        const bottomLimit = topLimit + this.maxScroll;
        
        if (this.listContainer.y > topLimit) this.listContainer.y = topLimit;
        if (this.listContainer.y < bottomLimit) this.listContainer.y = bottomLimit;
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('MenuScene');
    });
  }
}
