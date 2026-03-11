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
    this.nextScene = data.nextScene || "StartScene";
    this.sceneData = data.sceneData || {};
    this.currentMessageIndex = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Black background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Text Display
    this.textDisplay = this.add.text(width / 2, height / 2, "", {
      font: '32px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      align: "center",
      wordWrap: { width: width - 200 }
    }).setOrigin(0.5).setAlpha(0);

    // Continue Hint
    this.hintText = this.add.text(width - 50, height - 50, "진행하려면 클릭하세요", {
      font: '18px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#bdc3c7",
    }).setOrigin(1).setAlpha(0);

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

      // Fade out current
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
    this.textDisplay.setText(this.messages[this.currentMessageIndex]);
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
      targets: [this.textDisplay, this.hintText],
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.scene.start(this.nextScene, this.sceneData);
      }
    });
  }
}
