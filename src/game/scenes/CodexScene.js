import Phaser from "phaser";
import { CREATURES } from "../data/creatures.js";
import { codexSystem } from "../systems/codexSystem.js";
import { ASSETS } from "../config/assetPaths.js";
import { SKILLS } from "../data/skills.js";

/**
 * CodexScene
 * Displays discovered and captured creatures in a Grid + Detail layout.
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

    // Grid settings
    this.cols = 6;
    this.rows = 5;
    this.itemsPerPage = this.cols * this.rows; // 30 items
    this.scrollRowOffset = 0; // Tracks which row is at the top
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);

    const mWidth = 1200;
    const mHeight = 660;
    this.panelX = width / 2;
    this.panelY = height / 2 + 15;

    // Main Panel Background
    this.panelBg = this.add
      .rectangle(this.panelX, this.panelY, mWidth, mHeight, 0x1a252f)
      .setOrigin(0.5);
    this.panelBorder = this.add
      .rectangle(this.panelX, this.panelY, mWidth, mHeight)
      .setStrokeStyle(4, 0x3498db)
      .setOrigin(0.5);

    // Title
    this.add
      .text(this.panelX, this.panelY - 305, "몬스터 도감", {
        font: 'bold 36px "Press Start 2P", Courier, monospace',
        fill: "#f1c40f",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5);

    // Filter Buttons (Moved slightly to fit the new layout)
    const filters = [
      { id: "ALL", text: "전체" },
      { id: "SEEN", text: "발견" },
      { id: "CAPTURED", text: "포획" },
    ];

    filters.forEach((f, i) => {
      const btn = this.add
        .rectangle(
          this.panelX - 450 + i * 120,
          this.panelY - 230,
          110,
          40,
          0x2c3e50,
        )
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x34495e);

      const txt = this.add
        .text(this.panelX - 450 + i * 120, this.panelY - 230, f.text, {
          font: "bold 18px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      btn.on("pointerdown", () => {
        if (this.filter !== f.id) {
          this.filter = f.id;
          this.selectedIndex = 0;
          this.scrollRowOffset = 0;
          this.refreshList();
        }
      });

      f.btn = btn;
    });
    this.filterButtons = filters;

    // --- Layout Containers ---
    // Detail Panel (Left)
    this.detailContainer = this.add.container(this.panelX - 250, this.panelY);

    // Grid Panel (Right)
    this.gridContainer = this.add.container(
      this.panelX + 100,
      this.panelY - 160,
    );

    this.refreshList();
    this.setupInputs();

    // Footer Text
    this.add
      .text(
        this.panelX,
        this.panelY + 305,
        "방향키/마우스 휠: 이동 | ENTER: 상세 정보 | ESC: 종료",
        {
          font: "18px Arial",
          fill: "#bdc3c7",
        },
      )
      .setOrigin(0.5);

    // Mouse Wheel Support
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0)
        this.moveSelection(this.cols); // Move down one row
      else if (deltaY < 0) this.moveSelection(-this.cols); // Move up one row
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

    this.input.keyboard.on("keydown-UP", () => this.moveSelection(-this.cols));
    this.input.keyboard.on("keydown-DOWN", () => this.moveSelection(this.cols));
    this.input.keyboard.on("keydown-LEFT", () => this.moveSelection(-1));
    this.input.keyboard.on("keydown-RIGHT", () => this.moveSelection(1));
  }

  moveSelection(amount) {
    const newIndex = this.selectedIndex + amount;

    if (newIndex >= 0 && newIndex < this.filteredList.length) {
      this.selectedIndex = newIndex;

      // Auto-scroll logic
      const currentRow = Math.floor(this.selectedIndex / this.cols);
      if (currentRow < this.scrollRowOffset) {
        this.scrollRowOffset = currentRow; // Scroll up
      } else if (currentRow >= this.scrollRowOffset + this.rows) {
        this.scrollRowOffset = currentRow - this.rows + 1; // Scroll down
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

    this.renderGrid();
    this.renderDetails();
  }

  renderGrid() {
    this.gridContainer.removeAll(true);

    const cellSize = 65;
    const padding = 10;
    const startIdx = this.scrollRowOffset * this.cols;
    const endIdx = Math.min(
      startIdx + this.itemsPerPage,
      this.filteredList.length,
    );

    // Draw grid background
    const gridBgWidth = this.cols * (cellSize + padding) + padding;
    const gridBgHeight = this.rows * (cellSize + padding) + padding;
    const gridBg = this.add
      .rectangle(-padding, -padding, gridBgWidth, gridBgHeight, 0x27ae60, 0.3)
      .setOrigin(0);
    this.gridContainer.add(gridBg);

    for (let i = startIdx; i < endIdx; i++) {
      const c = this.filteredList[i];
      const hasCaught = codexSystem.hasCaught(this.registry, c.id);

      // Calculate local x, y for the grid
      const localIdx = i - startIdx;
      const col = localIdx % this.cols;
      const row = Math.floor(localIdx / this.cols);

      const x = col * (cellSize + padding) + cellSize / 2;
      const y = row * (cellSize + padding) + cellSize / 2;

      // Cell Background
      const isSelected = i === this.selectedIndex;
      const cellBg = this.add.rectangle(
        x,
        y,
        cellSize,
        cellSize,
        0x2ecc71,
        0.5,
      );
      if (isSelected) {
        cellBg.setStrokeStyle(4, 0xf1c40f);
      } else {
        cellBg.setStrokeStyle(2, 0x27ae60);
      }
      this.gridContainer.add(cellBg);

      // Icon logic: Show sprite if caught, else show '?'
      if (hasCaught) {
        const sprite = this.add.image(x, y, c.spriteKey || "creature_leafkit");

        // Scale down sprite to fit the cell
        const maxDim = Math.max(sprite.width, sprite.height);
        if (maxDim > cellSize - 10) {
          sprite.setScale((cellSize - 10) / maxDim);
        }
        this.gridContainer.add(sprite);
      } else {
        const questionMark = this.add
          .text(x, y, "?", {
            font: "bold 32px Arial",
            fill: "#ffffff",
          })
          .setOrigin(0.5);
        this.gridContainer.add(questionMark);
      }
    }
  }

  renderDetails() {
    this.detailContainer.removeAll(true);

    const creature = this.filteredList[this.selectedIndex];
    if (!creature) return;

    const hasCaught = codexSystem.hasCaught(this.registry, creature.id);

    // Draw Left Panel Background
    const detailBg = this.add
      .rectangle(0, -10, 350, 540, 0x34495e)
      .setOrigin(0.5);
    detailBg.setStrokeStyle(4, 0x2980b9);
    this.detailContainer.add(detailBg);

    // Sprite (Silhouette if not caught)
    const sprite = this.add
      .image(0, -120, creature.spriteKey || "creature_leafkit")
      .setScale(2);
    if (!hasCaught) {
      sprite.setTint(0x000000); // Black silhouette
      sprite.setAlpha(0.8);
    }
    this.detailContainer.add(sprite);

    // Info
    const name = hasCaught ? creature.name : "?????";
    const type = hasCaught ? creature.type : "?????";
    const cls = hasCaught ? creature.class : "?????";
    const desc = hasCaught
      ? creature.description
      : "포획하지 않은 몬스터입니다.\n야생에서 찾아보세요.";

    const nameTxt = this.add
      .text(0, 30, name, { font: "bold 32px Arial", fill: "#f1c40f" })
      .setOrigin(0.5);
    const typeTxt = this.add
      .text(0, 75, `타입: ${type} | 등급: ${cls}`, {
        font: "20px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    const descTxt = this.add
      .text(0, 130, desc, {
        font: "18px Arial",
        fill: "#ecf0f1",
        align: "center",
        wordWrap: { width: 300 },
      })
      .setOrigin(0.5);

    this.detailContainer.add([nameTxt, typeTxt, descTxt]);

    // Skills
    if (hasCaught) {
      this.add
        .text(0, 185, "- 보유 기술 -", {
          font: "bold 20px Arial",
          fill: "#3498db",
        })
        .setOrigin(0.5);
      let sy = 215;
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
