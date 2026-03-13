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
      // --- Quest Tracker ---
      this.createQuestTracker();

      this.events.on("updateQuests", () => {
        this.updateQuestTracker();
      });

      // --- Currency HUD ---
      this.createCurrencyHUD();

      this.registry.events.on("changedata-playerGold", () =>
        this.updateCurrencyHUD(),
      );
      this.registry.events.on("changedata-playerInventory", () =>
        this.updateCurrencyHUD(),
      );

      // Show/Hide tracker based on WorldScene state
      this.time.addEvent({
        delay: 200, // Faster update for better responsiveness
        callback: () => {
          const world = this.scene.manager.getScene("WorldScene");
          const menu = this.scene.manager.getScene("MenuScene");

          const isMenuActive = menu && menu.scene.isActive();
          const isDialogActive = world && world.isDialogueActive;
          const isEncounteractive = world && world.isEncounterTriggered;

          if (world && world.scene.isActive()) {
            this.questTracker.setVisible(
              !isDialogActive && !isEncounteractive && !isMenuActive,
            );
            this.currencyHUD.setVisible(
              !isDialogActive && !isEncounteractive && !isMenuActive,
            );
            this.updateQuestTracker();
            this.updateCurrencyHUD();
          } else {
            this.questTracker.setVisible(false);
            this.currencyHUD.setVisible(false);
          }
        },
        loop: true,
      });
    }

    this.events.on("shutdown", () => {
      this.mapNameText.setVisible(false);
      if (this.questTracker) this.questTracker.setVisible(false);
    });
  }

  createQuestTracker() {
    const { width } = this.cameras.main;
    this.questTracker = this.add.container(width - 20, 20);

    // 1. Stylish Glassmorphism Background (Graphics instead of Rectangle)
    this.questTrackerBg = this.add.graphics();

    // 2. Quest Title
    this.questTitleText = this.add
      .text(-15, 15, "퀘스트", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#f1c40f",
        align: "right",
        wordWrap: { width: 230 },
      })
      .setOrigin(1, 0);

    // 3. Quest Objectives
    this.questObjectivesText = this.add
      .text(-15, 50, "", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        align: "right",
        lineSpacing: 10,
        wordWrap: { width: 230 },
      })
      .setOrigin(1, 0);

    this.questTracker.add([
      this.questTrackerBg,
      this.questTitleText,
      this.questObjectivesText,
    ]);
    this.updateQuestTracker();
  }

  createCurrencyHUD() {
    const { width, height } = this.cameras.main;

    // Position: Bottom Right
    this.currencyHUD = this.add.container(width - 20, height - 20);

    // 1. Glassmorphism Background
    // Total width for Gold + Crystal boxes
    const bgWidth = 360;
    const bgHeight = 48;

    this.currencyBg = this.add.graphics();
    // Blur/Glass effect (Semi-transparent dark blue with a light border)
    this.currencyBg.fillStyle(0x011627, 0.7);
    this.currencyBg.fillRoundedRect(-bgWidth, -bgHeight, bgWidth, bgHeight, 12);
    this.currencyBg.lineStyle(2, 0x3498db, 0.8);
    this.currencyBg.strokeRoundedRect(
      -bgWidth,
      -bgHeight,
      bgWidth,
      bgHeight,
      12,
    );

    // 2. Gold Section (Left half of the HUD)
    const goldX = -bgWidth + 10;
    const centerY = -bgHeight / 2;

    // Gold Icon
    this.goldIcon = this.add
      .image(goldX + 15, centerY, "icon_22_09")
      .setScale(1.2);

    this.goldText = this.add
      .text(goldX + 35, centerY, "0", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#f1c40f",
      })
      .setOrigin(0, 0.5);

    // 3. Crystal Section (Right half of the HUD)
    const crystalX = -bgWidth / 2 + 10;

    // Crystal Icon
    this.crystalIcon = this.add
      .image(crystalX + 15, centerY, "icon_22_07")
      .setScale(1.2);

    this.crystalText = this.add
      .text(crystalX + 35, centerY, "0", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#3498db",
      })
      .setOrigin(0, 0.5);

    this.currencyHUD.add([
      this.currencyBg,
      this.goldIcon,
      this.goldText,
      this.crystalIcon,
      this.crystalText,
    ]);

    this.updateCurrencyHUD();
  }

  updateCurrencyHUD() {
    const gold = this.registry.get("playerGold") || 0;
    const inventory = this.registry.get("playerInventory") || {};
    const crystals = inventory["capture_crystal"] || 0;

    // Direct text update (can add animations later if needed)
    this.goldText.setText(gold.toLocaleString());
    this.crystalText.setText(crystals.toLocaleString());
  }

  updateQuestTracker() {
    const activeQuests = this.registry.get("activeQuests") || {};

    const firstQuest = Object.values(activeQuests).find(
      (q) => q && !q.completed,
    );

    if (!firstQuest) {
      this.questTitleText.setText("퀘스트 완료!");
      this.questTitleText.setColor("#2ecc71");
      this.questObjectivesText.setText("모든 주요 퀘스트를 완료했습니다.");
    } else {
      this.questTitleText.setText(`[${firstQuest.title}]`);
      this.questTitleText.setColor("#f1c40f");

      const objectives = (firstQuest.objectives || [])
        .map((o) => `${o.completed ? "✓" : "○"} ${o.text}`)
        .join("\n");

      this.questObjectivesText.setText(objectives);
    }

    // Dynamic Background Redraw
    const padding = 20;
    const trackerWidth = 260;
    const textHeight =
      this.questObjectivesText.y + this.questObjectivesText.height + padding;
    const trackerHeight = Math.max(100, textHeight);

    this.questTrackerBg.clear();
    // Glassmorphism effect: Semi-transparent dark blue with a border
    this.questTrackerBg.fillStyle(0x011627, 0.7);
    this.questTrackerBg.fillRoundedRect(
      -trackerWidth,
      0,
      trackerWidth,
      trackerHeight,
      16,
    );
    this.questTrackerBg.lineStyle(2, 0x3498db, 0.8);
    this.questTrackerBg.strokeRoundedRect(
      -trackerWidth,
      0,
      trackerWidth,
      trackerHeight,
      16,
    );
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
