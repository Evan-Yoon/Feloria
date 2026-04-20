import Phaser from "phaser";
import { ASSETS } from "../config/assetPaths.js";
import { TRAINERS } from "../data/trainers.js";
import { NPCS } from "../data/npcs.js";
import { battleSystem } from "../systems/battle/battleSystem.js";
import { battleUI } from "../systems/battle/battleUI.js";
import { battleActions } from "../systems/battle/battleActions.js";
import { codexSystem } from "../systems/codexSystem.js";
import { saveSystem } from "../systems/saveSystem.js";
import { questSystem } from "../systems/questSystem.js";
import { legendarySystem } from "../systems/legendarySystem.js";
import { koreanUtils } from "../systems/koreanUtils.js";

/**
 * BattleScene
 * Orchestrates turn-based combat. UI is in battleUI.js, actions in battleActions.js.
 */
export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  init(data) {
    // 1. Player party
    this.playerParty = this.registry.get("playerParty") || [];
    this.playerCat = this.playerParty[0];
    if (!this.playerCat) {
      console.warn("BattleScene: No player party found, using fallback Leafkit.");
      this.playerCat = battleSystem.createInstance("LEAFKIT", 5);
      this.registry.set("playerParty", [this.playerCat]);
    }

    // 2. Enemy party (wild vs trainer)
    this.isTrainer = data.isTrainer || false;
    this.trainerId = data.trainerId || null;
    this.enemyParty = [];

    if (this.isTrainer && this.trainerId) {
      const trainerData = TRAINERS[this.trainerId];
      trainerData.party.forEach((member) => {
        const cat = battleSystem.createInstance(member.creatureId, member.level);
        battleSystem.applyTrainerNerf(cat, this.trainerId === "boss_hyunseok");
        this.enemyParty.push(cat);
      });
      this.enemyCat = this.enemyParty[0];
    } else {
      const enemyId = data.enemyId && typeof data.enemyId === "string" ? data.enemyId : "SNAGPUSS";
      this.enemyCat = battleSystem.createInstance(enemyId, data.enemyLevel || 2);
      if (!this.enemyCat) {
        console.warn(`BattleScene: Failed to load enemy ${enemyId}, falling back to Snagpuss.`);
        this.enemyCat = battleSystem.createInstance("SNAGPUSS", 2);
      }
      this.enemyParty.push(this.enemyCat);
      this.enemyParty.forEach(cat => battleSystem.applyWildNerf(cat));
    }

    // 3. Mark codex + quest
    codexSystem.markSeen(this.registry, this.enemyCat.id);
    if (!this.isTrainer) {
      questSystem.completeObjective(this.registry, "first_steps", "trigger_encounter");
    }

    // 4. Battle state
    this.isPlayerTurn = true;
    this.isBattleOver = false;
    this.isDefeated = false;
    this.canInput = true;
    this.evolutionHappened = false;
    this.oldCreatureId = null;

    this.trainerName = this.isTrainer && this.trainerId ? TRAINERS[this.trainerId].name : "";
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background (map-contextual)
    const bgMap = {
      starwhisk_village: { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      greenpaw_forest:  { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      mosslight_path:   { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      ancient_forest:   { back1: ASSETS.BATTLEBACKS1.GRASSLAND.KEY, back2: ASSETS.BATTLEBACKS2.FOREST.KEY },
      mosslight_shrine: { back1: ASSETS.BATTLEBACKS1.RUINS.KEY,     back2: ASSETS.BATTLEBACKS2.TEMPLE.KEY },
    };
    const mapId = this.registry.get("world_mapId") || "starwhisk_village";
    const bgs = bgMap[mapId] || bgMap.starwhisk_village;

    const back2 = this.add.image(width / 2, height / 2, bgs.back2);
    back2.setScale(Math.max(width / back2.width, height / back2.height));
    const back1 = this.add.image(width / 2, height / 2, bgs.back1);
    back1.setScale(Math.max(width / back1.width, height / back1.height));

    // Build UI
    battleUI.createBattleUI(this);

    // Trainer name label (top left)
    this.trainerNameText = this.add
      .text(20, 20, this.trainerName, {
        font: 'bold 24px "Press Start 2P", Courier',
        fill: "#f1c40f",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setVisible(false);

    // Hide UI until battle-start animation finishes
    this.playerUI.setVisible(false);
    this.enemyUI.setVisible(false);
    this.logBg.setVisible(false);
    this.logText.setVisible(false);
    this.menuUI.setVisible(false);

    // Battle-start flash animation
    const startSprite = this.add
      .image(width / 2, height / 2, ASSETS.SYSTEM.BATTLE_START.KEY)
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
      ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: startSprite,
            scale: targetScale * 1.2,
            alpha: 0,
            duration: 400,
            ease: "Power2",
            onComplete: () => {
              startSprite.destroy();
              this.playerUI.setVisible(true);
              this.enemyUI.setVisible(true);
              this.logBg.setVisible(true);
              this.logText.setVisible(true);
              if (this.isTrainer) this.trainerNameText.setVisible(true);

              import("../systems/audioManager.js").then(m => {
                const bgmMap = {
                  kyle: "bgm_battle_kyle",
                  sera: "bgm_battle_sera",
                  luke: "bgm_battle_luke",
                  guardian_rowan: "bgm_battle_rowan",
                  boss_hyunseok: "bgm_battle_hyunseok",
                };
                const bgmKey = this.isTrainer ? (bgmMap[this.trainerId] || "bgm_battle_wild") : "bgm_battle_wild";
                m.audioManager.playBGM(bgmKey);
              });

              this.updateLog(`야생의 ${koreanUtils.getPostPosition(this.enemyCat.name, "이")} 나타났다!`);
              this.time.delayedCall(1500, () => this.nextTurn());
            },
          });
        });
      },
    });
  }

  // ─── Action Dispatch ────────────────────────────────────────────────────

  handleAction(action) {
    if (!this.canInput || this.isBattleOver || !this.isPlayerTurn) return;

    this.canInput = false;
    this.menuUI.setVisible(false);

    switch (action) {
      case "공격": this.playerAttack(); break;
      case "스킬":
        this.skillMenuUI.setVisible(true);
        this.canInput = true;
        break;
      case "포획": this.playerCapture(); break;
      case "교체": battleUI.showSwapMenu(this); break;
      case "아이템": battleUI.showItemMenu(this); break;
      case "도망": this.playerRun(); break;
    }
  }

  // Thin delegates → battleActions
  playerAttack()                    { battleActions.playerAttack(this); }
  playerSkill(skillId)              { battleActions.playerSkill(this, skillId); }
  playerCapture()                   { battleActions.playerCapture(this); }
  playerRun()                       { battleActions.playerRun(this); }
  playerItemUse(itemId, healAmount) { battleActions.playerItemUse(this, itemId, healAmount); }
  swapActiveCat(newCat, isAuto)     { battleActions.swapActiveCat(this, newCat, isAuto); }
  enemyTurn()                       { battleActions.enemyTurn(this); }

  // ─── Turn Flow ──────────────────────────────────────────────────────────

  nextTurn() {
    if (this.isBattleOver) return;

    this.isPlayerTurn = !this.isPlayerTurn;
    this.canInput = this.isPlayerTurn;

    if (this.isPlayerTurn) {
      this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, "은")} 무엇을 할까?`);
      this.menuUI.setVisible(true);
    } else {
      this.enemyTurn();
    }
  }

  handlePlayerFaint() {
    this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, "이")} 쓰러졌다...`);

    const aliveCats = this.playerParty.filter(cat => cat.currentHp > 0);

    if (aliveCats.length > 0) {
      this.time.delayedCall(1500, () => this.swapActiveCat(aliveCats[0], true));
    } else {
      this.defeat();
    }
  }

  // ─── Victory / Defeat ──────────────────────────────────────────────────

  victory() {
    // Trainer still has more creatures → send the next one
    if (this.isTrainer && this.enemyParty.length > 1) {
      this.enemyParty.shift();
      this.enemyCat = this.enemyParty[0];
      codexSystem.markSeen(this.registry, this.enemyCat.id);

      this.updateLog(`트레이너가 ${koreanUtils.getPostPosition(this.enemyCat.name, "을")} 내보냈다!`);
      battleUI.refreshEnemyPanel(this);

      this.time.delayedCall(1500, () => {
        this.canInput = true;
        this.menuUI.setVisible(true);
        this.updateLog(`${koreanUtils.getPostPosition(this.playerCat.name, "은")} 무엇을 할까?`);
      });
      return;
    }

    this.isBattleOver = true;

    // Calculate rewards
    let expGain = battleSystem.calculateExp(this.enemyCat);
    let goldGain = 0;

    if (this.isTrainer) {
      const trainerData = TRAINERS[this.trainerId];
      expGain = Math.floor(expGain * (trainerData.rewards.expMultiplier || 1.5));
      goldGain = battleSystem.calculateGold(true, trainerData.rewards.gold);

      const defeatedTrainers = this.registry.get("defeatedTrainers") || [];
      if (!defeatedTrainers.includes(this.trainerId)) {
        defeatedTrainers.push(this.trainerId);
        this.registry.set("defeatedTrainers", defeatedTrainers);
      }

      if (trainerData.rewards.item) {
        const inventory = this.registry.get("playerInventory") || {};
        const itemId = trainerData.rewards.item;
        inventory[itemId] = (inventory[itemId] || 0) + 1;
        this.registry.set("playerInventory", inventory);
        import("../systems/audioManager.js").then(m => m.audioManager.playME("me_item_get", { duckBGM: true }));
      }
    } else {
      goldGain = battleSystem.calculateGold(false);
      if (legendarySystem.LEGENDARIES.includes(this.enemyCat.id)) {
        legendarySystem.markLegendaryCleared(this.registry, this.enemyCat.id);
      }
    }

    const currentGold = this.registry.get("playerGold") || 0;
    this.registry.set("playerGold", currentGold + goldGain);

    const oldStats = { hp: this.playerCat.maxHp, atk: this.playerCat.stats.attack, def: this.playerCat.stats.defense };
    const oldLevel = this.playerCat.level;
    const leveledUp = battleSystem.gainExp(this.playerCat, expGain);

    let oldCreatureId = this.playerCat.id;
    if (this.playerCat.readyToEvolve) {
      battleSystem.evolveCreature(this.playerCat);
      this.evolutionHappened = true;
    }

    this.registry.set("playerParty", this.playerParty);

    const collection = this.registry.get("playerCollection") || [];
    const collIndex = collection.findIndex(c => c.instanceId === this.playerCat.instanceId);
    if (collIndex !== -1) collection[collIndex] = this.playerCat;
    this.registry.set("playerCollection", collection);

    this.updateLog("배틀에서 승리했다!");

    import("../systems/audioManager.js").then(m => {
      const key = this.isTrainer ? "me_victory_trainer" : "me_victory_wild";
      m.audioManager.playME(key, { duckBGM: true });
    });

    if (leveledUp) {
      this.time.delayedCall(1000, () => {
        battleUI.playLevelUpAnimation(this, expGain, oldLevel, oldStats, this.evolutionHappened, goldGain, oldCreatureId);
      });
    } else {
      this.time.delayedCall(1500, () => {
        battleUI.showSummaryPanel(this, "승리", expGain, false, oldLevel, this.evolutionHappened, goldGain, oldStats, oldCreatureId);
      });
    }
  }

  defeat() {
    this.isBattleOver = true;
    this.isDefeated = true;
    this.registry.set("playerParty", this.playerParty);

    this.updateLog(`${this.playerCat.name}가 쓰러졌다...`);
    import("../systems/audioManager.js").then(m => m.audioManager.playME("me_game_over", { duckBGM: true }));

    this.time.delayedCall(1500, () => {
      battleUI.showSummaryPanel(this, "패배", 0, false, this.playerCat.level, false);
    });
  }

  // ─── End Battle ─────────────────────────────────────────────────────────

  endBattle() {
    this.registry.set("playerParty", this.playerParty);
    if (this.trainerNameText) this.trainerNameText.setVisible(false);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (this.isDefeated) {
        this.scene.start("GameOverScene");
        return;
      }

      const mapId = this.registry.get("world_mapId") || "starwhisk_village";
      const tx = this.registry.get("world_spawnX") || 10;
      const ty = this.registry.get("world_spawnY") || 10;
      saveSystem.saveData(this.registry, mapId, tx, ty);

      const goToWorld = () => {
        const data = {
          mapId: this.registry.get("world_mapId"),
          spawnX: this.registry.get("world_spawnX"),
          spawnY: this.registry.get("world_spawnY"),
        };
        if (this.trainerId === "boss_hyunseok") data.triggerPostClimax = true;
        this.scene.start("WorldScene", data);
      };

      if (this.evolutionHappened) {
        this.scene.start("EvolutionScene", {
          oldId: this.oldCreatureId,
          newId: this.playerCat.id,
          name: this.oldCreatureId,
          newName: this.playerCat.name,
          onComplete: goToWorld,
        });
      } else {
        goToWorld();
      }
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  updateLog(msg) {
    this.logText.setText(msg);
  }
}
