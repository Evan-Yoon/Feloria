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

    const mWidth = 800;
    const mHeight = 580;
    const panelX = width / 2;
    const panelY = height / 2;

    const panelG = this.add.graphics();
    // Glassy background
    panelG.fillStyle(0x011627, 0.85);
    panelG.fillRoundedRect(panelX - mWidth / 2, panelY - mHeight / 2, mWidth, mHeight, 20);
    // Glowing border
    panelG.lineStyle(4, 0x3498db, 1);
    panelG.strokeRoundedRect(panelX - mWidth / 2, panelY - mHeight / 2, mWidth, mHeight, 20);

    // Header
    const titleText = this.mode === 'save' ? '게임 저장' : '게임 불러오기';
    this.add.text(width / 2, height / 2 - 245, titleText, { 
        font: 'bold 36px "Press Start 2P", Courier, monospace', fill: '#f1c40f',
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 250, "ESC를 눌러 닫기", { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

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

        const rowX = width / 2;
        const rowW = 700;
        const rowH = 55;

        const rowG = this.add.graphics();
        rowG.fillStyle(0x2c3e50, 0.6);
        rowG.fillRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
        rowG.lineStyle(2, 0x34495e, 1);
        rowG.strokeRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);

        const slotName = saveObj.slot === 0 ? "자동 저장" : `슬롯 ${saveObj.slot}`;
        this.add.text(width / 2 - 330, rowY, slotName, { font: 'bold 24px Arial', fill: '#f1c40f' }).setOrigin(0, 0.5);
        
        let labelColor = saveObj.exists ? '#ffffff' : '#7f8c8d';
        let dateString = "";
        
        if (saveObj.exists && saveObj.timestamp > 0) {
            const d = new Date(saveObj.timestamp);
            dateString = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        }

        this.add.text(width / 2 - 140, rowY, saveObj.label, { font: '20px Arial', fill: labelColor }).setOrigin(0, 0.5);
        this.add.text(width / 2 + 330, rowY, dateString, { font: '16px Arial', fill: '#bdc3c7' }).setOrigin(1, 0.5);

        // Hover Effects & Interactions
        const hitArea = this.add.rectangle(rowX, rowY, rowW, rowH, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            rowG.clear();
            rowG.fillStyle(0xe74c3c, 0.8);
            rowG.fillRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
            rowG.lineStyle(2, 0xffffff, 1);
            rowG.strokeRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
        });
        hitArea.on('pointerout', () => {
            rowG.clear();
            rowG.fillStyle(0x2c3e50, 0.6);
            rowG.fillRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
            rowG.lineStyle(2, 0x34495e, 1);
            rowG.strokeRoundedRect(rowX - rowW / 2, rowY - rowH / 2, rowW, rowH, 12);
        });

        hitArea.on('pointerdown', () => {
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
        this.notifText.setText(`슬롯 ${slotNum}에 저장되었습니다!`);
        this.notifText.setFill('#2ecc71');
        
        // Refresh UI
        this.time.delayedCall(1000, () => {
            this.scene.restart({ mode: 'save' });
        });
    } else {
        this.notifText.setText("저장 실패");
        this.notifText.setFill('#e74c3c');
    }
  }

  handleLoad(slotNum) {
    const sceneParams = saveSystem.loadData(this.registry, slotNum);
    if (sceneParams) {
        this.notifText.setText(`슬롯 ${slotNum}을 불러왔습니다!`);
        this.notifText.setFill('#2ecc71');
        
        this.time.delayedCall(500, () => {
            // Stop any potential background scenes to prevent visual bleeding
            if (this.scene.isActive("StartScene")) this.scene.stop("StartScene");
            if (this.scene.isActive("MenuScene")) this.scene.stop("MenuScene");
            
            // Start the world scene
            this.scene.start("WorldScene", sceneParams);
        });
    } else {
        this.notifText.setText("불러오기 실패");
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
