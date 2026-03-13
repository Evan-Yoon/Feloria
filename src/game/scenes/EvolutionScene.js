import Phaser from "phaser";

import { saveSystem } from "../systems/saveSystem.js";

export class EvolutionScene extends Phaser.Scene {
  constructor() {
    super({ key: "EvolutionScene" });
  }

  init(data) {
    // Expected to receive old creature ID, new creature ID, and a callback
    this.oldCreatureId = data.oldId;
    this.newCreatureId = data.newId;
    this.creatureName = data.name || this.oldCreatureId;
    this.newName = data.newName || this.newCreatureId;
    this.onCompleteCallback = data.onComplete;
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Background (Dark)
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);

    // Initial Text
    this.headerText = this.add
      .text(cx, height * 0.2, "어라? " + this.creatureName + "의 상태가...!", {
        font: 'bold 36px "Malgun Gothic", Arial',
        fill: "#ffffff",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Old Sprite
    if (this.oldCreatureId) {
      this.oldSprite = this.add
        .sprite(cx, cy, this.oldCreatureId.toLowerCase())
        .setScale(4);
    } else {
      this.oldSprite = this.add.sprite(cx, cy, "player").setScale(4);
    }

    // New Sprite (Hidden initially)
    if (this.newCreatureId) {
      this.newSprite = this.add
        .sprite(cx, cy, this.newCreatureId.toLowerCase())
        .setScale(4)
        .setAlpha(0);
      this.newSprite.setTintFill(0xffffff); // Start as white silhouette
    }

    // Light Glow Effect
    this.glow = this.add
      .circle(cx, cy, 10, 0xffffff, 0)
      .setBlendMode(Phaser.BlendModes.ADD);

    // Start Sequence
    this.time.delayedCall(500, () => this.startSequence());

    // Allow Skip
    this.input.on("pointerdown", () => this.endSequence());
  }

  startSequence() {
    // 1. Fade in text
    this.tweens.add({
      targets: this.headerText,
      alpha: 1,
      duration: 1000,
    });

    // 2. Start glowing pulses
    this.glowTween = this.tweens.add({
      targets: this.glow,
      radius: 300,
      alpha: { from: 0.8, to: 0 },
      duration: 800,
      repeat: 3,
      yoyo: true,
      ease: "Sine.easeInOut",
    });

    // 3. Silhouette transition
    this.oldSprite.setTintFill(0xffffff); // Turn old pure white

    this.time.delayedCall(1500, () => {
      // Fast flashing between old and new silhouette
      this.tweens.add({
        targets: this.oldSprite,
        scale: { from: 4, to: 5 },
        alpha: 0,
        duration: 1000,
        ease: "Expo.easeIn",
      });

      this.tweens.add({
        targets: this.newSprite,
        alpha: 1,
        scale: { from: 3.5, to: 4 },
        duration: 1000,
        ease: "Expo.easeOut",
        onComplete: () => {
          this.revealNewCreature();
        },
      });
    });
  }

  revealNewCreature() {
    // Play Evolution ME
    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playME("me_evolution", { duckBGM: true });
    });

    // Huge flash
    this.cameras.main.flash(800, 255, 255, 255);

    // Remove Tint (reveal colors)
    this.newSprite.clearTint();

    // Bobbing animation
    this.tweens.add({
      targets: this.newSprite,
      y: this.newSprite.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Change Text
    this.headerText.setText(
      "축하합니다! 당신의 " +
        this.creatureName +
        "가 " +
        this.newName +
        "(으)로 진화했습니다!",
    );

    this.hintText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.85,
        "- 계속하려면 클릭 -",
        {
          font: "20px Arial",
          fill: "#bdc3c7",
        },
      )
      .setOrigin(0.5);

    this.isComplete = true;
  }

  endSequence() {
    if (this.isExiting) return;

    // If skipping early, force the end state if we haven't reached it
    if (!this.isComplete) {
      if (this.glowTween) this.glowTween.stop();
      this.cameras.main.flash(200, 255, 255, 255);
      this.oldSprite.setAlpha(0);
      this.newSprite.setAlpha(1);
      this.newSprite.clearTint();
      this.headerText.setText(
        "축하합니다! 당신의 " +
          this.creatureName +
          "가 " +
          this.newName +
          "(으)로 진화했습니다!",
      );
      this.headerText.setAlpha(1);
      this.isComplete = true;
      return; // Wait for one more click to actually exit
    }

    this.isExiting = true;

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback(); // Handled by caller to resume or change scenes
      } else {
        // Failsafe exit
        this.scene.stop();
      }
    });
  }
}
