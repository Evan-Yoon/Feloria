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

    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);
    this.add.text(width / 2, padding, 'Codex', { font: 'bold 32px Arial', fill: '#ffffff' }).setOrigin(0.5);

    let yPos = 100;
    
    // Convert to array of entries
    const entries = Object.values(CREATURES);

    let seenCount = 0;
    let caughtCount = 0;

    entries.forEach((creature) => {
      const isSeen = codexSystem.hasSeen(this.registry, creature.id);
      const isCaught = codexSystem.hasCaught(this.registry, creature.id);

      if (isCaught) caughtCount++;
      if (isSeen) seenCount++;

      if (isSeen) {
        // Display full info
        this.add.text(padding, yPos, `${creature.name} (${creature.type})`, { font: 'bold 24px Arial', fill: isCaught ? '#2ecc71' : '#f1c40f' });
        this.add.text(padding, yPos + 30, `Habitat: ${creature.habitat}`, { font: '18px Arial', fill: '#bdc3c7' });
        this.add.text(padding, yPos + 55, creature.description, { font: '16px Arial', fill: '#ffffff' });
        
        if (isCaught) {
           this.add.text(width - padding - 100, yPos, 'CAUGHT', { font: '20px Arial', fill: '#2ecc71' });
        }
      } else {
        // Display unknown
        this.add.text(padding, yPos, '???', { font: 'bold 24px Arial', fill: '#7f8c8d' });
      }
      
      // Separator
      this.add.line(0, 0, padding, yPos + 85, width - padding, yPos + 85, 0x34495e).setOrigin(0);
      yPos += 100;
    });

    this.add.text(padding, height - padding, `Seen: ${seenCount} | Caught: ${caughtCount}`, { font: '20px Arial', fill: '#ffffff' }).setOrigin(0, 0.5);
    this.add.text(width / 2, height - padding, 'Press ESC to return', { font: '20px Arial', fill: '#95a5a6' }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('MenuScene');
    });
  }
}
