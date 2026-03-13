import Phaser from "phaser";
import { battleSystem } from "../systems/battleSystem.js";

/**
 * PartyScene
 * Interactive scene for managing the active Party (Max 3) and the Collection.
 */
export class PartyScene extends Phaser.Scene {
  constructor() {
    super({ key: "PartyScene" });
  }

  init(data) {
    data = data || {};
    this.isTargetMode = data.isTargetMode || false;
    this.itemId = data.itemId || null;
    this.itemEffect = data.itemEffect || 0;
    this.itemName = data.itemName || "";
    this.returnScene = data.returnScene || "MenuScene";
  }

  create() {
    const { width, height } = this.cameras.main;
    // Glassy background for the whole scene
    this.add.rectangle(0, 0, width, height, 0x011627, 0.95).setOrigin(0);

    this.party = this.registry.get("playerParty") || [];
    this.collection = this.registry.get("playerCollection") || [];

    // Ensure state integrity
    this.syncCollectionAndParty();

    this.createUI(width, height);
  }

  /**
   * Prevents desync bugs by ensuring all party members also exist as identical references in the collection.
   */
  syncCollectionAndParty() {
    this.party.forEach((pMember) => {
      const matchIndex = this.collection.findIndex(
        (c) => c.instanceId === pMember.instanceId,
      );
      if (matchIndex === -1) {
        this.collection.push(pMember);
      } else {
        this.collection[matchIndex] = pMember;
      }
    });
    this.saveState();
  }

  saveState() {
    this.registry.set("playerParty", this.party);
    this.registry.set("playerCollection", this.collection);
  }

  createUI(width, height) {
    if (this.mainContainer) this.mainContainer.destroy();

    this.mainContainer = this.add.container(0, 0);

    // Titles
    if (this.isTargetMode) {
      this.mainContainer.add(
        this.add
          .text(width / 2, 40, `${this.itemName}를 사용할 대상을 선택하세요`, {
            font: "bold 36px Arial",
            fill: "#f1c40f",
          })
          .setOrigin(0.5),
      );
    } else {
      this.mainContainer.add(
        this.add
          .text(width * 0.25, 40, `현재 파티 (${this.party.length}/3)`, {
            font: "bold 32px Arial",
            fill: "#f1c40f",
          })
          .setOrigin(0.5),
      );
      this.mainContainer.add(
        this.add
          .text(width * 0.75, 40, `보유 목록`, {
            font: "bold 32px Arial",
            fill: "#bdc3c7",
          })
          .setOrigin(0.5),
      );
    }

    this.mainContainer.add(
      this.add
        .text(width / 2, height - 30, "ESC를 눌러 돌아가기", {
          font: "20px Arial",
          fill: "#95a5a6",
        })
        .setOrigin(0.5),
    );

    // Render Party List
    this.party.forEach((member, index) => {
      const cardX = this.isTargetMode ? width / 2 : width * 0.25;
      const card = this.createCreatureCard(
        member,
        cardX,
        140 + index * 165,
        true,
        index === 0,
      );
      this.mainContainer.add(card);
    });

    // Render Collection List (Only if NOT in target mode)
    if (!this.isTargetMode) {
      // Only show creatures NOT currently in the party
      const partyIds = this.party.map((p) => p.instanceId);
      const benchedCreatures = this.collection.filter(
        (c) => !partyIds.includes(c.instanceId),
      );

      benchedCreatures.forEach((member, index) => {
        const card = this.createCreatureCard(
          member,
          width * 0.75,
          140 + index * 165,
          false,
          false,
        );
        this.mainContainer.add(card);
      });
    }

    this.setupInputs();

    this.events.on("resume", () => {
      this.setupInputs();
    });
  }

