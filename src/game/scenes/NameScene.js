import Phaser from "phaser";

/**
 * NameScene
 * Handles player name input.
 */
export class NameScene extends Phaser.Scene {
  constructor() {
    super({ key: "NameScene" });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    // Prompt
    this.add
      .text(width / 2, height / 3, "당신의 이름은 무엇인가요, 여행자여?", {
        font: "32px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Current Name Display
    this.nameText = this.add
      .text(width / 2, height / 2, "", {
        font: "bold 48px Arial",
        fill: "#f1c40f",
      })
      .setOrigin(0.5);

    // Cursor
    this.cursor = this.add
      .rectangle(width / 2 + 10, height / 2, 2, 40, 0xffffff)
      .setOrigin(0, 0.5);
    this.tweens.add({
      targets: this.cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      loop: -1,
    });

    // Keyboard Input - Create a hidden HTML input for IME support
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.style.position = "absolute";
    inputElement.style.top = "-1000px"; // Hide it off-screen
    inputElement.maxLength = 12;
    document.body.appendChild(inputElement);

    const domElement = this.add.dom(0, 0, inputElement);
    
    // Focus the hidden input when the scene starts
    this.time.delayedCall(100, () => inputElement.focus());
    
    // Clicking anywhere on the screen refocuses the input
    this.input.on('pointerdown', () => inputElement.focus());

    inputElement.addEventListener("input", () => {
      this.nameText.setText(inputElement.value);
      this.updateCursorPosition();
    });

    inputElement.addEventListener("compositionend", () => {
      this.nameText.setText(inputElement.value);
      this.updateCursorPosition();
    });

    inputElement.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && inputElement.value.trim().length > 0) {
        inputElement.remove();
        this.saveAndContinue();
      }
    });

    this.events.on('shutdown', () => {
      inputElement.remove();
    });

    // OK Button
    const okButton = this.add
      .text(width / 2, height * 0.7, "확인", {
        font: "32px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    okButton.on("pointerdown", () => {
      if (this.nameText.text.length > 0) {
        this.saveAndContinue();
      }
    });

    // Instructions
    this.add
      .text(width / 2, height - 50, "이름을 입력하고 Enter를 누르세요", {
        font: "16px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5);

    this.updateCursorPosition();
  }

  updateCursorPosition() {
    const textWidth = this.nameText.width;
    this.cursor.x = this.cameras.main.width / 2 + textWidth / 2 + 5;
  }

  saveAndContinue() {
    // Note: inputElement.value is already reflected in this.nameText.text via the 'input' event listener
    const playerName = this.nameText.text.trim() || "여행자";
    console.log(`Setting player name to: ${playerName}`);
    this.registry.set("playerName", playerName);
    this.scene.start("WorldScene", { mapId: "starwhisk_village" });
  }
}
