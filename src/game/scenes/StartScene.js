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

    // Background Image
    const background = this.add.image(width / 2, height / 2, 'bg_title_screen');
    const scale = Math.max(width / background.width, height / background.height);
    background.setScale(scale);

    // Dimming overlay for readability (initially transparent)
    this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0).setAlpha(0);

    // Initial Press Start Text
    this.pressStartText = this.add.text(width / 2, height * 0.7, "화면을 클릭하여 시작", {
      font: 'bold 36px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
    }).setOrigin(0.5);

    // Add a pulsing effect to the press start text
    this.tweens.add({
      targets: this.pressStartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      loop: -1
    });

    // Menu Container (initially hidden)
    this.menuContainer = this.add.container(0, 0).setAlpha(0).setVisible(false);

    // Menu Options (inside container)
    const newGameBtn = this.createMenuItem(width / 2, height * 0.6, "새 게임", () => {
      this.scene.start("CutsceneScene", {
        messages: [
          "펠로리아 대륙.",
          "아주 오래전, 이 대륙에는 세계의 균형을 지키는 존재들이 있었다.",
          "사람들은 그들을 '고대 고양이'라 불렀다.",
          "하지만 지금… 숲의 기운이 뒤틀리기 시작했다.",
          "그리고 그 힘을 노리는 누군가가 움직이고 있다."
        ],
        images: [
          "bg_continent",
          "bg_ancient_cats",
          "bg_ancient_cats",
          "bg_twisted_forest",
          "bg_shadow"
        ],
        nextScene: "NameScene"
      });
    });

    // Check if Save Data Exists
    const saves = saveSystem.getAllSaves();
    const hasSave = saves.some(s => s.exists);

    const continueBtn = this.createMenuItem(width / 2, height * 0.7, "이어하기", () => {
      if (hasSave) {
        this.scene.pause();
        this.scene.launch("SaveLoadScene", { mode: 'load' });
      } else {
        this.cameras.main.shake(100, 0.005);
      }
    });

    if (!hasSave) {
      continueBtn.setAlpha(0.5);
      continueBtn.removeInteractive();
    }

    this.menuContainer.add([newGameBtn, continueBtn]);

    // Click anywhere to show menu
    this.input.once("pointerdown", () => {
      this.pressStartText.setVisible(false);
      this.menuContainer.setVisible(true);

      // Darken screen and show menu
      this.tweens.add({
        targets: [this.menuContainer, this.overlay],
        alpha: { from: 0, to: (t) => t === this.menuContainer ? 1 : 0.4 },
        duration: 500
      });
    });

    // Instructions
    this.instructions = this.add
      .text(width / 2, height - 50, "마우스를 사용하여 선택", {
        font: "16px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5)
      .setAlpha(0); // Also hide instructions initially

    this.menuContainer.add(this.instructions);
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
