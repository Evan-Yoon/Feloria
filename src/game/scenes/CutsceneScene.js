import Phaser from "phaser";

/**
 * CutsceneScene
 * A generic scene overlay for displaying sequential narration text.
 */
export class CutsceneScene extends Phaser.Scene {
  constructor() {
    super({ key: "CutsceneScene" });
  }

  init(data) {
    this.messages = data.messages || [];
    this.images = data.images || [];
    this.nextScene = data.nextScene || "StartScene";
    this.sceneData = data.sceneData || {};
    this.currentMessageIndex = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Base black background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Background Image
    this.background = this.add.image(width / 2, height / 2, "").setOrigin(0.5).setAlpha(0);

    // Dimming overlay for readability
    this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0).setAlpha(0);

    // Text Display - Increased font size and added shadow/stroke for readability
    this.textDisplay = this.add.text(width / 2, height / 2, "", {
      font: 'bold 48px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      align: "center",
      wordWrap: { width: width - 200 },
      shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, fill: true },
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    // Continue Hint
    this.hintText = this.add.text(width - 50, height - 50, "진행하려면 클릭하세요", {
      font: '24px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1).setAlpha(0);

    // Skip Button
    this.skipButton = this.add.text(width - 50, 50, "건너뛰기 [Skip]", {
      font: 'bold 24px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.skipButton.on("pointerover", () => this.skipButton.setStyle({ fill: "#f1c40f" }));
    this.skipButton.on("pointerout", () => this.skipButton.setStyle({ fill: "#ffffff" }));
    this.skipButton.on("pointerdown", () => {
      if (!this.isFading) {
        this.finishCutscene();
      }
    });

    // Start Sequence
    this.time.delayedCall(500, () => this.showNextMessage());

    // Input to skip/advance
    this.input.on("pointerdown", () => {
      if (!this.isFading) {
        this.showNextMessage();
      }
    });
  }

  showNextMessage() {
    if (this.currentMessageIndex < this.messages.length) {
      this.isFading = true;
      this.hintText.setAlpha(0);

      // Fade out current text
      if (this.currentMessageIndex > 0) {
        this.tweens.add({
          targets: this.textDisplay,
          alpha: 0,
          duration: 1000,
          onComplete: () => this.fadeInNewMessage()
        });
      } else {
        this.fadeInNewMessage();
      }
    } else {
      // Done with all messages
      this.finishCutscene();
    }
  }

  fadeInNewMessage() {
    const currentMsg = this.messages[this.currentMessageIndex];
    const currentImg = this.images[this.currentMessageIndex];

    // Update Background if provided and different
    if (currentImg && this.background.texture.key !== currentImg) {
      this.background.setTexture(currentImg);

      // Scale to fill
      const { width, height } = this.cameras.main;
      const scale = Math.max(width / this.background.width, height / this.background.height);
      this.background.setScale(scale);

      // Fade background in if not already visible
      if (this.background.alpha < 1) {
        this.tweens.add({
          targets: [this.background, this.overlay],
          alpha: { from: 0, to: (t) => t === this.background ? 1 : 0.4 },
          duration: 1000
        });
      }
    }

    this.textDisplay.setText(currentMsg);
    this.currentMessageIndex++;

    this.tweens.add({
      targets: this.textDisplay,
      alpha: 1,
      duration: 1500,
      onComplete: () => {
        this.isFading = false;
        // Show hint text after a couple seconds if they haven't clicked
        this.tweens.add({
          targets: this.hintText,
          alpha: 1,
          duration: 500,
          delay: 1000
        });
      }
    });
  }

  finishCutscene() {
    this.isFading = true;
    this.tweens.add({
      targets: [this.textDisplay, this.hintText, this.background, this.overlay],
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        this.scene.start(this.nextScene, this.sceneData);
      }
    });
  }
}
