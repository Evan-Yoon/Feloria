import Phaser from 'phaser';
import { battleSystem } from '../systems/battleSystem.js';
import { questSystem } from '../systems/questSystem.js';

/**
 * StarterSelectScene
 * Displays the three starter cats and allows the player to choose one.
 */
export class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StarterSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const playerName = this.registry.get('playerName') || 'Trainer';

    // Background
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    // Header
    this.add.text(width / 2, 50, `Hello, ${playerName}!`, {
      font: '32px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 100, 'Choose your companion:', {
      font: '24px Arial',
      fill: '#ecf0f1'
    }).setOrigin(0.5);

    // Starters pool
    this.starters = [
      { id: 'leafkit', name: 'Leafkit', type: 'Forest', color: '#2ecc71', x: width * 0.25 },
      { id: 'emberpaw', name: 'Emberpaw', type: 'Fire', color: '#e74c3c', x: width * 0.5 },
      { id: 'misttail', name: 'Misttail', type: 'Water', color: '#34ace0', x: width * 0.75 }
    ];

    this.starters.forEach(s => this.createStarterOption(s));

    // Selection Details
    this.selectionDetail = this.add.text(width / 2, height * 0.8, '', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Confirm Button
    this.confirmButton = this.add.text(width / 2, height * 0.9, 'Confirm Selection', {
      font: '28px Arial',
      fill: '#27ae60',
      backgroundColor: '#ffffff',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setVisible(false);

    this.confirmButton.on('pointerdown', () => this.confirmStarter());
    
    this.selectedId = null;
  }

  createStarterOption(data) {
    const height = this.cameras.main.height;
    const container = this.add.container(data.x, height / 2);

    const sprite = this.add.sprite(0, -20, data.id).setScale(2);
    const label = this.add.text(0, 30, data.name, { font: 'bold 24px Arial', fill: data.color }).setOrigin(0.5);
    const typeLabel = this.add.text(0, 55, data.type, { font: '16px Arial', fill: '#ffffff' }).setOrigin(0.5);

    container.add([sprite, label, typeLabel]);

    const hitArea = this.add.rectangle(0, 0, 150, 200, 0xffffff, 0).setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => { sprite.setScale(2.5); label.setScale(1.1); });
    hitArea.on('pointerout', () => { if (this.selectedId !== data.id) { sprite.setScale(2); label.setScale(1); } });

    hitArea.on('pointerdown', () => {
      this.selectedId = data.id;
      this.selectionDetail.setText(`You have selected ${data.name}.`);
      this.confirmButton.setVisible(true);
      
      this.children.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.Container) child.setAlpha(0.6);
      });
      container.setAlpha(1);
    });
  }

  confirmStarter() {
    if (!this.selectedId) return;
    
    console.log(`Starter confirmed: ${this.selectedId}`);
    
    // Create initial party and collection
    const starterInstance = battleSystem.createInstance(this.selectedId.toUpperCase(), 5);
    
    this.registry.set('selectedStarter', this.selectedId);
    this.registry.set('playerParty', [starterInstance]);
    this.registry.set('playerCollection', [starterInstance]);

    questSystem.completeObjective(this.registry, 'first_steps', 'choose_starter');

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { mapId: 'starwhisk_village' });
    });
  }
}
