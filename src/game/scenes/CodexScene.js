import Phaser from "phaser";
import { CREATURES } from "../data/creatures.js";
import { codexSystem } from "../systems/codexSystem.js";
import { ASSETS } from "../config/assetPaths.js";
import { SKILLS } from "../data/skills.js";

/**
 * CodexScene
 * Displays discovered and captured creatures.
 */
export class CodexScene extends Phaser.Scene {
  constructor() {
    super({ key: "CodexScene" });
  }

  init() {
    this.creatureList = Object.values(CREATURES).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    this.selectedIndex = 0;
    this.filter = "ALL"; // ALL, SEEN, CAPTURED
    this.filteredList = [];
    this.itemsPerPage = 9; // Reduced to fit better
    this.scrollOffset = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);

    const mWidth = 1100;
    const mHeight = 620;
    this.panelX = width / 2;
    this.panelY = height / 2 + 30; // Shift down slightly

    this.panelBg = this.add
      .rectangle(this.panelX, this.panelY, mWidth, mHeight, 0x1a252f)
      .setOrigin(0.5);
    this.panelBorder = this.add
      .rectangle(this.panelX, this.panelY, mWidth, mHeight)
      .setStrokeStyle(4, 0x3498db)
      .setOrigin(0.5);

    this.add
      .text(this.panelX, this.panelY - 285, "몬스터 도감", {
        font: 'bold 36px "Press Start 2P", Courier, monospace',
        fill: "#f1c40f",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5);

    // Filter Buttons
    const filters = [
      { id: "ALL", text: "전체" },
      { id: "SEEN", text: "발견" },
      { id: "CAPTURED", text: "포획" },
    ];

    filters.forEach((f, i) => {
      const btn = this.add
        .rectangle(
          this.panelX - 450 + i * 120,
          this.panelY - 210,
          110,
          40,
          0x2c3e50,
        )
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x34495e);

      const txt = this.add
        .text(this.panelX - 450 + i * 120, this.panelY - 210, f.text, {
          font: "bold 18px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      btn.on("pointerdown", () => {
        if (this.filter !== f.id) {
          this.filter = f.id;
          this.selectedIndex = 0;
          this.scrollOffset = 0;
          this.refreshList();
        }
      });

      f.btn = btn; // Store ref to button for re-styling
    });
    this.filterButtons = filters;

    // List Panel (Left)
    this.listContainer = this.add.container(
      this.panelX - 350,
      this.panelY - 140, // Lowered to clear tabs
    );

    // Add Mask to List Container
    const maskRect = this.add.rectangle(
      this.panelX - 150, // Center of the 400px wide list (x - 350 + 200)
      this.panelY + 50,  // Center of the 450px high area
      450, // Width (slightly wider than 400 to accommodate highlights)
      405, // Height (9 items * 45px)
      0x000000,
      0
    ).setVisible(false);

    const mask = maskRect.createGeometryMask();
    this.listContainer.setMask(mask);

    // Detail Panel (Right)
    this.detailContainer = this.add.container(this.panelX + 200, this.panelY);

    this.refreshList();
    this.setupInputs();

    this.add
      .text(
        this.panelX,
        this.panelY + 285,
        "방향키/마우스 휠: 이동 | ENTER: 상세 정보 | ESC: 종료",
        {
          font: "18px Arial",
          fill: "#bdc3c7",
        },
      )
      .setOrigin(0.5);

