import Phaser from 'phaser';

/**
 * PartyScene
 * Displays the current party.
 */
export class PartyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PartyScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const padding = 40;

    // Background
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);
    this.add.text(width / 2, padding, 'Player Party', { font: 'bold 32px Arial', fill: '#ffffff' }).setOrigin(0.5);

    const party = this.registry.get('playerParty') || [];

    party.forEach((member, index) => {
      const yPos = 120 + (index * 120);
      
      this.add.rectangle(width / 2, yPos, width - 100, 100, 0x34495e).setOrigin(0.5);
      
      // Sprite placeholder (text for now because sprites might not be loaded if not main starters)
      this.add.text(padding + 50, yPos, member.name, { font: '28px Arial', fill: '#f1c40f' }).setOrigin(0, 0.5);
      
      // Level and EXP
      const expNeeded = member.level * 50;
      this.add.text(padding + 250, yPos - 20, `Lvl ${member.level}`, { font: '24px Arial', fill: '#ffffff' }).setOrigin(0, 0.5);
      this.add.text(padding + 250, yPos + 20, `EXP: ${member.exp || 0}/${expNeeded}`, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0, 0.5);

      // HP
      this.add.text(padding + 450, yPos, `HP: ${member.currentHp}/${member.maxHp}`, { font: '24px Arial', fill: '#2ecc71' }).setOrigin(0, 0.5);
    });

    if (party.length === 0) {
      this.add.text(width / 2, height / 2, 'Your party is empty.', { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5);
    }

    // Close text
    this.add.text(width / 2, height - padding, 'Press ESC to return', { font: '20px Arial', fill: '#95a5a6' }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('MenuScene');
    });
  }
}
