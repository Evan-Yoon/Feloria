import Phaser from 'phaser';
import { saveSystem } from '../systems/saveSystem.js';

export class SaveLoadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SaveLoadScene' });
  }

  init(data) {
    // Mode can be 'save' or 'load'
    this.mode = data.mode || 'load';
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const mWidth = 760;
    const mHeight = 560;
    this.add.rectangle(width / 2, height / 2, mWidth, mHeight, 0x1a252f).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2, mWidth, mHeight).setStrokeStyle(4, 0x3498db).setOrigin(0.5);

    // Header
    const titleText = this.mode === 'save' ? 'SAVE GAME' : 'LOAD GAME';
    this.add.text(width / 2, height / 2 - 230, titleText, { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 250, "Press ESC to close", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

    // Notification Text
    this.notifText = this.add.text(width / 2, height / 2 + 180, "", { font: '24px Arial', fill: '#2ecc71' }).setOrigin(0.5);

    this.renderSlots(width, height);

    this.input.keyboard.on('keydown-ESC', () => {
      this.closeScene();
    });
  }

  renderSlots(width, height) {
    const saves = saveSystem.getAllSaves();
    const startY = height / 2 - 130;
    const spacing = 60;

    saves.forEach((saveObj) => {
        // In "Save" mode, hide Autosave slot (Slot 0) so the user doesn't overwrite it manually
        if (this.mode === 'save' && saveObj.slot === 0) return;

        // In "Load" mode, show Autosave as well as manual slots
        const drawIndex = this.mode === 'save' ? saveObj.slot - 1 : saveObj.slot; 
        const rowY = startY + (drawIndex * spacing);

        const rowBg = this.add.rectangle(width / 2, rowY, 660, 50, 0x2c3e50)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x34495e)
            .setOrigin(0.5);

        const slotName = saveObj.slot === 0 ? "Autosave" : `Slot ${saveObj.slot}`;
        this.add.text(width / 2 - 310, rowY, slotName, { font: 'bold 24px Arial', fill: '#f1c40f' }).setOrigin(0, 0.5);
        
        let labelColor = saveObj.exists ? '#ffffff' : '#7f8c8d';
        let dateString = "";
        
        if (saveObj.exists && saveObj.timestamp > 0) {
            const d = new Date(saveObj.timestamp);
            dateString = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        }

        this.add.text(width / 2 - 140, rowY, saveObj.label, { font: '20px Arial', fill: labelColor }).setOrigin(0, 0.5);
        this.add.text(width / 2 + 310, rowY, dateString, { font: '16px Arial', fill: '#bdc3c7' }).setOrigin(1, 0.5);

        // Hover Effects
        rowBg.on('pointerover', () => rowBg.setFillStyle(0xe74c3c));
        rowBg.on('pointerout', () => rowBg.setFillStyle(0x2c3e50));

        rowBg.on('pointerdown', () => {
            if (this.mode === 'save') {
                this.handleSave(saveObj.slot);
            } else {
                if (saveObj.exists) this.handleLoad(saveObj.slot);
                else {
                    this.cameras.main.shake(100, 0.005);
                }
            }
        });
    });
  }

  handleSave(slotNum) {
    const mapId = this.registry.get('world_mapId') || 'starwhisk_village';
    const spawnX = this.registry.get('world_spawnX') || 10;
    const spawnY = this.registry.get('world_spawnY') || 10;

    const success = saveSystem.saveData(this.registry, mapId, spawnX, spawnY, slotNum);
    
    if (success) {
        this.notifText.setText(`Saved to Slot ${slotNum}!`);
        this.notifText.setFill('#2ecc71');
        
        // Refresh UI
        this.time.delayedCall(1000, () => {
            this.scene.restart({ mode: 'save' });
        });
    } else {
        this.notifText.setText("Save failed.");
        this.notifText.setFill('#e74c3c');
    }
  }

  handleLoad(slotNum) {
    const sceneParams = saveSystem.loadData(this.registry, slotNum);
    if (sceneParams) {
        this.notifText.setText(`Loaded Slot ${slotNum}!`);
        this.notifText.setFill('#2ecc71');
        
        this.time.delayedCall(500, () => {
            // Stop whatever launched this overlay (StartScene, etc)
            this.scene.start("WorldScene", sceneParams);
        });
    } else {
        this.notifText.setText("Load failed.");
        this.notifText.setFill('#e74c3c');
    }
  }

  closeScene() {
      // Return to whichever scene paused/opened this
      if (this.mode === 'save') {
          this.scene.resume('MenuScene');
          this.scene.stop();
      } else {
          // If from StartScene, just stop itself, bringing StartScene back 
          // (assuming StartScene was kept active or paused, but since StartScene is non-interactive overlay we just stop)
          this.scene.resume('StartScene');
          this.scene.stop();
      }
  }
}
