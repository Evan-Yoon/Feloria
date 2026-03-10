import Phaser from 'phaser';
import { questSystem } from '../systems/questSystem.js';

export class QuestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const padding = 40;

    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);
    this.add.text(width / 2, padding, 'Quests', { font: 'bold 32px Arial', fill: '#ffffff' }).setOrigin(0.5);

    const firstSteps = questSystem.getQuest(this.registry, 'first_steps');

    if (firstSteps) {
      this.add.text(width / 2, 120, firstSteps.title, { font: 'bold 28px Arial', fill: firstSteps.completed ? '#2ecc71' : '#f1c40f' }).setOrigin(0.5);
      this.add.text(width / 2, 160, firstSteps.description, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

      let yPos = 220;
      firstSteps.objectives.forEach(obj => {
        const color = obj.completed ? '#2ecc71' : '#ffffff';
        const checkbox = obj.completed ? '[X]' : '[ ]';
        this.add.text(width / 2 - 150, yPos, `${checkbox} ${obj.text}`, { font: '22px Arial', fill: color }).setOrigin(0, 0.5);
        yPos += 40;
      });
    }

    this.add.text(width / 2, height - padding, 'Press ESC to return', { font: '20px Arial', fill: '#95a5a6' }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('MenuScene');
    });
  }
}
