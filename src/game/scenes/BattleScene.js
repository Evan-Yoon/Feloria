import { ASSETS } from "../config/assetPaths.js";
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
import { koreanUtils } from '../systems/koreanUtils.js';
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
        const catInstance = battleSystem.createInstance(member.creatureId, member.level);
        // Story Mode Balance: Nerf Trainer and Boss cats by 50% HP, Attack, and Defense
        catInstance.maxHp = Math.max(1, Math.floor(catInstance.maxHp * 0.5));
        catInstance.currentHp = catInstance.maxHp;
        catInstance.stats.attack = Math.max(1, Math.floor(catInstance.stats.attack * 0.5));
        catInstance.stats.defense = Math.max(1, Math.floor(catInstance.stats.defense * 0.5));
        this.enemyParty.push(catInstance);
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
    this.isDefeated = false;
    this.canInput = true;

    // Get Trainer Name for UI
    this.trainerName = "";
    if (this.isTrainer && this.trainerId) {
      const trainerData = TRAINERS[this.trainerId];
      this.trainerName = trainerData.name;
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background (Layered)
    const bgMap = {
      'starwhisk_village': { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      'greenpaw_forest': { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      'mosslight_path': { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      'ancient_forest': { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      'mosslight_shrine': { back1: ASSETS.BATTLEBACKS1.RUINS.KEY, back2: ASSETS.BATTLEBACKS2.TEMPLE.KEY },
    };

    const mapId = this.registry.get("world_mapId") || "starwhisk_village";
    const bgs = bgMap[mapId] || bgMap['starwhisk_village'];

    // Sky/Environment layer
    const back2 = this.add.image(width / 2, height / 2, bgs.back2);
    const scale2 = Math.max(width / back2.width, height / back2.height);
    back2.setScale(scale2);

    // Ground layer
    const back1 = this.add.image(width / 2, height / 2, bgs.back1);
    const scale1 = Math.max(width / back1.width, height / back1.height);
    back1.setScale(scale1);

    // --- UI SETUP ---
    this.createBattleUI(width, height);

    // Hide UI initially for the start transition
    this.playerUI.setVisible(false);
    this.enemyUI.setVisible(false);
    this.logBg.setVisible(false);
    this.logText.setVisible(false);
    this.menuUI.setVisible(false);

    // Trainer Name Display (Top Left)
    this.trainerNameText = this.add.text(20, 20, this.trainerName, {
      font: 'bold 24px "Press Start 2P", Courier',
      fill: '#f1c40f',
      stroke: '#000',
      strokeThickness: 4
    }).setVisible(false);

    // --- BATTLE START EFFECT ---
    const startSprite = this.add.image(width / 2, height / 2, ASSETS.SYSTEM.BATTLE_START.KEY)
      .setOrigin(0.5)
      .setScale(0)
      .setDepth(1000)
      .setAlpha(0);

    const targetScale = Math.max(width / startSprite.width, height / startSprite.height);

    this.tweens.add({
      targets: startSprite,
      scale: targetScale,
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: startSprite,
            scale: targetScale * 1.2,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              startSprite.destroy();
              // Reveal UI and start turn
              this.playerUI.setVisible(true);
              this.enemyUI.setVisible(true);
              this.logBg.setVisible(true);
              this.logText.setVisible(true);

              if (this.isTrainer) {
                this.trainerNameText.setVisible(true);
              }

              // --- Play Battle BGM ---
              import('../systems/audioManager.js').then(module => {
                const bgmMap = {
                  'kyle': 'bgm_battle_kyle',
                  'sera': 'bgm_battle_sera',
                  'luke': 'bgm_battle_luke',
                  'guardian_rowan': 'bgm_battle_rowan',
                  'boss_hyunseok': 'bgm_battle_hyunseok'
                };
                const bgmKey = this.isTrainer ? (bgmMap[this.trainerId] || 'bgm_battle_wild') : 'bgm_battle_wild';
                module.audioManager.playBGM(bgmKey);
              });

              this.updateLog(`야생의 ${koreanUtils.getPostPosition(this.enemyCat.name, '이')} 나타났다!`);
              this.time.delayedCall(1500, () => this.nextTurn());
            }
          });
        });
      }
    });
  }

  createBattleUI(width, height) {
    // 1. Player UI (Bottom Right)
    this.playerUI = this.add.container(width * 0.7, height * 0.55);
    // Draw the generated placeholder sprite
    this.playerSprite = this.add
      .sprite(0, -100, ASSETS.SPRITES.MONSTER_FALLBACK.KEY)
      .setScale(1.6);

    // UI Panel for Player
    this.playerBg = this.add
      .rectangle(0, 40, 300, 100, 0x1a252f)
      .setStrokeStyle(3, 0x3498db)
      .setOrigin(0.5);
    this.playerName = this.add
      .text(0, 10, `${this.playerCat.name} Lv. ${this.playerCat.level}`, {
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
    this.playerSprite.setTexture(this.playerCat.id.toLowerCase());

    // 2. Enemy UI (Top Left)
    this.enemyUI = this.add.container(width * 0.3, height * 0.25);
    this.enemySprite = this.add
      .sprite(0, 0, ASSETS.SPRITES.MONSTER_FALLBACK.KEY)
      .setScale(1.6);
    this.enemySprite.setTexture(this.enemyCat.id.toLowerCase());

    this.enemyBg = this.add
      .rectangle(0, 120, 300, 100, 0x1a252f)
      .setStrokeStyle(3, 0xe74c3c)
      .setOrigin(0.5);
    this.enemyName = this.add
      .text(0, 90, `${this.enemyCat.name} Lv. ${this.enemyCat.level}`, {
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
      .rectangle(0, height - 205, width - 280, 205, 0x1a252f)
      .setOrigin(0)
      .setStrokeStyle(4, 0x34495e);
    this.logText = this.add
      .text((width - 280) / 2, height - 102.5, "", {
        font: "bold 32px Arial",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: width - 380 },
      })
      .setOrigin(0.5);

    // 4. Action Menu (Right Side)
    this.menuUI = this.add.container(width - 280, height - 205);
    this.menuBg = this.add
      .rectangle(0, 0, 280, 205, 0x2c3e50)
      .setOrigin(0)
      .setStrokeStyle(4, 0x34495e);
    this.menuUI.add(this.menuBg);

    const menuItems = ["공격", "스킬", "포획", "교체", "아이템", "도망"];
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
      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playSE('se_cursor');
        });
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      this.menuUI.add([btnBg, btnText]);
      this.menuButtons.push(btnBg);
    });

    // 5. Skill Submenu (Hidden initially)
    this.skillMenuUI = this.add.container(width - 280, height - 205);
    this.skillMenuBg = this.add.rectangle(0, 0, 280, 205, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
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
          // Play Cancel SE
          import('../systems/audioManager.js').then(module => {
            module.audioManager.playSE('se_cancel');
          });
        });
      } else {
        btnBg.on("pointerdown", () => {
          this.skillMenuUI.setVisible(false);
          this.playerSkill(skillItem.id);
        });
      }

      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playSE('se_cursor');
        });
      });
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
      case "교체":
        this.showSwapMenu();
        break;
      case "아이템":
        this.showItemMenu();
        break;
      case "도망":
        this.playerRun();
        break;
    }
  }

  showSwapMenu() {
    this.canInput = true;

    if (this.swapMenuUI) {
      this.swapMenuUI.destroy();
    }

    const { width, height } = this.cameras.main;
    this.swapMenuUI = this.add.container(width - 280, height - 205);

    const aliveCats = this.playerParty.filter(cat => cat.currentHp > 0 && cat.instanceId !== this.playerCat.instanceId);

    const menuHeight = 10 + (Math.ceil((aliveCats.length + 1) / 2) * 65);
    const bgHeight = Math.max(205, menuHeight);

    const swapBg = this.add.rectangle(0, 0, 280, bgHeight, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
    this.swapMenuUI.add(swapBg);

    const swapList = [...aliveCats, { name: "뒤로", id: "back" }];

    swapList.forEach((catItem, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = this.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = this.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5,
          catItem.id === "back" ? "뒤로" : `${catItem.name}\nHP ${catItem.currentHp}`,
          {
            font: "bold 14px Arial",
            fill: "#ffffff",
            align: 'center',
            wordWrap: { width: 110 }
          })
        .setOrigin(0.5);

      if (catItem.id === "back") {
        btnBg.on("pointerdown", () => {
          this.swapMenuUI.setVisible(false);
          this.menuUI.setVisible(true);
          import('../systems/audioManager.js').then(module => {
            module.audioManager.playSE('se_cancel');
          });
        });
      } else {
        btnBg.on("pointerdown", () => {
          this.swapMenuUI.setVisible(false);
          this.swapActiveCat(catItem, false);
        });
      }

      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playSE('se_cursor');
        });
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      this.swapMenuUI.add([btnBg, btnText]);
    });
  }

  showItemMenu() {
    this.canInput = true;

    if (this.itemMenuUI) {
      this.itemMenuUI.destroy();
    }

    const { width, height } = this.cameras.main;
    this.itemMenuUI = this.add.container(width - 280, height - 205);

    const inventory = this.registry.get("playerInventory") || {};
    // Extract healing items dynamically if we import items.js, but let's hardcode potion check for now since we only have one
    const healItemsList = [];
    if (inventory["potion"] > 0) {
      healItemsList.push({ id: "potion", name: `포션 (x${inventory["potion"]})`, amount: 20 });
    }

    const menuHeight = 10 + (Math.ceil((healItemsList.length + 1) / 2) * 65);
    const bgHeight = Math.max(205, menuHeight);

    const itemBg = this.add.rectangle(0, 0, 280, bgHeight, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
    this.itemMenuUI.add(itemBg);

    const itemList = [...healItemsList, { name: "뒤로", id: "back" }];

    itemList.forEach((itemObj, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = this.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = this.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5, itemObj.name, {
          font: "bold 14px Arial",
          fill: "#ffffff",
          align: 'center',
          wordWrap: { width: 110 }
        })
        .setOrigin(0.5);

      if (itemObj.id === "back") {
        btnBg.on("pointerdown", () => {
          this.itemMenuUI.setVisible(false);
          this.menuUI.setVisible(true);
          import('../systems/audioManager.js').then(module => {
            module.audioManager.playSE('se_cancel');
          });
        });
      } else {
        btnBg.on("pointerdown", () => {
          this.itemMenuUI.setVisible(false);
          this.playerItemUse(itemObj.id, itemObj.amount);
        });
      }

      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playSE('se_cursor');
        });
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      this.itemMenuUI.add([btnBg, btnText]);
    });
  }

  swapActiveCat(newCat, isAuto) {
    this.canInput = false;

    if (!isAuto) {
      this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, '을')} 들이고 ${koreanUtils.getPostPosition(newCat.name, '을')} 내보냈다!`);
    } else {
      this.updateLog(`${koreanUtils.getPostPosition(newCat.name, '이')} 전투에 나섰다!`);
    }

    // Play Swap ME
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_heal'); // Using heal sound as stand-in for swap
    });

    this.playerCat = newCat;

    // Update UI
    this.playerSprite.setTexture(this.playerCat.id.toLowerCase());
    this.playerName.setText(`${this.playerCat.name} Lv. ${this.playerCat.level}`);
    this.playerHpText.setText(`HP: ${this.playerCat.currentHp}/${this.playerCat.maxHp}`);

    const ratio = this.playerCat.currentHp / this.playerCat.maxHp;
    this.playerHpBar.width = 260 * ratio;

    // Visual effect
    this.playerSprite.setAlpha(0);
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Auto swap happens instantly from defeat, no turn pass needed since it was the enemy's turn
        // Wait, auto swap triggers at the end of enemy turn. So we just let the battle continue.
        if (isAuto) {
          this.time.delayedCall(500, () => {
            this.nextTurn(); // Pass to player
          });
        } else {
          // Manual swap uses player's turn
          this.time.delayedCall(500, () => {
            this.nextTurn(); // Pass to enemy
          });
        }
      }
    });
  }

  playerItemUse(itemId, healAmount) {
    this.canInput = false;

    // Deduct from inventory
    const inventory = this.registry.get("playerInventory") || {};
    inventory[itemId]--;
    this.registry.set("playerInventory", inventory);

    this.updateLog(`포션을 사용했다! ${this.playerCat.name}의 체력이 회복되었다.`);

    // Heal the active cat
    this.playerCat.currentHp = Math.min(this.playerCat.maxHp, this.playerCat.currentHp + healAmount);

    // Update HP bar
    this.playerHpText.setText(`HP: ${this.playerCat.currentHp}/${this.playerCat.maxHp}`);
    const ratio = this.playerCat.currentHp / this.playerCat.maxHp;
    this.playerHpBar.width = 260 * ratio;

    // Play Heal SE and particle effect
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_heal');
    });

    skillEffectSystem.playEffect(this, this.playerSprite, "heal", "버프", 1);

    this.time.delayedCall(1500, () => {
      this.nextTurn();
    });
  }

  playerAttack() {
    this.canInput = false;
    this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, '이')} 할퀴기를 사용했다!`);

    const { damage, multiplier } = battleSystem.calculateDamage(
      this.playerCat,
      this.enemyCat,
      "scratch",
    );

    // Play Basic Attack SE
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_attack_basic');
    });

    skillEffectSystem.playEffect(this, this.enemySprite, "scratch", "노말", multiplier);

    this.time.delayedCall(150, () => {
      this.displayTypeFeedback(multiplier);
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

    this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, '이')} ${koreanUtils.getPostPosition(skill.name, '을')} 사용했다!`);

    const { damage, multiplier } = battleSystem.calculateDamage(
      this.playerCat,
      this.enemyCat,
      skillId,
    );

    // Play Skill SE by type
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSkillSE(skill.type);
    });

    skillEffectSystem.playEffect(this, this.enemySprite, skillId, skill.type, multiplier);

    this.time.delayedCall(800, () => {
      this.displayTypeFeedback(multiplier);
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
      this.updateLog("트레이너의 고양이는 포획할 수 없습니다!");
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
      this.updateLog("포획 크리스탈이 부족합니다!");
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
      `포획 크리스탈을 던졌다... (남은 개수: ${inventory["capture_crystal"]})`,
    );

    this.time.delayedCall(1000, () => {
      if (battleSystem.checkCapture(this.enemyCat)) {
        this.updateLog(`성공! ${koreanUtils.getPostPosition(this.enemyCat.name, '을')} 포획했다!`);

        // Play Capture ME
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playME('me_catch_success', { duckBGM: true });
        });

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

          // Reward EXP to all possessed cats
          const expReward = Math.ceil(battleSystem.calculateExp(this.enemyCat) * 1.5);
          collection.forEach(cat => {
            const leveledUp = battleSystem.gainExp(cat, expReward);
            if (leveledUp) {
              this.updateLog(`${koreanUtils.getPostPosition(cat.name, '의')} 레벨이 올랐다! (Lv.${cat.level})`);
            }
          });
          this.updateLog(`포획 보너스! 모든 보유 고양이가 ${expReward} EXP를 획득했습니다.`);

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
          } else {
            // If already in collection (shouldn't happen for new capture but good to be safe)
            this.registry.set("playerCollection", collection);
          }

          // Sync party if any changes happened (gainExp might have modified objects shared by both)
          this.registry.set("playerParty", this.playerParty);

          this.showSummaryPanel(
            "포획",
            expReward,
            false,
            this.playerCat.level,
            false,
            0,
            null,
            null,
            true // isCaptureSuccess
          );
        });
      } else {
        this.updateLog("야생 고양이가 빠져나왔다!");
        this.time.delayedCall(1000, () => this.nextTurn());
      }
    });
  }

  playerRun() {
    if (this.isTrainer) {
      this.updateLog("트레이너 배틀에서는 도망칠 수 없습니다!");
      this.time.delayedCall(1500, () => {
        this.menuUI.setVisible(true);
        this.canInput = true;
      });
      return;
    }

    this.updateLog("도망쳤다...");
    this.time.delayedCall(1000, () => {
      this.showSummaryPanel("도주", 0, false, this.playerCat.level, false);
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
        this.updateLog(`${koreanUtils.getPostPosition(this.enemyCat.name, '이')} ${koreanUtils.getPostPosition(skill.name, '을')} 사용했다!`);

        const { damage, multiplier } = battleSystem.calculateDamage(this.enemyCat, this.playerCat, skillId);

        // Play Skill SE
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playSkillSE(skill.type);
        });

        skillEffectSystem.playEffect(this, this.playerSprite, skillId, skill.type, multiplier);

        this.time.delayedCall(1000, () => {
          this.displayTypeFeedback(multiplier);
          this.applyDamage(this.playerCat, damage, "player");
          if (this.playerCat.currentHp <= 0) {
            this.handlePlayerFaint();
          } else {
            this.nextTurn();
          }
        });
        return;
      }
    }

    // Fallback to basic attack
    this.updateLog(`${koreanUtils.getPostPosition(this.enemyCat.name, '이')} 할퀴기를 사용했다!`);

    const { damage, multiplier } = battleSystem.calculateDamage(
      this.enemyCat,
      this.playerCat,
      "scratch",
    );

    // Play Attack SE
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_attack_basic');
    });

    skillEffectSystem.playEffect(this, this.playerSprite, "scratch", "노말", multiplier);

    this.time.delayedCall(400, () => {
      this.displayTypeFeedback(multiplier);
      this.applyDamage(this.playerCat, damage, "player");
      if (this.playerCat.currentHp <= 0) {
        this.handlePlayerFaint();
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

      // Play Death SE if HP hits 0
      if (target.currentHp <= 0) {
        import('../systems/audioManager.js').then(module => {
          const deathKey = targetType === "player" ? "se_collapse_player" : "se_collapse_enemy";
          module.audioManager.playSE(deathKey);
        });
      }

      this.time.delayedCall(100, () => this.enemySprite.clearTint());
    }

    // Show Damage Numbers
    const x = targetType === "player" ? this.playerSprite.x : this.enemySprite.x;
    const y = targetType === "player" ? this.playerSprite.y - 50 : this.enemySprite.y - 50;
    this.showDamageNumber(x, y, damage, targetType === "player");
  }

  showDamageNumber(x, y, amount, isPlayerTarget) {
    const color = isPlayerTarget ? '#ff4d4d' : '#ffeb3b';
    const text = this.add.text(x, y, `-${amount}`, {
      fontFamily: '"Press Start 2P", Courier, monospace',
      fontSize: '24px',
      color: color,
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(2000);

    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }

  nextTurn() {
    if (this.isBattleOver) return;

    this.isPlayerTurn = !this.isPlayerTurn;
    this.canInput = this.isPlayerTurn;

    if (this.isPlayerTurn) {
      this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, '은')} 무엇을 할까?`);
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

      this.updateLog(`트레이너가 ${koreanUtils.getPostPosition(this.enemyCat.name, '을')} 내보냈다!`);

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
        this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, '은')} 무엇을 할까?`);
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

        // Play Item Get ME
        import('../systems/audioManager.js').then(module => {
          module.audioManager.playME('me_item_get', { duckBGM: true });
        });

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

    // Play Victory ME
    import('../systems/audioManager.js').then(module => {
      const victoryKey = this.isTrainer ? "me_victory_trainer" : "me_victory_wild";
      module.audioManager.playME(victoryKey, { duckBGM: true });
    });

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

    // Play Level Up ME
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playME('me_level_up', { duckBGM: true });
    });

    // Bouncing text
    const levelUpText = this.add.text(this.playerSprite.x, this.playerSprite.y - 80, "레벨 업!", {
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

  handlePlayerFaint() {
    this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, '이')} 쓰러졌다...`);

    const aliveCats = this.playerParty.filter(cat => cat.currentHp > 0);

    if (aliveCats.length > 0) {
      this.time.delayedCall(1500, () => {
        this.swapActiveCat(aliveCats[0], true);
      });
    } else {
      // All fainted, trigger full defeat sequence
      this.defeat();
    }
  }

  defeat() {
    this.isBattleOver = true;
    this.isDefeated = true;

    // Persist HP (will be 0)
    this.registry.set("playerParty", this.playerParty);

    this.updateLog(`${this.playerCat.name}가 쓰러졌다...`);

    // Play Game Over ME
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playME('me_game_over', { duckBGM: true });
    });

    this.time.delayedCall(1500, () => {
      this.showSummaryPanel("패배", 0, false, this.playerCat.level, false);
    });
  }

  updateLog(msg) {
    this.logText.setText(msg);
  }

  displayTypeFeedback(multiplier) {
    if (multiplier >= 2) {
      this.updateLog("효과가 굉장하다!");
    } else if (multiplier > 0 && multiplier <= 0.5) {
      this.updateLog("효과가 별로인 것 같다...");
    } else if (multiplier === 0) {
      this.updateLog("효과가 없다!");
    }
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

    if (result === "Victory" || result === "Captured" || result === "승리" || result === "포획") {
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

    // Click or Key to proceed
    panelBg.on("pointerdown", () => this.endBattle());
    this.input.keyboard.once("keydown-SPACE", () => this.endBattle());
    this.input.keyboard.once("keydown-ENTER", () => this.endBattle());
  }

  endBattle() {
    // Ensure final state is saved right before transitioning
    this.registry.set("playerParty", this.playerParty);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (this.isDefeated) {
        this.scene.start('GameOverScene');
        return;
      }

      // Return to world using saved position
      const mapId = this.registry.get("world_mapId") || "starwhisk_village";
      const tx = this.registry.get("world_spawnX") || 10;
      const ty = this.registry.get("world_spawnY") || 10;

      // Autosave after battle (captures, exp, gold, codex)
      saveSystem.saveData(this.registry, mapId, tx, ty);

      const onBattleCompletelyDone = () => {
        if (this.trainerId === 'guardian_rowan') {
          this.scene.start('WorldScene', {
            mapId: this.registry.get('world_mapId'),
            spawnX: this.registry.get('world_spawnX'),
            spawnY: this.registry.get('world_spawnY'),
            triggerClimax: true
          });
        } else if (this.trainerId === 'boss_hyunseok') {
          this.scene.start('WorldScene', {
            mapId: this.registry.get('world_mapId'),
            spawnX: this.registry.get('world_spawnX'),
            spawnY: this.registry.get('world_spawnY'),
            triggerPostClimax: true
          });
        } else {
          this.scene.start("WorldScene", {
            mapId: this.registry.get("world_mapId"),
            spawnX: this.registry.get("world_spawnX"),
            spawnY: this.registry.get("world_spawnY"),
          });
        }
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

    if (this.trainerNameText) this.trainerNameText.setVisible(false);
  }
}
