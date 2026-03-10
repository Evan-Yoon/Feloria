import Phaser from 'phaser';

/**
 * DialogScene
 * An overlay scene that displays dialogue text boxes.
 */
export class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DialogScene' });
  }

  init(data) {
    this.dialogue = data.dialogue;
    this.currentPage = 0;
    this.onComplete = data.onComplete;
  }

  create() {
    const { width, height } = this.cameras.main;
    const padding = 20;
    const boxHeight = 150;
    
    // UI Box (Gray with white border)
    const box = this.add.container(padding, height - boxHeight - padding);
    
    const bg = this.add.rectangle(0, 0, width - padding * 2, boxHeight, 0x000000, 0.9)
      .setOrigin(0)
      .setStrokeStyle(4, 0xffffff);
    
    // Speaker Name Box
    const nameBg = this.add.rectangle(0, -30, 200, 30, 0x000000, 0.9)
      .setOrigin(0)
      .setStrokeStyle(2, 0xffffff);
    
    this.speakerName = this.add.text(10, -25, this.dialogue.name, {
      font: 'bold 18px Arial',
      fill: '#f1c40f'
    });

    // Content Text
    this.contentText = this.add.text(20, 20, '', {
      font: '20px Arial',
      fill: '#ffffff',
      wordWrap: { width: width - padding * 4 }
    });

    // Continue Hint
    this.hintText = this.add.text(width - padding * 3, boxHeight - 30, 'Press Space', {
      font: 'italic 14px Arial',
      fill: '#bdc3c7'
    }).setOrigin(1, 0);

    box.add([bg, nameBg, this.speakerName, this.contentText, this.hintText]);

    // Show first page
    this.displayPage();

    // Input to progress
    this.input.keyboard.on('keydown-SPACE', () => this.nextPage());
    this.input.keyboard.on('keydown-ENTER', () => this.nextPage());
  }

  displayPage() {
    this.contentText.setText(this.dialogue.pages[this.currentPage]);
  }

  nextPage() {
    this.currentPage++;
    if (this.currentPage < this.dialogue.pages.length) {
      this.displayPage();
    } else {
      this.finish();
    }
  }

  finish() {
    if (this.onComplete) this.onComplete();
    this.scene.stop();
  }
}
