import Phaser from 'phaser';

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
    const playerName = this.registry.get('playerName');

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

    // Starters
    this.createStarterOption(width * 0.25, height / 2, 'Leafkit', 'Forest Type', '#2ecc71', 'leafkit');
    this.createStarterOption(width * 0.5, height / 2, 'Emberpaw', 'Fire Type', '#e74c3c', 'emberpaw');
    this.createStarterOption(width * 0.75, height / 2, 'Misttail', 'Water Type', '#34ace0', 'misttail');

    // Selection Details (hidden until selection)
    this.selectionDetail = this.add.text(width / 2, height * 0.8, '', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Confirm Button (hidden until selection)
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
  }

  createStarterOption(x, y, name, type, color, textureKey) {
    const container = this.add.container(x, y);

    // Sprite placeholder
    const sprite = this.add.sprite(0, -20, textureKey).setScale(2);
    
    // Label
    const label = this.add.text(0, 30, name, {
      font: 'bold 24px Arial',
      fill: color
    }).setOrigin(0.5);

    const typeLabel = this.add.text(0, 55, type, {
      font: '16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    container.add([sprite, label, typeLabel]);

    // Interactivity
    const hitArea = this.add.rectangle(0, 0, 150, 200, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      sprite.setScale(2.5);
      label.setScale(1.1);
    });

    hitArea.on('pointerout', () => {
      sprite.setScale(2);
      label.setScale(1);
    });

    hitArea.on('pointerdown', () => {
      this.selectedStarter = name;
      this.selectionDetail.setText(`You have selected ${name}.`);
      this.confirmButton.setVisible(true);
      
      // Highlight selected
      this.children.list.forEach(child => {
        if (child instanceof Phaser.GameObjects.Container) {
          child.setAlpha(0.6);
        }
      });
      container.setAlpha(1);
    });
  }

  confirmStarter() {
    console.log(`Starter confirmed: ${this.selectedStarter}`);
    this.registry.set('selectedStarter', this.selectedStarter);
    
    // Move to WorldScene (placeholder for now)
    this.scene.start('WorldScene');
  }
}
