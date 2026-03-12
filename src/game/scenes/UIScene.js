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

      // Show/Hide tracker based on WorldScene state
      this.time.addEvent({
        delay: 500,
        callback: () => {
          const world = this.scene.manager.getScene("WorldScene");
          if (world && world.scene.isActive()) {
            this.questTracker.setVisible(!world.isDialogueActive && !world.isEncounterTriggered);
            this.updateQuestTracker();
          } else {
            this.questTracker.setVisible(false);
          }
        },
        loop: true
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
    
    this.questTrackerBg = this.add.rectangle(0, 0, 250, 200, 0x000000, 0.4)
      .setOrigin(1, 0);
    
    this.questTitleText = this.add.text(-10, 10, "퀘스트", {
      fontFamily: '"Press Start 2P", Courier, monospace',
      fontSize: "14px",
      color: "#f1c40f",
      align: "right",
      wordWrap: { width: 230 }
    }).setOrigin(1, 0);

    this.questObjectivesText = this.add.text(-10, 40, "", {
      fontFamily: 'Arial',
      fontSize: "16px",
      color: "#ffffff",
      align: "right",
      lineSpacing: 10,
      wordWrap: { width: 230 }
    }).setOrigin(1, 0);

    this.questTracker.add([this.questTrackerBg, this.questTitleText, this.questObjectivesText]);
    this.updateQuestTracker();
  }

  updateQuestTracker() {
    const activeQuests = this.registry.get('activeQuests');
    if (!activeQuests) {
      if (this.questTracker) this.questTracker.setVisible(false);
      return;
    }

    const firstQuest = Object.values(activeQuests).find(q => !q.completed);
    if (!firstQuest) {
      this.questTitleText.setText("퀘스트 완료!");
      this.questObjectivesText.setText("모든 주요 퀘스트를 완료했습니다.");
      return;
    }

    this.questTitleText.setText(`[${firstQuest.title}]`);
    
    const objectives = firstQuest.objectives
      .map(o => `${o.completed ? '✓' : '○'} ${o.text}`)
      .join('\n');
    
    this.questObjectivesText.setText(objectives);

    const textHeight = this.questObjectivesText.y + this.questObjectivesText.height + 10;
    this.questTrackerBg.height = Math.max(100, textHeight);
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
