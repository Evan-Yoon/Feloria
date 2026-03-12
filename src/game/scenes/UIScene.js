import Phaser from "phaser";

/**
 * UIScene
 * An overlay scene dedicated to rendering UI elements that should be
 * completely immune to the WorldScene camera's zoom and jitter.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    // Hidden by default
    this.mapNameText = this.add
      .text(10, 10, "", {
        fontFamily: '"Press Start 2P", Courier, monospace',
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 0,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0, 0);

    // Listens for Map Names
    const worldScene = this.scene.manager.getScene("WorldScene");
    if (worldScene) {
      worldScene.events.on("displayMapName", (mapName) => {
        this.mapNameText.setText(mapName);
        this.mapNameText.setVisible(true);
      });

      worldScene.events.on("hideMapName", () => {
        this.mapNameText.setVisible(false);
      });

      // --- Notification System ---
      this.notificationQueue = [];
      this.isShowingNotification = false;

      worldScene.events.on("notifyItem", (data) => {
        this.queueNotification(data);
      });
    }

    this.events.on("shutdown", () => {
      this.mapNameText.setVisible(false);
    });
  }

  queueNotification(data) {
    this.notificationQueue.push(data);
    if (!this.isShowingNotification) {
      this.processNotificationQueue();
    }
  }

  processNotificationQueue() {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }

    this.isShowingNotification = true;
    const { message, color } = this.notificationQueue.shift();
    const { width, height } = this.cameras.main;

    const container = this.add.container(width / 2, height + 50);

    const bg = this.add
      .rectangle(0, 0, 400, 60, 0x000000, 0.8)
      .setStrokeStyle(2, color || 0xf1c40f);

    const text = this.add
      .text(0, 0, message, {
        font: 'bold 20px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([bg, text]);

    // Animate In, Wait, Animate Out
    this.tweens.chain({
      targets: container,
      tweens: [
        { y: height - 100, duration: 400, ease: "Power2" },
        { y: height - 110, duration: 2000 }, // Wait period
        {
          y: height + 50,
          duration: 400,
          ease: "Power2",
          onComplete: () => {
            container.destroy();
            this.processNotificationQueue();
          },
        },
      ],
    });
  }

  update() {
    // Ensure text drops if the world scene gets paused heavily
    const worldScene = this.scene.manager.getScene("WorldScene");
    if (!worldScene || !this.scene.isActive("WorldScene")) {
      this.mapNameText.setVisible(false);
    } else {
      this.mapNameText.setVisible(true);
    }
  }
}