    // Mouse Wheel Support
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) this.scrollDown();
      else if (deltaY < 0) this.scrollUp();
    });
  }

  setupInputs() {
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.stop();
      if (this.scene.isActive("MenuScene")) {
        this.scene.resume("MenuScene");
      } else {
        this.scene.resume("WorldScene");
      }
    });

    this.input.keyboard.on("keydown-UP", () => this.scrollUp());
    this.input.keyboard.on("keydown-DOWN", () => this.scrollDown());
  }

  scrollUp() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      if (this.selectedIndex < this.scrollOffset) {
        this.scrollOffset--;
      }
      this.refreshList();
    }
  }

  scrollDown() {
    if (this.selectedIndex < this.filteredList.length - 1) {
      this.selectedIndex++;
      if (this.selectedIndex >= this.scrollOffset + this.itemsPerPage) {
        this.scrollOffset++;
      }
      this.refreshList();
    }
  }

  refreshList() {
    this.filterButtons.forEach((f) => {
      if (f.id === this.filter) f.btn.setStrokeStyle(4, 0xf1c40f);
      else f.btn.setStrokeStyle(2, 0x34495e);
    });

    this.filteredList = this.creatureList.filter((c) => {
      if (this.filter === "ALL") return true;
      if (this.filter === "SEEN")
        return codexSystem.hasSeen(this.registry, c.id);
      if (this.filter === "CAPTURED")
        return codexSystem.hasCaught(this.registry, c.id);
      return true;
    });

    if (this.selectedIndex >= this.filteredList.length) {
      this.selectedIndex = Math.max(0, this.filteredList.length - 1);
    }

    this.renderList();
    this.renderDetails();
  }

  renderList() {
    this.listContainer.removeAll(true);

    const displayList = this.filteredList.slice(
      this.scrollOffset,
      this.scrollOffset + this.itemsPerPage,
    );

    displayList.forEach((c, i) => {
      const idx = this.scrollOffset + i;
      const isSelected = idx === this.selectedIndex;
      const hasSeen = codexSystem.hasSeen(this.registry, c.id);
      const hasCaught = codexSystem.hasCaught(this.registry, c.id);

      const y = i * 45;

      const bg = this.add
        .rectangle(0, y, 400, 40, isSelected ? 0x34495e : 0x2c3e50)
        .setOrigin(0, 0.5);
      if (isSelected) bg.setStrokeStyle(2, 0xf1c40f);

      const statusIcon = hasCaught ? "💎" : hasSeen ? "👁️" : "❓";
      const nameText = hasSeen ? c.name : "?????";

      const txt = this.add
        .text(10, y, `${statusIcon} ${nameText}`, {
          font: isSelected ? "bold 20px Arial" : "20px Arial",
          fill: isSelected ? "#ffffff" : "#bdc3c7",
        })
        .setOrigin(0, 0.5);

      this.listContainer.add([bg, txt]);
    });

    // Scroll Indicator & Buttons
    if (this.filteredList.length > this.itemsPerPage) {
      const scrollY = -20;
      const scrollHeight = this.itemsPerPage * 45 - 20;

      const scrollBarBg = this.add
        .rectangle(410, scrollY, 15, scrollHeight, 0x1a252f)
        .setOrigin(0, 0);
      const handleSize =
        (this.itemsPerPage / this.filteredList.length) * scrollHeight;
      const handleY =
        scrollY + (this.scrollOffset / this.filteredList.length) * scrollHeight;
      const handle = this.add
        .rectangle(410, handleY, 15, handleSize, 0x3498db)
        .setOrigin(0, 0);

      // Up/Down Buttons
      const upBtn = this.add
        .rectangle(417.5, scrollY - 20, 30, 30, 0x34495e)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(417.5, scrollY - 20, "▲", { font: "16px Arial", fill: "#ffffff" })
        .setOrigin(0.5);
      upBtn.on("pointerdown", () => this.scrollUp());

      const downBtn = this.add
        .rectangle(417.5, scrollY + scrollHeight + 20, 30, 30, 0x34495e)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(417.5, scrollY + scrollHeight + 20, "▼", {
          font: "16px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5);
      downBtn.on("pointerdown", () => this.scrollDown());

      this.listContainer.add([scrollBarBg, handle, upBtn, downBtn]);
    }
  }

  renderDetails() {
    this.detailContainer.removeAll(true);

    const creature = this.filteredList[this.selectedIndex];
    if (!creature) return;

    const hasSeen = codexSystem.hasSeen(this.registry, creature.id);
    const hasCaught = codexSystem.hasCaught(this.registry, creature.id);

    // Sprite
    let sprite;
    if (hasSeen) {
      sprite = this.add
        .image(0, -100, creature.spriteKey || "creature_leafkit")
        .setScale(hasCaught ? 1.5 : 1.5);
      if (!hasCaught) sprite.setTint(0x000000).setAlpha(0.6); // Silhouette
    } else {
      sprite = this.add
        .image(0, -100, "creature_leafkit")
        .setScale(1.5)
        .setTint(0x000000)
        .setAlpha(0.6);
    }
    this.detailContainer.add(sprite);

    // Info
    const name = hasSeen ? creature.name : "?????";
    const type = hasCaught ? creature.type : "?????";
    const cls = hasCaught ? creature.class : "?????";
    const desc = hasCaught
      ? creature.description
      : "데이터 없음 (포획 후 확인 가능)";

    const nameTxt = this.add
      .text(0, 50, name, { font: "bold 32px Arial", fill: "#f1c40f" })
      .setOrigin(0.5);
    const typeTxt = this.add
      .text(0, 90, `타입: ${type} | 등급: ${cls}`, {
        font: "20px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    const descTxt = this.add
      .text(0, 140, desc, {
        font: "18px Arial",
        fill: "#ecf0f1",
        align: "center",
        wordWrap: { width: 450 },
      })
      .setOrigin(0.5);

    this.detailContainer.add([nameTxt, typeTxt, descTxt]);

    // Skills
    if (hasCaught) {
      this.add
        .text(0, 200, "보유 기술", { font: "bold 22px Arial", fill: "#3498db" })
        .setOrigin(0.5);
      let sy = 235;
      (creature.skills || []).forEach((sid) => {
        const skill = SKILLS[sid] || { name: sid };
        const sTxt = this.add
          .text(0, sy, `• ${skill.name}`, {
            font: "18px Arial",
            fill: "#bdc3c7",
          })
          .setOrigin(0.5);
        this.detailContainer.add(sTxt);
        sy += 25;
      });
    }
  }
}
