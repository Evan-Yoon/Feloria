import Phaser from 'phaser';
import { questSystem } from '../systems/questSystem.js';

export class QuestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestScene' });
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

    this.add.text(panelX, panelY - 230, '퀘스트', { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);

    // Find the currently active quest
    let questsObj = this.registry.get('activeQuests');
    if (!questsObj) {
        questSystem.getQuest(this.registry, 'first_steps'); // initialize
        questsObj = this.registry.get('activeQuests');
    }
    
    const questList = Object.values(questsObj);
    let currentQuest = questList.find(q => !q.completed);
    if (!currentQuest && questList.length > 0) {
        currentQuest = questList[questList.length - 1]; // Show last completed if all done
    }

    if (currentQuest) {
      this.add.text(panelX, panelY - 170, currentQuest.title, { font: 'bold 28px Arial', fill: currentQuest.completed ? '#2ecc71' : '#ffffff' }).setOrigin(0.5);
      this.add.text(panelX, panelY - 130, currentQuest.description, { font: '18px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

      let yPos = panelY - 60;
      currentQuest.objectives.forEach(obj => {
        const color = obj.completed ? '#2ecc71' : '#ffffff';
        const checkbox = obj.completed ? '[\u2713]' : '[ ]';
        
        const rowBg = this.add.rectangle(panelX, yPos, 600, 45, 0x2c3e50).setOrigin(0.5).setStrokeStyle(2, 0x34495e);
        this.add.text(panelX - 280, yPos, `${checkbox} ${obj.text}`, { font: '20px Arial', fill: color }).setOrigin(0, 0.5);
        yPos += 52;
      });
    }

    this.add.text(panelX, panelY + 250, 'ESC를 눌러 돌아가기', { font: '20px Arial', fill: '#95a5a6' }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('MenuScene');
    });
  }
}
