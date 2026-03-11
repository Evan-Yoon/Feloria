import Phaser from "phaser";

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

    // Background (simple dark gradient placeholder)
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    // Title
    this.add
      .text(width / 2, height / 3, "FELORIA", {
        font: "bold 64px Arial",
        fill: "#f1c40f",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 3 + 60, "A Cat-Mon Taming RPG", {
        font: "24px Arial",
        fill: "#ecf0f1",
      })
      .setOrigin(0.5);

    // Menu Options
    this.createMenuItem(width / 2, height * 0.6, "New Game", () => {
      this.scene.start("NameScene");
    });

    this.createMenuItem(width / 2, height * 0.7, "Continue", () => {
      console.log("Continue: Not implemented yet");
      // For now, treat it like New Game or show a message
    });

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
        font: "32px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    item.on("pointerover", () => item.setStyle({ fill: "#f39c12" }));
    item.on("pointerout", () => item.setStyle({ fill: "#ffffff" }));
    item.on("pointerdown", callback);

    return item;
  }
}
