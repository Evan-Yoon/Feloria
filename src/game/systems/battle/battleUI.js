import { ASSETS } from "../../config/assetPaths.js";
import { SKILLS } from "../../data/skills.js";
import { koreanUtils } from "../koreanUtils.js";

/**
 * battleUI
 * Creates and updates all Phaser display objects for BattleScene.
 * All methods receive the BattleScene instance as `scene`.
 */
export const battleUI = {

  /** Builds the full battle UI: player panel, enemy panel, log, action menu, skill submenu. */
  createBattleUI(scene) {
    const { width, height } = scene.cameras.main;

    // 1. Player UI (Bottom Right)
    scene.playerUI = scene.add.container(width * 0.7, height * 0.55);
    scene.playerSprite = scene.add
      .sprite(0, -100, ASSETS.SPRITES.MONSTER_FALLBACK.KEY)
      .setScale(1.6);

    scene.playerBg = scene.add
      .rectangle(0, 40, 300, 100, 0x1a252f)
      .setStrokeStyle(3, 0x3498db)
      .setOrigin(0.5);
    scene.playerName = scene.add
      .text(0, 10, `${scene.playerCat.name} Lv. ${scene.playerCat.level}`, {
        font: "bold 22px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    scene.playerHpText = scene.add
      .text(0, 40, `HP: ${scene.playerCat.currentHp}/${scene.playerCat.maxHp}`, {
        font: "bold 18px Arial",
        fill: "#2ecc71",
      })
      .setOrigin(0.5);
    scene.playerHpBg = scene.add.rectangle(0, 70, 260, 15, 0x000000).setOrigin(0.5);
    scene.playerHpBar = scene.add.rectangle(-130, 62.5, 260, 15, 0x27ae60).setOrigin(0);

    scene.playerUI.add([
      scene.playerSprite,
      scene.playerBg,
      scene.playerName,
      scene.playerHpText,
      scene.playerHpBg,
      scene.playerHpBar,
    ]);
    scene.playerSprite.setTexture("creature_" + scene.playerCat.id.toLowerCase());

    // 2. Enemy UI (Top Left)
    scene.enemyUI = scene.add.container(width * 0.3, height * 0.25);
    scene.enemySprite = scene.add
      .sprite(0, 0, ASSETS.SPRITES.MONSTER_FALLBACK.KEY)
      .setScale(1.6);
    scene.enemySprite.setTexture("creature_" + scene.enemyCat.id.toLowerCase());

    scene.enemyBg = scene.add
      .rectangle(0, 120, 300, 100, 0x1a252f)
      .setStrokeStyle(3, 0xe74c3c)
      .setOrigin(0.5);
    scene.enemyName = scene.add
      .text(0, 90, `${scene.enemyCat.name} Lv. ${scene.enemyCat.level}`, {
        font: "bold 22px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    scene.enemyHpText = scene.add
      .text(0, 120, `HP: ${scene.enemyCat.currentHp}/${scene.enemyCat.maxHp}`, {
        font: "bold 18px Arial",
        fill: "#e74c3c",
      })
      .setOrigin(0.5);
    scene.enemyHpBg = scene.add.rectangle(0, 150, 260, 15, 0x000000).setOrigin(0.5);
    scene.enemyHpBar = scene.add.rectangle(-130, 142.5, 260, 15, 0xc0392b).setOrigin(0);

    scene.enemyUI.add([
      scene.enemySprite,
      scene.enemyBg,
      scene.enemyName,
      scene.enemyHpText,
      scene.enemyHpBg,
      scene.enemyHpBar,
    ]);

    // 3. Battle Log (Bottom)
    scene.logBg = scene.add
      .rectangle(0, height - 205, width - 280, 205, 0x1a252f)
      .setOrigin(0)
      .setStrokeStyle(4, 0x34495e);
    scene.logText = scene.add
      .text((width - 280) / 2, height - 102.5, "", {
        font: "bold 32px Arial",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: width - 380 },
      })
      .setOrigin(0.5);

    // 4. Action Menu (Right Side)
    scene.menuUI = scene.add.container(width - 280, height - 205);
    scene.menuBg = scene.add
      .rectangle(0, 0, 280, 205, 0x2c3e50)
      .setOrigin(0)
      .setStrokeStyle(4, 0x34495e);
    scene.menuUI.add(scene.menuBg);

    const menuItems = ["공격", "스킬", "포획", "교체", "아이템", "도망"];
    scene.menuButtons = [];

    menuItems.forEach((text, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = scene.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = scene.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5, text, {
          font: "bold 20px Arial",
          fill: "#ffffff",
        })
        .setOrigin(0.5);

      btnBg.on("pointerdown", () => scene.handleAction(text));
      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import("../audioManager.js").then(m => m.audioManager.playSE("se_cursor"));
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      scene.menuUI.add([btnBg, btnText]);
      scene.menuButtons.push(btnBg);
    });

    // 5. Skill Submenu (Hidden initially)
    battleUI.buildSkillMenu(scene);

    scene.skillMenuUI.setVisible(false);
  },

  /** Builds (or rebuilds) the skill submenu for the active player creature. */
  buildSkillMenu(scene) {
    const { width, height } = scene.cameras.main;

    if (scene.skillMenuUI) scene.skillMenuUI.destroy();

    scene.skillMenuUI = scene.add.container(width - 280, height - 205);
    const skillMenuBg = scene.add.rectangle(0, 0, 280, 205, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
    scene.skillMenuUI.add(skillMenuBg);
    scene.skillButtons = [];

    const skillList = (scene.playerCat.skills || [])
      .map(sid => SKILLS[sid])
      .filter(Boolean);
    skillList.push({ name: "뒤로", id: "back" });

    skillList.forEach((skillItem, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = scene.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = scene.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5, skillItem.name, {
          font: "bold 16px Arial",
          fill: "#ffffff",
          align: "center",
          wordWrap: { width: 110 },
        })
        .setOrigin(0.5);

      if (skillItem.id === "back") {
        btnBg.on("pointerdown", () => {
          scene.skillMenuUI.setVisible(false);
          scene.menuUI.setVisible(true);
          import("../audioManager.js").then(m => m.audioManager.playSE("se_cancel"));
        });
      } else {
        btnBg.on("pointerdown", () => {
          scene.skillMenuUI.setVisible(false);
          scene.playerSkill(skillItem.id);
        });
      }
      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import("../audioManager.js").then(m => m.audioManager.playSE("se_cursor"));
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      scene.skillMenuUI.add([btnBg, btnText]);
      scene.skillButtons.push(btnBg);
    });
  },

  /** Shows a pop-up menu for swapping the active creature mid-battle. */
  showSwapMenu(scene) {
    scene.canInput = true;

    if (scene.swapMenuUI) scene.swapMenuUI.destroy();

    const { width, height } = scene.cameras.main;
    scene.swapMenuUI = scene.add.container(width - 280, height - 205);

    const aliveCats = scene.playerParty.filter(
      cat => cat.currentHp > 0 && cat.instanceId !== scene.playerCat.instanceId
    );

    const menuHeight = 10 + Math.ceil((aliveCats.length + 1) / 2) * 65;
    const bgHeight = Math.max(205, menuHeight);

    const swapBg = scene.add.rectangle(0, 0, 280, bgHeight, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
    scene.swapMenuUI.add(swapBg);

    const swapList = [...aliveCats, { name: "뒤로", id: "back" }];

    swapList.forEach((catItem, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = scene.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = scene.add
        .text(
          10 + col * 135 + 62.5,
          10 + row * 65 + 27.5,
          catItem.id === "back" ? "뒤로" : `${catItem.name}\nHP ${catItem.currentHp}`,
          { font: "bold 14px Arial", fill: "#ffffff", align: "center", wordWrap: { width: 110 } }
        )
        .setOrigin(0.5);

      if (catItem.id === "back") {
        btnBg.on("pointerdown", () => {
          scene.swapMenuUI.setVisible(false);
          scene.menuUI.setVisible(true);
          import("../audioManager.js").then(m => m.audioManager.playSE("se_cancel"));
        });
      } else {
        btnBg.on("pointerdown", () => {
          scene.swapMenuUI.setVisible(false);
          scene.swapActiveCat(catItem, false);
        });
      }
      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import("../audioManager.js").then(m => m.audioManager.playSE("se_cursor"));
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      scene.swapMenuUI.add([btnBg, btnText]);
    });
  },

  /** Shows a pop-up menu for using items from the player's inventory. */
  showItemMenu(scene) {
    scene.canInput = true;

    if (scene.itemMenuUI) scene.itemMenuUI.destroy();

    const { width, height } = scene.cameras.main;
    scene.itemMenuUI = scene.add.container(width - 280, height - 205);

    const inventory = scene.registry.get("playerInventory") || {};
    const healItemsList = [];
    if (inventory["potion"] > 0) {
      healItemsList.push({ id: "potion", name: `포션 (x${inventory["potion"]})`, amount: 20 });
    }

    const bgHeight = Math.max(205, 10 + Math.ceil((healItemsList.length + 1) / 2) * 65);
    const itemBg = scene.add.rectangle(0, 0, 280, bgHeight, 0x2c3e50).setOrigin(0).setStrokeStyle(4, 0x34495e);
    scene.itemMenuUI.add(itemBg);

    const itemList = [...healItemsList, { name: "뒤로", id: "back" }];

    itemList.forEach((itemObj, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const btnBg = scene.add
        .rectangle(10 + col * 135, 10 + row * 65, 125, 55, 0x34495e)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const btnText = scene.add
        .text(10 + col * 135 + 62.5, 10 + row * 65 + 27.5, itemObj.name, {
          font: "bold 14px Arial",
          fill: "#ffffff",
          align: "center",
          wordWrap: { width: 110 },
        })
        .setOrigin(0.5);

      if (itemObj.id === "back") {
        btnBg.on("pointerdown", () => {
          scene.itemMenuUI.setVisible(false);
          scene.menuUI.setVisible(true);
          import("../audioManager.js").then(m => m.audioManager.playSE("se_cancel"));
        });
      } else {
        btnBg.on("pointerdown", () => {
          scene.itemMenuUI.setVisible(false);
          scene.playerItemUse(itemObj.id, itemObj.amount);
        });
      }
      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe74c3c);
        import("../audioManager.js").then(m => m.audioManager.playSE("se_cursor"));
      });
      btnBg.on("pointerout", () => btnBg.setFillStyle(0x34495e));

      scene.itemMenuUI.add([btnBg, btnText]);
    });
  },

  /** Applies damage to a target and updates HP bar + damage number. */
  applyDamage(scene, target, damage, targetType) {
    target.currentHp = Math.max(0, target.currentHp - damage);

    const ratio = target.currentHp / target.maxHp;
    if (targetType === "player") {
      scene.playerHpText.setText(`HP: ${target.currentHp}/${target.maxHp}`);
      scene.playerHpBar.width = 260 * ratio;
      scene.cameras.main.shake(200, 0.01);
    } else {
      scene.enemyHpText.setText(`HP: ${target.currentHp}/${target.maxHp}`);
      scene.enemyHpBar.width = 260 * ratio;
      scene.enemySprite.setTint(0xff0000);

      if (target.currentHp <= 0) {
        import("../audioManager.js").then(m => {
          const key = targetType === "player" ? "se_collapse_player" : "se_collapse_enemy";
          m.audioManager.playSE(key);
        });
      }

      scene.time.delayedCall(100, () => scene.enemySprite.clearTint());
    }

    const sx = targetType === "player" ? scene.playerSprite.x : scene.enemySprite.x;
    const sy = (targetType === "player" ? scene.playerSprite.y : scene.enemySprite.y) - 50;
    battleUI.showDamageNumber(scene, sx, sy, damage, targetType === "player");
  },

  /** Floats a damage number above the target sprite. */
  showDamageNumber(scene, x, y, amount, isPlayerTarget) {
    const color = isPlayerTarget ? "#ff4d4d" : "#ffeb3b";
    const text = scene.add
      .text(x, y, `-${amount}`, {
        fontFamily: '"Press Start 2P", Courier, monospace',
        fontSize: "24px",
        color: color,
        stroke: "#000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(2000);

    scene.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => text.destroy(),
    });
  },

  /** Briefly shows a type-effectiveness message in the battle log. */
  displayTypeFeedback(scene, multiplier) {
    if (multiplier >= 2) {
      scene.updateLog("효과가 굉장하다!");
    } else if (multiplier > 0 && multiplier <= 0.5) {
      scene.updateLog("효과가 별로인 것 같다...");
    } else if (multiplier === 0) {
      scene.updateLog("효과가 없다!");
    }
  },

  /** Plays the level-up sparkle + text animation, then shows the summary panel. */
  playLevelUpAnimation(scene, expGained, oldLevel, oldStats, evolutionHappened, goldGain, oldCreatureId) {
    const sparkle = scene.add
      .circle(scene.playerSprite.x, scene.playerSprite.y, 10, 0xffffff, 0.8)
      .setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: sparkle,
      radius: 150,
      alpha: 0,
      duration: 800,
      ease: "Sine.easeOut",
      onComplete: () => sparkle.destroy(),
    });

    import("../audioManager.js").then(m => m.audioManager.playME("me_level_up", { duckBGM: true }));

    const levelUpText = scene.add
      .text(scene.playerSprite.x, scene.playerSprite.y - 80, "레벨 업!", {
        font: 'bold 32px "Press Start 2P", Courier',
        fill: "#f1c40f",
        shadow: { offsetX: 3, offsetY: 3, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5);

    scene.tweens.add({
      targets: levelUpText,
      y: levelUpText.y - 50,
      duration: 1500,
      ease: "Back.easeOut",
      onComplete: () => {
        scene.tweens.add({
          targets: levelUpText,
          alpha: 0,
          duration: 500,
          delay: 1000,
          onComplete: () => {
            levelUpText.destroy();
            battleUI.showSummaryPanel(scene, "승리", expGained, true, oldLevel, evolutionHappened, goldGain, oldStats, oldCreatureId);
          },
        });
      },
    });
  },

  /**
   * Shows the end-of-battle summary panel (victory / defeat / capture / run).
   * Clicking or pressing Space/Enter calls scene.endBattle().
   */
  showSummaryPanel(scene, result, expGained, leveledUp, oldLevel, evolutionHappened, goldGain = 0, oldStats = null, oldCreatureId = null, isCaptureResult = false) {
    scene.evolutionHappened = evolutionHappened;
    scene.oldCreatureId = oldCreatureId;

    const { width, height } = scene.cameras.main;

    scene.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    const panelWidth = 660;
    const panelHeight = 460;
    const panelBg = scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a252f)
      .setInteractive({ useHandCursor: true });
    scene.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight)
      .setStrokeStyle(4, 0x34db98)
      .setOrigin(0.5);

    scene.add
      .text(width / 2, height / 2 - 170, `배틀 ${result}`, {
        font: 'bold 40px "Press Start 2P", Courier, monospace',
        fill: "#f1c40f",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5);

    let yPos = height / 2 - 80;
    const isWin = ["Victory", "Captured", "승리", "포획"].includes(result);

    if (isWin) {
      let line = `경험치 획득: +${expGained}`;
      if (goldGain > 0) line += ` | 골드: +${goldGain}`;

      scene.add.text(width / 2, yPos, line, { font: "24px Arial", fill: "#2ecc71" }).setOrigin(0.5);
      yPos += 40;

      const expNeeded = scene.playerCat.level * 50;
      scene.add
        .text(width / 2, yPos, `총 경험치: ${scene.playerCat.exp} / ${expNeeded}`, { font: "24px Arial", fill: "#ffffff" })
        .setOrigin(0.5);
      yPos += 50;

      if (leveledUp) {
        scene.add
          .text(width / 2, yPos, `레벨 업! (${oldLevel} -> ${scene.playerCat.level})`, { font: "bold 28px Arial", fill: "#3498db" })
          .setOrigin(0.5);
        yPos += 30;

        if (oldStats) {
          const hpDiff = scene.playerCat.maxHp - oldStats.hp;
          const atkDiff = scene.playerCat.stats.attack - oldStats.atk;
          const defDiff = scene.playerCat.stats.defense - oldStats.def;
          scene.add
            .text(width / 2, yPos, `HP +${hpDiff} | ATK +${atkDiff} | DEF +${defDiff}`, {
              font: 'bold 20px "Malgun Gothic", Arial',
              fill: "#f1c40f",
            })
            .setOrigin(0.5);
          yPos += 35;
        }
      }

      if (evolutionHappened) {
        scene.add.text(width / 2, yPos, "진화 가능!", { font: "bold 26px Arial", fill: "#9b59b6" }).setOrigin(0.5);
      }
    } else {
      scene.add.text(width / 2, yPos, "획득한 경험치가 없습니다.", { font: "24px Arial", fill: "#95a5a6" }).setOrigin(0.5);
    }

    scene.add
      .text(width / 2, height / 2 + 150, "- 화면을 클릭하여 계속하기 -", { font: "20px Arial", fill: "#bdc3c7" })
      .setOrigin(0.5);

    panelBg.on("pointerdown", () => scene.endBattle());
    scene.input.keyboard.once("keydown-SPACE", () => scene.endBattle());
    scene.input.keyboard.once("keydown-ENTER", () => scene.endBattle());
  },

  /** Refreshes the enemy panel after a trainer sends out the next creature. */
  refreshEnemyPanel(scene) {
    scene.enemySprite.setTexture("creature_" + scene.enemyCat.id.toLowerCase());
    scene.enemyName.setText(`${scene.enemyCat.name} Lvl ${scene.enemyCat.level}`);
    scene.enemyHpText.setText(`HP: ${scene.enemyCat.currentHp}/${scene.enemyCat.maxHp}`);
    scene.enemyHpBar.width = 260;
  },

  /** Refreshes the player panel after a creature swap. */
  refreshPlayerPanel(scene) {
    scene.playerSprite.setTexture("creature_" + scene.playerCat.id.toLowerCase());
    scene.playerName.setText(`${scene.playerCat.name} Lv. ${scene.playerCat.level}`);
    scene.playerHpText.setText(`HP: ${scene.playerCat.currentHp}/${scene.playerCat.maxHp}`);
    const ratio = scene.playerCat.currentHp / scene.playerCat.maxHp;
    scene.playerHpBar.width = 260 * ratio;
  },
};
