import Phaser from 'phaser';

/**
 * NameScene
 * Handles player name input.
 */
export class NameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    // Prompt
    this.add.text(width / 2, height / 3, 'What is your name, Traveler?', {
      font: '32px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Current Name Display
    this.nameText = this.add.text(width / 2, height / 2, '', {
      font: 'bold 48px Arial',
      fill: '#f1c40f'
    }).setOrigin(0.5);

    // Cursor
    this.cursor = this.add.rectangle(width / 2 + 10, height / 2, 2, 40, 0xffffff).setOrigin(0, 0.5);
    this.tweens.add({
      targets: this.cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      loop: -1
    });

    // Keyboard Input
    this.input.keyboard.on('keydown', (event) => {
      if (event.keyCode === 8 && this.nameText.text.length > 0) {
        // Backspace
        this.nameText.text = this.nameText.text.slice(0, -1);
      } else if (event.keyCode === 13 && this.nameText.text.length > 0) {
        // Enter
        this.saveAndContinue();
      } else if (this.nameText.text.length < 12 && /^[a-zA-Z0-9 ]$/.test(event.key)) {
        // Alphanumeric
        this.nameText.text += event.key;
      }
      this.updateCursorPosition();
    });

    // OK Button
    const okButton = this.add.text(width / 2, height * 0.7, 'OK', {
      font: '32px Arial',
      fill: '#ffffff'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    okButton.on('pointerdown', () => {
      if (this.nameText.text.length > 0) {
        this.saveAndContinue();
      }
    });

    // Instructions
    this.add.text(width / 2, height - 50, 'Type your name and press Enter', {
      font: '16px Arial',
      fill: '#bdc3c7'
    }).setOrigin(0.5);

    this.updateCursorPosition();
  }

  updateCursorPosition() {
    const textWidth = this.nameText.width;
    this.cursor.x = this.cameras.main.width / 2 + textWidth / 2 + 5;
  }

  saveAndContinue() {
    const playerName = this.nameText.text || 'Hero';
    console.log(`Setting player name to: ${playerName}`);
    this.registry.set('playerName', playerName);
    this.scene.start('StarterSelectScene');
  }
}
