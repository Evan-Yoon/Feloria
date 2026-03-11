import Phaser from "phaser";
import { saveSystem } from "../systems/saveSystem.js";

/**
 * StartScene
 * The main menu of the game.
 */
export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a252f).setOrigin(0);

    // Title
    this.add.text(width / 2, height / 3 - 40, "FELORIA", {
        font: 'bold 72px "Press Start 2P", Courier, monospace',
        fill: "#f1c40f",
        shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true }
      })
      .setOrigin(0.5);

    this.add.text(width / 2, height / 3 + 40, "A Cat-Mon Taming RPG", {
        font: "italic 28px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5);

    // Menu Options
    this.createMenuItem(width / 2, height * 0.6, "New Game", () => {
      this.scene.start("CutsceneScene", {
        messages: [
          "펠로리아 대륙.",
          "아주 오래전, 이 대륙에는 세계의 균형을 지키는 존재들이 있었다.",
          "사람들은 그들을 '고대 고양이'라 불렀다.",
          "하지만 지금… 숲의 기운이 뒤틀리기 시작했다.",
          "그리고 그 힘을 노리는 누군가가 움직이고 있다."
        ],
        nextScene: "NameScene"
      });
    });

    // Check if Save Data Exists
    const saves = saveSystem.getAllSaves();
    const hasSave = saves.some(s => s.exists);

    const continueBtn = this.createMenuItem(width / 2, height * 0.7, "Continue", () => {
      if (hasSave) {
        this.scene.pause();
        this.scene.launch("SaveLoadScene", { mode: 'load' });
      } else {
        // Simple flicker feedback if empty
        this.cameras.main.shake(100, 0.005);
      }
    });

    if (!hasSave) {
      continueBtn.setAlpha(0.5);
      continueBtn.removeInteractive();
    }

    // Instructions
    this.add
      .text(width / 2, height - 50, "Use Mouse to select", {
        font: "16px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5);
  }

  createMenuItem(x, y, text, callback) {
    const item = this.add
      .text(x, y, text, {
        font: "bold 32px Arial",
        fill: "#ffffff",
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    item.on("pointerover", () => item.setStyle({ fill: "#e74c3c" }));
    item.on("pointerout", () => item.setStyle({ fill: "#ffffff" }));
    item.on("pointerdown", callback);

    return item;
  }
}