  setupInputs() {
    this.input.keyboard.off("keydown-ESC");
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.stop();
      this.scene.resume(this.returnScene);
    });
  }

  createCreatureCard(creature, x, y, isParty, isActive) {
    const card = this.add.container(x, y);
    const bgWidth = 540;
    const bgHeight = 150;

    const bgColor = isActive ? 0x27ae60 : isParty ? 0x2980b9 : 0x34495e;
    const borderColor = isActive ? 0x2ecc71 : 0x3498db;

    const cardG = this.add.graphics();
    // Glassy backing
    cardG.fillStyle(bgColor, 0.4);
    cardG.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);
    // Border
    cardG.lineStyle(2, borderColor, 0.8);
    cardG.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);
    card.add(cardG);

    // Creature Sprite
    const spriteKey = creature.id.toLowerCase();
    const creatureSprite = this.add
      .sprite(-bgWidth / 2 + 75, -20, spriteKey);
    
    // Unified Scaling (Normalization): Legendaries vs Others
    const targetSize = (creature.class === "전설") ? 140 : 110;
    const currentMax = Math.max(creatureSprite.width, creatureSprite.height);
    if (currentMax > 0) {
      creatureSprite.setScale(targetSize / currentMax);
    }

    // Details Text
    const nameText = this.add.text(-bgWidth / 2 + 75, 35, creature.name, {
      font: "bold 22px Arial",
      fill: "#ffffff",
    }).setOrigin(0.5, 0);

    const detailX = -bgWidth / 2 + 160;
    const lvlText = this.add.text(
      detailX,
      -55,
      `LEVEL ${creature.level}`,
      { font: "bold 22px Arial", fill: "#f1c40f" }
    );

    // --- HP Bar ---
    const barWidth = 180;
    const hpPercent = Math.max(0, creature.currentHp / creature.maxHp);
    
    this.add.text(detailX, -18, "HP", { font: "bold 14px Arial", fill: "#ff7979" }).setOrigin(0, 0.5);
    const hpBg = this.add.rectangle(detailX + 30, -18, barWidth, 12, 0x000000, 0.5).setOrigin(0, 0.5);
    const hpFill = this.add.rectangle(detailX + 30, -18, barWidth * hpPercent, 10, 0xff4757).setOrigin(0, 0.5);
    card.add([hpBg, hpFill]);

    const hpValueText = this.add.text(
      detailX + 30 + barWidth + 10,
      -18,
      `${creature.currentHp}/${creature.maxHp}`,
      { font: "bold 16px Arial", fill: "#ff7979" }
    ).setOrigin(0, 0.5);

    // --- EXP Bar ---
    const expNeeded = creature.level * 50;
    const expPercent = Math.min(1, creature.exp / expNeeded);

    this.add.text(detailX, 18, "XP", { font: "bold 14px Arial", fill: "#81ecec" }).setOrigin(0, 0.5);
    const expBg = this.add.rectangle(detailX + 30, 18, barWidth, 12, 0x000000, 0.5).setOrigin(0, 0.5);
    const expFill = this.add.rectangle(detailX + 30, 18, barWidth * expPercent, 10, 0x2ecc71).setOrigin(0, 0.5);
    card.add([expBg, expFill]);

    const expValueText = this.add.text(
      detailX + 30 + barWidth + 10,
      18,
      `${creature.exp}/${expNeeded}`,
      { font: "bold 16px Arial", fill: "#81ecec" }
    ).setOrigin(0, 0.5);

    // Action Buttons
    const btnContainer = this.add.container(bgWidth / 2 - 80, 0);

    if (this.isTargetMode) {
      if (isParty) {
        const useBtn = this.createButton(0, 0, "사용", 0x27ae60, () =>
          this.applyItem(creature),
        );
        btnContainer.add(useBtn);
      }
    } else {
      if (isParty) {
        if (!isActive) {
          const makeActiveBtn = this.createButton(
            0,
            -35,
            "대표 설정",
            0xf39c12,
            () => this.makeActive(creature),
          );
          btnContainer.add(makeActiveBtn);
        }
        if (this.party.length > 1) {
          const removeBtn = this.createButton(0, 35, "제외", 0xc0392b, () =>
            this.removeFromParty(creature),
          );
          btnContainer.add(removeBtn);
        }
      } else {
        if (this.party.length < 3) {
          const addBtn = this.createButton(0, 0, "참가", 0x27ae60, () =>
            this.addToParty(creature),
          );
          btnContainer.add(addBtn);
        }
      }
    }

    card.add([
      creatureSprite,
      nameText,
      lvlText,
      hpValueText,
      expValueText,
      btnContainer,
    ]);
    return card;
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);
    const bW = 120;
    const bH = 36;

    const btnG = this.add.graphics();
    btnG.fillStyle(color, 0.8);
    btnG.fillRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);
    btnG.lineStyle(2, 0xffffff, 0.8);
    btnG.strokeRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);

    const label = this.add
      .text(0, 0, text, { font: "bold 16px Arial", fill: "#ffffff" })
      .setOrigin(0.5);

    const hitArea = this.add.rectangle(0, 0, bW, bH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on("pointerdown", callback);
    hitArea.on("pointerover", () => {
      btnG.clear();
      btnG.fillStyle(color, 1);
      btnG.fillRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);
      btnG.lineStyle(2, 0xffffff, 1);
      btnG.strokeRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);
    });
    hitArea.on("pointerout", () => {
      btnG.clear();
      btnG.fillStyle(color, 0.8);
      btnG.fillRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);
      btnG.lineStyle(2, 0xffffff, 0.8);
      btnG.strokeRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);
    });

    container.add([btnG, label, hitArea]);
    return container;
  }

  makeActive(creature) {
    const idx = this.party.findIndex(
      (p) => p.instanceId === creature.instanceId,
    );
    if (idx > 0) {
      // Swap with index 0
      const temp = this.party[0];
      this.party[0] = this.party[idx];
      this.party[idx] = temp;

      this.saveState();
      this.createUI(this.cameras.main.width, this.cameras.main.height);
    }
  }

  removeFromParty(creature) {
    if (this.party.length <= 1) return; // Guard against 0 length party

    this.party = this.party.filter((p) => p.instanceId !== creature.instanceId);
    this.saveState();
    this.createUI(this.cameras.main.width, this.cameras.main.height);
  }

  addToParty(creature) {
    if (this.party.length >= 3) return; // Guard against overfilling

    // Avoid duplication
    if (!this.party.find((p) => p.instanceId === creature.instanceId)) {
      this.party.push(creature);
      this.saveState();
      this.createUI(this.cameras.main.width, this.cameras.main.height);
    }
  }

  applyItem(creature) {
    if (creature.currentHp >= creature.maxHp) {
      // Full HP, deny usage to save the item
      this.cameras.main.shake(100, 0.005);
      return;
    }

    // Double check inventory
    const inventory = this.registry.get("playerInventory") || {};
    if (!inventory[this.itemId] || inventory[this.itemId] <= 0) return;

    // Consume item
    inventory[this.itemId]--;
    this.registry.set("playerInventory", inventory);

    // Apply Healing
    creature.currentHp = Math.min(
      creature.maxHp,
      creature.currentHp + this.itemEffect,
    );

    // Save and Return cleanly
    this.saveState();
    this.cameras.main.flash(200, 150, 255, 150);

    this.time.delayedCall(300, () => {
      this.scene.stop();

      // Resume InventoryScene and tell it to wake up to refresh counts
      this.scene.resume(this.returnScene);
      const returnInstance = this.scene.get(this.returnScene);
      if (returnInstance && returnInstance.wake) {
        returnInstance.wake();
      }
    });
  }
}
