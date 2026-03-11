import Phaser from "phaser";
import { ASSETS } from "../config/assetPaths.js";

/**
 * DialogScene
 * An overlay scene that displays dialogue text boxes.
 */
export class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: "DialogScene" });
  }

  init(data) {
    this.dialogue = data.dialogue;
    // Filter out special tags like [SHOP_PROMPT] from display
    this.displayPages = this.dialogue.pages.filter((p) => !p.startsWith("["));
    this.currentPage = 0;
    this.faceKey = this.dialogue.faceKey || null;
    this.faceIndex = this.dialogue.faceIndex || 0;
    this.onComplete = data.onComplete;
  }

  create() {
    const { width, height } = this.cameras.main;
    const padding = 20;
    const boxHeight = 240; // Increased to fit 144x144 face + name comfortably

    // UI Box (Gray with white border)
    const box = this.add.container(padding, height - boxHeight - padding);

    const bg = this.add
      .rectangle(0, 0, width - padding * 2, boxHeight, 0x000000, 0.9)
      .setOrigin(0)
      .setStrokeStyle(4, 0xffffff);
    box.add(bg);

    // Speaker Name Box (Small header style)
    const nameText = this.dialogue.name || "???";
    this.speakerName = this.add.text(20, 15, nameText, {
      font: 'bold 24px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#f1c40f",
    });

    // Portrait (Below Name)
    const facePadding = 20;
    const portraitY = 55; // Below name
    const faceSize = 120; // Consistent size

    console.log(`DialogScene: faceKey=${this.faceKey}, exists=${this.textures.exists(this.faceKey)}`);
    if (this.faceKey && this.textures.exists(this.faceKey)) {
      // Faces are 4x2 sheets in RPG Maker (total 8 faces). Each face is 144x144.
      this.faceSprite = this.add.sprite(
        facePadding,
        portraitY,
        this.faceKey,
        this.faceIndex
      )
      this.faceSprite.setOrigin(0, 0);
      // Removed setDisplaySize to keep pixel perfect 144x144 native size
      box.add(this.faceSprite);
    } else {
      console.warn(`DialogScene: Portrait texture '${this.faceKey}' not found!`);
    }

    // Content Text (Adjusted for 144x144 portrait)
    const textX = this.faceSprite ? facePadding + 144 + 25 : 30;
    const textY = 60;
    const textWidth = width - (padding * 2) - textX - 40;

    this.contentText = this.add.text(textX, textY, "", {
      font: 'bold 32px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      wordWrap: { width: textWidth },
      lineSpacing: 10,
    });

    // Continue Hint
    this.hintText = this.add
      .text(width - padding * 3, boxHeight - 25, "Space를 눌러 계속", {
        font: "italic 16px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(1, 1);

    box.add([this.speakerName, this.contentText, this.hintText]);

    // Show first page
    this.displayPage();

    // Input to progress
    this.input.keyboard.on("keydown-SPACE", () => this.nextPage());
    this.input.keyboard.on("keydown-ENTER", () => this.nextPage());
  }

  displayPage() {
    const rawText = this.displayPages[this.currentPage];
    const playerName = this.registry.get("playerName") || "Hero";
    const formattedText = rawText.replace(/{playerName}/g, playerName);
    this.contentText.setText(formattedText);
  }

  nextPage() {
    this.currentPage++;
    if (this.currentPage < this.displayPages.length) {
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
