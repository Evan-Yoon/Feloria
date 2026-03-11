import { battleSystem } from "../systems/battleSystem.js";
import { codexSystem } from "../systems/codexSystem.js";
import { saveSystem } from "../systems/saveSystem.js";
import { questSystem } from '../systems/questSystem.js';
import { TRAINERS } from '../data/trainers.js';
import { NPCS } from '../data/npcs.js';
import { cutsceneSystem } from '../systems/cutsceneSystem.js';
import { SKILLS } from '../data/skills.js';
import { skillEffectSystem } from '../systems/skillEffectSystem.js';
import { legendarySystem } from '../systems/legendarySystem.js';
/**
 * BattleScene
 * Handles the turn-based combat, capture logic, and results.
 */
export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  init(data) {
    // 1. Get player data from Registry (with fallback for HMR testing)
    this.playerParty = this.registry.get("playerParty") || [];
    this.playerCat = this.playerParty[0];
    if (!this.playerCat) {
      console.warn(
        "BattleScene: No player party found, using fallback Leafkit.",
      );
      this.playerCat = battleSystem.createInstance("LEAFKIT", 5);
      this.registry.set("playerParty", [this.playerCat]);
    }

    // 2. Generate enemy (Wild vs Trainer)
    this.isTrainer = data.isTrainer || false;
    this.trainerId = data.trainerId || null;
    this.enemyParty = [];

    if (this.isTrainer && this.trainerId) {
      const trainerData = TRAINERS[this.trainerId];
      trainerData.party.forEach((member) => {
        this.enemyParty.push(
          battleSystem.createInstance(member.creatureId, member.level),
        );
      });
      this.enemyCat = this.enemyParty[0];
      console.log(`BattleScene: Trainer ${trainerData.name} wants to battle!`);
    } else {
      const enemyId =
        data.enemyId && typeof data.enemyId === "string"
          ? data.enemyId
          : "SNAGPUSS";
      this.enemyCat = battleSystem.createInstance(
        enemyId,
        data.enemyLevel || 2,
      );
      this.enemyParty.push(this.enemyCat);

      if (!this.enemyCat) {
        console.warn(
          `BattleScene: Failed to load enemy ${enemyId}, falling back to Snagpuss.`,
        );
        this.enemyCat = battleSystem.createInstance("SNAGPUSS", 2);
        this.enemyParty.push(this.enemyCat);
      }
    }

    // 3. Mark Codex and Quests (For active enemy)
    codexSystem.markSeen(this.registry, this.enemyCat.id);
    if (!this.isTrainer)
      questSystem.completeObjective(
        this.registry,
        "first_steps",
        "trigger_encounter",
      );

    // 4. Battle State
    this.isPlayerTurn = true;
    this.isBattleOver = false;
    this.canInput = true;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0);

    // --- UI SETUP ---
    this.createBattleUI(width, height);

    // --- INITIAL LOG ---
    this.updateLog(`A wild ${this.enemyCat.name} appeared!`);
  }

  createBattleUI(width, height) {
    // 1. Player UI (Bottom Right)
    this.playerUI = this.add.container(width * 0.7, height * 0.55);
    // Draw the generated placeholder sprite
    this.playerSprite = this.add
      .sprite(0, -100, this.playerCat.id.toLowerCase())
      .setScale(3);

    // UI Panel for Player
    this.playerBg = this.add
      .rectangle(0, 40, 300, 100, 0x1a252f)
      .setStrokeStyle(3, 0x3498db)
      .setOrigin(0.5);
    this.playerName = this.add
      .text(0, 10, `${this.playerCat.name} Lvl ${this.playerCat.level}`, {
        font: "bold 22px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.playerHpText = this.add
      .text(0, 40, `HP: ${this.playerCat.currentHp}/${this.playerCat.maxHp}`, {
        font: "bold 18px Arial",
        fill: "#2ecc71",
      })
      .setOrigin(0.5);

    // Player HP Bar
    this.playerHpBg = this.add
      .rectangle(0, 70, 260, 15, 0x000000)
      .setOrigin(0.5);
    this.playerHpBar = this.add
      .rectangle(-130, 62.5, 260, 15, 0x27ae60)
      .setOrigin(0);

    this.playerUI.add([
      this.playerSprite,
      this.playerBg,
      this.playerName,
      this.playerHpText,
      this.playerHpBg,
      this.playerHpBar,
    ]);

    // 2. Enemy UI (Top Left)
    this.enemyUI = this.add.container(width * 0.3, height * 0.25);
    this.enemySprite = this.add
      .sprite(0, 0, this.enemyCat.id.toLowerCase())
      .setScale(3);

    this.enemyBg = this.add
      .rectangle(0, 120, 300, 100, 0x1a252f)
      .setStrokeStyle(3, 0xe74c3c)
      .setOrigin(0.5);
    this.enemyName = this.add
      .text(0, 90, `${this.enemyCat.name} Lvl ${this.enemyCat.level}`, {
        font: "bold 22px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    this.enemyHpText = this.add
      .text(0, 120, `HP: ${this.enemyCat.currentHp}/${this.enemyCat.maxHp}`, {
        font: "bold 18px Arial",
        fill: "#e74c3c",
      })
      .setOrigin(0.5);

    // Enemy HP Bar
    this.enemyHpBg = this.add
      .rectangle(0, 150, 260, 15, 0x000000)
      .setOrigin(0.5);
    this.enemyHpBar = this.add
      .rectangle(-130, 142.5, 260, 15, 0xc0392b)
      .setOrigin(0);

    this.enemyUI.add([
      this.enemySprite,
      this.enemyBg,
      this.enemyName,
      this.enemyHpText,
      this.enemyHpBg,
      this.enemyHpBar,
    ]);

    // 3. Battle Log (Bottom)
    this.logBg = this.add
      .rectangle(0, height - 140, width - 280, 140, 0x1a252f)
      .setOrigin(0)
      .setStrokeStyle(4, 0x34495e);
    this.logText = this.add
      .text((width - 280) / 2, height - 70, "", {
        font: "bold 32px Arial",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: width - 380 },
      })
      .setOrigin(0.5);

    // 4. Action Menu (Right Side)
    this.menuUI = this.add.container(width - 280, height - 140);
    this.menuBg = this.add
      .rectangle(0, 0, 280, 140, 0x2c3e50)
      .setOrigin(0)
      .setStrokeStyle(4, 0x34495e);
    this.menuUI.add(this.menuBg);

    const menuItems = ["공격", "스킬", "포획", "도망"];
    this.menuButtons = [];

    menuItems.forEach((text, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = this.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = this.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5, text, {
          font: "bold 20px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      btnBg.on("pointerdown", () => this.handleAction(text));
      btnBg.on("pointerover", () => btnBg.setFillStyle(0xe74c3c));
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      this.menuUI.add([btnBg, btnText]);
      this.menuButtons.push(btnBg);
    });

    // 5. Skill Submenu (Hidden initially)
    this.skillMenuUI = this.add.container(width - 280, height - 140);
    this.skillMenuBg = this.add.rectangle(0, 0, 280, 140, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
    this.skillMenuUI.add(this.skillMenuBg);
    this.skillButtons = [];

    const skills = this.playerCat.skills || [];
    const skillList = [];
    skills.forEach(sid => {
      if (SKILLS[sid]) skillList.push(SKILLS[sid]);
    });
    skillList.push({ name: "뒤로", id: "back" });

    // Expand menu if more than 4 items
    if (skillList.length > 4) {
      this.skillMenuBg.height = 200;
      this.skillMenuUI.y = height - 200;
      // Also maybe the main menu background should be consistent? 
      // For now just adjust the skill menu.
    }

    skillList.forEach((skillItem, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = this.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = this.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5, skillItem.name, {
          font: "bold 16px Arial",
          fill: "#ffffff",
          align: 'center',
          wordWrap: { width: 110 }
        })
        .setOrigin(0.5);

      if (skillItem.id === "back") {
        btnBg.on("pointerdown", () => {
          this.skillMenuUI.setVisible(false);
          this.menuUI.setVisible(true);
        });
      } else {
        btnBg.on("pointerdown", () => {
          this.skillMenuUI.setVisible(false);
          this.playerSkill(skillItem.id);
        });
      }

      btnBg.on("pointerover", () => btnBg.setFillStyle(0xe74c3c));
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      this.skillMenuUI.add([btnBg, btnText]);
      this.skillButtons.push(btnBg);
    });

    this.skillMenuUI.setVisible(false);
  }

  handleAction(action) {
    if (!this.canInput || this.isBattleOver || !this.isPlayerTurn) return;

    this.canInput = false;
    this.menuUI.setVisible(false);

    switch (action) {
      case "공격":
        this.playerAttack();
        break;
      case "스킬":
        this.skillMenuUI.setVisible(true);
        this.canInput = true; // Allow clicking on skill menu
        break;
      case "포획":
        this.playerCapture();
        break;
      case "도망":
        this.playerRun();
        break;
    }
  }

  playerAttack() {
    this.canInput = false;
    this.updateLog(`${this.playerCat.name} used Scratch!`);
    skillEffectSystem.playEffect(this, this.enemySprite, "slash");

    const damage = battleSystem.calculateDamage(
      this.playerCat,
      this.enemyCat,
      "scratch",
    );

    this.time.delayedCall(800, () => {
      this.applyDamage(this.enemyCat, damage, "enemy");
      if (this.enemyCat.currentHp <= 0) {
        this.victory();
      } else {
        this.nextTurn();
      }
    });
  }

  playerSkill(skillId) {
    this.canInput = false;
    const skill = SKILLS[skillId];
    if (!skill) return;

    this.updateLog(`${this.playerCat.name} used ${skill.name}!`);
    skillEffectSystem.playEffect(this, this.enemySprite, skill.effectType);

    const damage = battleSystem.calculateDamage(
      this.playerCat,
      this.enemyCat,
      skillId,
    );

    this.time.delayedCall(800, () => {
      this.applyDamage(this.enemyCat, damage, "enemy");
      if (this.enemyCat.currentHp <= 0) {
        this.victory();
      } else {
        this.nextTurn();
      }
    });
  }

  playerCapture() {
    if (this.isTrainer) {
      this.updateLog("You can't catch a Trainer's cat!");
      this.time.delayedCall(1500, () => {
        this.menuUI.setVisible(true);
        this.canInput = true;
      });
      return;
    }

    // Check Inventory
    const inventory = this.registry.get("playerInventory") || {};
    const crystalCount = inventory["capture_crystal"] || 0;

    if (crystalCount <= 0) {
      this.updateLog("You have no Capture Crystals!");
      this.time.delayedCall(1500, () => {
        this.menuUI.setVisible(true);
        this.canInput = true;
      });
      return;
    }

    // Consume 1 crystal
    inventory["capture_crystal"]--;
    this.registry.set("playerInventory", inventory);

    this.updateLog(
      `You threw a capture crystal... (${inventory["capture_crystal"]} left)`,
    );

    this.time.delayedCall(1000, () => {
      if (battleSystem.checkCapture(this.enemyCat)) {
        this.updateLog("성공! 야생 고양이를 포획했다!");

        // Update Codex and Quest
        codexSystem.markCaught(this.registry, this.enemyCat.id);
        questSystem.completeObjective(
          this.registry,
          "first_steps",
          "capture_cat",
        );

        // Check if legendary
        if (legendarySystem.LEGENDARIES.includes(this.enemyCat.id)) {
          legendarySystem.markLegendaryCleared(this.registry, this.enemyCat.id);
        }

        this.time.delayedCall(2000, () => {
          // Add to collection
          const collection = this.registry.get("playerCollection") || [];
          // Double check instanceId isn't duped (should be safe since it's newly created)
          if (
            !collection.find((c) => c.instanceId === this.enemyCat.instanceId)
          ) {
            collection.push(this.enemyCat);
            this.registry.set("playerCollection", collection);

            // Auto-add to party if space available (Max 3)
            if (this.playerParty.length < 3) {
              this.playerParty.push(this.enemyCat);
              this.registry.set("playerParty", this.playerParty);
              console.log(`BattleScene: Added ${this.enemyCat.name} to party.`);
            } else {
              console.log(
                `BattleScene: Party full. ${this.enemyCat.name} sent to collection.`,
              );
            }
          }

          this.showSummaryPanel(
            "Captured",
            0,
            false,
            this.playerCat.level,
            false,
          );
        });
      } else {
        this.updateLog("The wild cat broke free!");
        this.time.delayedCall(1000, () => this.nextTurn());
      }
    });
  }

  playerRun() {
    if (this.isTrainer) {
      this.updateLog("You can't run from a Trainer battle!");
      this.time.delayedCall(1500, () => {
        this.menuUI.setVisible(true);
        this.canInput = true;
      });
      return;
    }

    this.updateLog("You ran away...");
    this.time.delayedCall(1000, () => {
      this.showSummaryPanel("Fled", 0, false, this.playerCat.level, false);
    });
  }

  enemyTurn() {
    const enemySkills = this.enemyCat.skills || [];
    // 20% basic attack, 80% skill
    const useSkill = Math.random() < 0.8 && enemySkills.length > 0;

    if (useSkill) {
      const skillId = enemySkills[Math.floor(Math.random() * enemySkills.length)];
      const skill = SKILLS[skillId];
      if (skill) {
        this.updateLog(`${this.enemyCat.name} used ${skill.name}!`);
        skillEffectSystem.playEffect(this, this.playerSprite, skill.effectType);
        const damage = battleSystem.calculateDamage(this.enemyCat, this.playerCat, skillId);

        this.time.delayedCall(1000, () => {
          this.applyDamage(this.playerCat, damage, "player");
          if (this.playerCat.currentHp <= 0) {
            this.defeat();
          } else {
            this.nextTurn();
          }
        });
        return;
      }
    }

    // Fallback to basic attack
    this.updateLog(`${this.enemyCat.name} used Scratch!`);
    skillEffectSystem.playEffect(this, this.playerSprite, "slash");
    const damage = battleSystem.calculateDamage(
      this.enemyCat,
      this.playerCat,
      "scratch",
    );

    this.time.delayedCall(1000, () => {
      this.applyDamage(this.playerCat, damage, "player");
      if (this.playerCat.currentHp <= 0) {
        this.defeat();
      } else {
        this.nextTurn();
      }
    });
  }

  applyDamage(target, damage, targetType) {
    target.currentHp = Math.max(0, target.currentHp - damage);

    // Update HP UI
    const ratio = target.currentHp / target.maxHp;
    if (targetType === "player") {
      this.playerHpText.setText(`HP: ${target.currentHp}/${target.maxHp}`);
      this.playerHpBar.width = 260 * ratio;
      this.cameras.main.shake(200, 0.01);
    } else {
      this.enemyHpText.setText(`HP: ${target.currentHp}/${target.maxHp}`);
      this.enemyHpBar.width = 260 * ratio;
      this.enemySprite.setTint(0xff0000);
      this.time.delayedCall(100, () => this.enemySprite.clearTint());
    }
  }

  nextTurn() {
    if (this.isBattleOver) return;

    this.isPlayerTurn = !this.isPlayerTurn;
    this.canInput = this.isPlayerTurn;

    if (this.isPlayerTurn) {
      this.updateLog(`${this.playerCat.name}는 무엇을 할까?`);
      this.menuUI.setVisible(true);
    } else {
      this.enemyTurn();
    }
  }

  victory() {
    // If trainer battle and more enemies remain
    if (this.isTrainer && this.enemyParty.length > 1) {
      this.enemyParty.shift(); // Remove defeated enemy
      this.enemyCat = this.enemyParty[0]; // Set next enemy

      // Mark seen
      codexSystem.markSeen(this.registry, this.enemyCat.id);

      this.updateLog(`트레이너가 ${this.enemyCat.name}를 내보냈다!`);

      // Refresh UI
      this.enemySprite.setTexture(this.enemyCat.id.toLowerCase());
      this.enemyName.setText(
        `${this.enemyCat.name} Lvl ${this.enemyCat.level}`,
      );
      this.enemyHpText.setText(
        `HP: ${this.enemyCat.currentHp}/${this.enemyCat.maxHp}`,
      );
      this.enemyHpBar.width = 260;

      this.time.delayedCall(1500, () => {
        this.canInput = true;
        this.menuUI.setVisible(true);
        this.updateLog(`${this.playerCat.name}는 무엇을 할까?`);
      });
      return;
    }

    this.isBattleOver = true;

    // Calculate rewards
    let expGain = battleSystem.calculateExp(this.enemyCat);
    let goldGain = 0;

    if (this.isTrainer) {
      const trainerData = TRAINERS[this.trainerId];
      expGain = Math.floor(
        expGain * (trainerData.rewards.expMultiplier || 1.5),
      );
      goldGain = battleSystem.calculateGold(true, trainerData.rewards.gold);

      // Mark defeated
      const defeatedTrainers = this.registry.get("defeatedTrainers") || [];
      if (!defeatedTrainers.includes(this.trainerId)) {
        defeatedTrainers.push(this.trainerId);
        this.registry.set("defeatedTrainers", defeatedTrainers);
      }

      // Grant Item Reward if exists
      if (trainerData.rewards.item) {
        const inventory = this.registry.get("playerInventory") || {};
        const itemId = trainerData.rewards.item;
        inventory[itemId] = (inventory[itemId] || 0) + 1;
        this.registry.set("playerInventory", inventory);
        console.log(`BattleScene: Granted item reward ${itemId}`);
      }
    } else {
      // Wild Gold Drop
      goldGain = battleSystem.calculateGold(false);

      // Check if defeated legendary
      if (legendarySystem.LEGENDARIES.includes(this.enemyCat.id)) {
        legendarySystem.markLegendaryCleared(this.registry, this.enemyCat.id);
      }
    }

    // Grant Gold
    const currentGold = this.registry.get("playerGold") || 0;
    this.registry.set("playerGold", currentGold + goldGain);

    let oldStats = {
      hp: this.playerCat.maxHp,
      atk: this.playerCat.stats.attack,
      def: this.playerCat.stats.defense
    };

    let oldLevel = this.playerCat.level;
    const leveledUp = battleSystem.gainExp(this.playerCat, expGain);
    let evolutionHappened = false;

    // Process Evolution if threshold hit
    let oldCreatureId = this.playerCat.id;
    if (this.playerCat.readyToEvolve) {
      battleSystem.evolveCreature(this.playerCat);
      evolutionHappened = true;
    }

    // Save party changes to registry to persist
    this.registry.set("playerParty", this.playerParty);

    // Also ensure collection reference reflects the updated HP/Level/Evolution
    const collection = this.registry.get("playerCollection") || [];
    const collIndex = collection.findIndex(
      (c) => c.instanceId === this.playerCat.instanceId,
    );
    if (collIndex !== -1) collection[collIndex] = this.playerCat;
    this.registry.set("playerCollection", collection);

    this.updateLog("배틀에서 승리했다!");

    if (leveledUp) {
      this.time.delayedCall(1000, () => {
        this.playLevelUpAnimation(
          expGain,
          oldLevel,
          oldStats,
          evolutionHappened,
          goldGain,
          oldCreatureId
        );
      });
    } else {
      this.time.delayedCall(1500, () => {
        this.showSummaryPanel(
          "승리",
          expGain,
          leveledUp,
          oldLevel,
          evolutionHappened,
          goldGain,
        );
      });
    }
  }

  playLevelUpAnimation(expGained, oldLevel, oldStats, evolutionHappened, goldGain, oldCreatureId) {
    const { width, height } = this.cameras.main;

    // Sparkle effect on player sprite
    const sparkle = this.add.circle(this.playerSprite.x, this.playerSprite.y, 10, 0xffffff, 0.8)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: sparkle,
      radius: 150,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => sparkle.destroy()
    });

    // Bouncing text
    const levelUpText = this.add.text(this.playerSprite.x, this.playerSprite.y - 80, "LEVEL UP!", {
      font: 'bold 32px "Press Start 2P", Courier',
      fill: '#f1c40f',
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 50,
      duration: 1500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: levelUpText,
          alpha: 0,
          duration: 500,
          delay: 1000,
          onComplete: () => {
            levelUpText.destroy();
            this.showSummaryPanel("승리", expGained, true, oldLevel, evolutionHappened, goldGain, oldStats, oldCreatureId);
          }
        });
      }
    });
  }

  defeat() {
    this.isBattleOver = true;

    // Persist HP (will be 0)
    this.registry.set("playerParty", this.playerParty);

    this.updateLog(`${this.playerCat.name}가 쓰러졌다...`);
    this.time.delayedCall(1500, () => {
      this.showSummaryPanel("패배", 0, false, this.playerCat.level, false);
    });
  }

  updateLog(msg) {
    this.logText.setText(msg);
  }

  showSummaryPanel(
    result,
    expGained,
    leveledUp,
    oldLevel,
    evolutionHappened,
    goldGain = 0,
    oldStats = null,
    oldCreatureId = null
  ) {
    // Store evolution data for endBattle transition
    this.evolutionHappened = evolutionHappened;
    this.oldCreatureId = oldCreatureId;
    const { width, height } = this.cameras.main;

    // Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    const panelWidth = 660;
    const panelHeight = 460;
    const panelBg = this.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a252f)
      .setInteractive({ useHandCursor: true });
    this.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight)
      .setStrokeStyle(4, 0x34db98)
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 170, `배틀 ${result}`, {
        font: 'bold 40px "Press Start 2P", Courier, monospace',
        fill: "#f1c40f",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5);

    let yPos = height / 2 - 80;

    if (result === "Victory") {
      let line = `경험치 획득: +${expGained}`;
      if (goldGain > 0) line += ` | 골드: +${goldGain}`;

      this.add
        .text(width / 2, yPos, line, { font: "24px Arial", fill: "#2ecc71" })
        .setOrigin(0.5);
      yPos += 40;

      const expNeeded = this.playerCat.level * 50;
      this.add
        .text(
          width / 2,
          yPos,
          `총 경험치: ${this.playerCat.exp} / ${expNeeded}`,
          { font: "24px Arial", fill: "#ffffff" },
        )
        .setOrigin(0.5);
      yPos += 50;

      if (leveledUp) {
        this.add
          .text(
            width / 2,
            yPos,
            `레벨 업! (${oldLevel} -> ${this.playerCat.level})`,
            { font: "bold 28px Arial", fill: "#3498db" },
          )
          .setOrigin(0.5);
        yPos += 30;

        if (oldStats) {
          const hpDiff = this.playerCat.maxHp - oldStats.hp;
          const atkDiff = this.playerCat.stats.attack - oldStats.atk;
          const defDiff = this.playerCat.stats.defense - oldStats.def;

          this.add.text(width / 2, yPos, `HP +${hpDiff} | ATK +${atkDiff} | DEF +${defDiff}`, {
            font: 'bold 20px "Malgun Gothic", Arial',
            fill: "#f1c40f"
          }).setOrigin(0.5);
          yPos += 35;
        }
      }

      if (evolutionHappened) {
        this.add
          .text(width / 2, yPos, `진화 가능!`, {
            font: "bold 26px Arial",
            fill: "#9b59b6",
          })
          .setOrigin(0.5);
        yPos += 40;
      }
    } else {
      this.add
        .text(width / 2, yPos, `획득한 경험치가 없습니다.`, {
          font: "24px Arial",
          fill: "#95a5a6",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(width / 2, height / 2 + 150, "- 화면을 클릭하여 계속하기 -", {
        font: "20px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5);

    // Click to proceed
    panelBg.on("pointerdown", () => this.endBattle());
  }

  endBattle() {
    // Ensure final state is saved right before transitioning
    this.registry.set("playerParty", this.playerParty);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      // Return to world using saved position
      const mapId = this.registry.get("world_mapId") || "starwhisk_village";
      const tx = this.registry.get("world_spawnX") || 10;
      const ty = this.registry.get("world_spawnY") || 10;

      // Autosave after battle (captures, exp, gold, codex)
      saveSystem.saveData(this.registry, mapId, tx, ty);

      const onBattleCompletelyDone = () => {
        // Chapter 1 Boss Twist Sequence
        if (this.trainerId === "guardian_rowan" && !this.registry.get("chapter1_done")) {
          this.runChapterCompleteSequence(mapId, tx, ty);
          return;
        }

        this.scene.start("WorldScene", {
          mapId,
          spawnX: tx,
          spawnY: ty,
        });
      };

      if (this.evolutionHappened) {
        // Launch EvolutionScene over instead of going straight to World
        this.scene.start("EvolutionScene", {
          oldId: this.oldCreatureId,
          newId: this.playerCat.id,
          name: this.oldCreatureId, // fallback name
          newName: this.playerCat.name,
          onComplete: () => {
            onBattleCompletelyDone();
          }
        });
      } else {
        onBattleCompletelyDone();
      }
    });
  }

  async runChapterCompleteSequence(mapId, tx, ty) {
    const { width, height } = this.cameras.main;

    // 1. Rowan Defeat Visuals
    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemySprite.y + 50,
      alpha: 0.5,
      duration: 2000,
      ease: 'Quad.easeInOut'
    });

    await cutsceneSystem.shakeCamera(this, 800, 0.015);
    await cutsceneSystem.delay(this, 1000);

    // 2. Rowan Defeat Dialogue
    const rowanData = NPCS['trainer_guardian_rowan'];
    await cutsceneSystem.playDialogue(this, rowanData.name, [
      "크윽…",
      "어리석은 녀석…",
      "네가 무슨 짓을 했는지 아느냐?",
      "네가 나를 쓰러뜨림으로써…",
      "봉인을 지키던 마지막 결계가 깨져버렸다…"
    ]);

    await cutsceneSystem.shakeCamera(this, 1000, 0.02);
    await cutsceneSystem.delay(this, 500);

    // 3. Hyunseok Appearance
    const hyunseokSprite = this.add.sprite(width + 100, height / 2, 'npc_mira').setScale(4).setDepth(20);
    this.tweens.add({
      targets: hyunseokSprite,
      x: width - 200,
      duration: 1500,
      ease: 'Power2'
    });

    // Pan camera slightly towards the right
    await cutsceneSystem.panCameraTo(this, width / 2 + 50, height / 2, 1000);

    // 4. Hyunseok Twist Dialogue
    await cutsceneSystem.playDialogue(this, "촌장 현석", [
      "훌륭하구나.",
      "로완, 이 고지식한 친구가 길을 비켜주지 않아 곤란하던 참이었단다.",
      "역시 내가 선택한 아이답게 훌륭히 자라주었어.",
      "그래… 이 순간을 위해 널 키운 것이지."
    ]);

    // 5. Legendary Awakening Sequence
    // Light pulse
    const whiteFlash = this.add.rectangle(0, 0, width, height, 0xffffff, 0).setOrigin(0).setDepth(30).setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: whiteFlash,
      alpha: { from: 0, to: 1 },
      duration: 3000,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });

    await cutsceneSystem.shakeCamera(this, 3000, 0.03);

    this.registry.set("chapter1_done", true);

    // Launch Ending Cutscene 
    this.scene.start("CutsceneScene", {
      messages: [
        "고대 고양이의 봉인이 무너졌다.",
        "전설 속 존재들이 펠로리아 대륙 곳곳으로 흩어지기 시작했다.",
        "(화염의 솔라리온, 눈보라의 글라시아라, 폭풍의 템페스트클로...)",
        "(어둠의 엄브라팽, 고목의 버던트링크스)",
        "- 시즌 1 종료 -"
      ],
      nextScene: "WorldScene",
      sceneData: { mapId, spawnX: tx, spawnY: ty }
    });
  }
}
