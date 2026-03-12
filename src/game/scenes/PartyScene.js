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
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

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
        120 + index * 130,
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
          120 + index * 130,
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
    const bgWidth = 520;
    const bgHeight = 120;

    const bgColor = isActive ? 0x27ae60 : isParty ? 0x2980b9 : 0x34495e;
    const bg = this.add
      .rectangle(0, 0, bgWidth, bgHeight, bgColor)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xecf0f1);

    // Creature Sprite
    const spriteKey = creature.id.toLowerCase();
    const creatureSprite = this.add
      .sprite(-bgWidth / 2 + 70, -20, spriteKey)
      .setScale(1.05);

    // Details Text
    const nameText = this.add.text(-bgWidth / 2 + 70, 25, creature.name, {
      font: "bold 22px Arial",
      fill: "#ffffff",
    }).setOrigin(0.5, 0);

    const detailX = -bgWidth / 2 + 150;
    const lvlText = this.add.text(
      detailX,
      -35,
      `레벨 ${creature.level}`,
      { font: "bold 24px Arial", fill: "#f1c40f" },
    );

    // HP Bar / Text
    const hpText = this.add.text(
      detailX,
      0,
      `HP: ${creature.currentHp}/${creature.maxHp}`,
      { font: "bold 22px Arial", fill: "#ff7979" },
    );

    // Exact EXP Text
    const expNeeded = creature.level * 50;
    const expText = this.add.text(
      detailX,
      30,
      `EXP: ${creature.exp}/${expNeeded}`,
      { font: "18px Arial", fill: "#81ecec" },
    );

    // Action Buttons
    const btnContainer = this.add.container(bgWidth / 2 - 90, 0);

    if (this.isTargetMode) {
      // In Target Mode, explicitly only show USE button for Party members
      if (isParty) {
        const useBtn = this.createButton(0, 0, "아이템 사용", 0x27ae60, () =>
          this.applyItem(creature),
        );
        btnContainer.add(useBtn);
      }
    } else {
      if (isParty) {
        if (!isActive) {
          // Make Active Button
          const makeActiveBtn = this.createButton(
            0,
            -25,
            "대표 설정",
            0xf39c12,
            () => this.makeActive(creature),
          );
          btnContainer.add(makeActiveBtn);
        }

        // Remove Button (Only if party > 1)
        if (this.party.length > 1) {
          const removeBtn = this.createButton(0, 25, "파티 제외", 0xc0392b, () =>
            this.removeFromParty(creature),
          );
          btnContainer.add(removeBtn);
        }
      } else {
        // Add to Party Button (Only if party < 3)
        if (this.party.length < 3) {
          const addBtn = this.createButton(0, 0, "파티 추가", 0x27ae60, () =>
            this.addToParty(creature),
          );
          btnContainer.add(addBtn);
        }
      }
    }

    card.add([
      bg,
      creatureSprite,
      nameText,
      lvlText,
      hpText,
      expText,
      btnContainer,
    ]);
    return card;
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, 140, 40, color)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff);
    const label = this.add
      .text(0, 0, text, { font: "bold 16px Arial", fill: "#ffffff" })
      .setOrigin(0.5);

    bg.on("pointerdown", callback);
    bg.on("pointerover", () => bg.setAlpha(0.8));
    bg.on("pointerout", () => bg.setAlpha(1));

    container.add([bg, label]);
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
