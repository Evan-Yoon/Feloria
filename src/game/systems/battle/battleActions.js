import { SKILLS } from "../../data/skills.js";
import { battleSystem } from "./battleSystem.js";
import { audioManager } from "../audioManager.js";
import { codexSystem } from "../codexSystem.js";
import { questSystem } from "../questSystem.js";
import { legendarySystem } from "../legendarySystem.js";
import { skillEffectSystem } from "../skillEffectSystem.js";
import { battleUI } from "./battleUI.js";
import { koreanUtils } from "../koreanUtils.js";

/**
 * battleActions
 * Executes player and enemy combat actions in BattleScene.
 * All methods receive the BattleScene instance as `scene`.
 */
export const battleActions = {

  // ─── Player Actions ───────────────────────────────────────────────────────

  /** Basic attack using the scratch move. */
  playerAttack(scene) {
    scene.canInput = false;
    scene.updateLog(`${koreanUtils.getPostPosition(scene.playerCat.name, "이")} 할퀴기를 사용했다!`);

    const { damage, multiplier } = battleSystem.calculateDamage(scene.playerCat, scene.enemyCat, "scratch");

    audioManager.playSE("se_attack_basic");
    skillEffectSystem.playEffect(scene, scene.enemySprite, "scratch", "노말", multiplier);

    scene.time.delayedCall(150, () => {
      battleUI.displayTypeFeedback(scene, multiplier);
      battleUI.applyDamage(scene, scene.enemyCat, damage, "enemy");
      if (scene.enemyCat.currentHp <= 0) {
        scene.victory();
      } else {
        scene.nextTurn();
      }
    });
  },

  /** Uses a learned skill by ID. */
  playerSkill(scene, skillId) {
    scene.canInput = false;
    const skill = SKILLS[skillId];
    if (!skill) return;

    scene.updateLog(`${koreanUtils.getPostPosition(scene.playerCat.name, "이")} ${koreanUtils.getPostPosition(skill.name, "을")} 사용했다!`);

    const { damage, multiplier } = battleSystem.calculateDamage(scene.playerCat, scene.enemyCat, skillId);

    audioManager.playSkillSE(skill.type);
    skillEffectSystem.playEffect(scene, scene.enemySprite, skillId, skill.type, multiplier);

    scene.time.delayedCall(800, () => {
      battleUI.displayTypeFeedback(scene, multiplier);
      battleUI.applyDamage(scene, scene.enemyCat, damage, "enemy");
      if (scene.enemyCat.currentHp <= 0) {
        scene.victory();
      } else {
        scene.nextTurn();
      }
    });
  },

  /** Attempts to capture the wild creature using a capture crystal. */
  playerCapture(scene) {
    if (scene.isTrainer) {
      scene.updateLog("트레이너의 고양이는 포획할 수 없습니다!");
      scene.time.delayedCall(1500, () => {
        scene.menuUI.setVisible(true);
        scene.canInput = true;
      });
      return;
    }

    const inventory = scene.registry.get("playerInventory") || {};
    const crystalCount = inventory["capture_crystal"] || 0;

    if (crystalCount <= 0) {
      scene.updateLog("포획 크리스탈이 부족합니다!");
      scene.time.delayedCall(1500, () => {
        scene.menuUI.setVisible(true);
        scene.canInput = true;
      });
      return;
    }

    inventory["capture_crystal"]--;
    scene.registry.set("playerInventory", inventory);
    scene.updateLog(`포획 크리스탈을 던졌다... (남은 개수: ${inventory["capture_crystal"]})`);

    scene.time.delayedCall(1000, () => {
      if (battleSystem.checkCapture(scene.enemyCat)) {
        scene.updateLog(`성공! ${koreanUtils.getPostPosition(scene.enemyCat.name, "을")} 포획했다!`);

        audioManager.playME("me_catch_success", { duckBGM: true });

        codexSystem.markCaught(scene.registry, scene.enemyCat.id);
        questSystem.completeObjective(scene.registry, "first_steps", "capture_cat");

        if (legendarySystem.LEGENDARIES.includes(scene.enemyCat.id)) {
          legendarySystem.markLegendaryCleared(scene.registry, scene.enemyCat.id);
        }

        const collection = scene.registry.get("playerCollection") || [];
        const expReward = Math.ceil(battleSystem.calculateExp(scene.enemyCat) * 1.5);

        collection.forEach(cat => battleSystem.gainExp(cat, expReward));

        if (!collection.find(c => c.instanceId === scene.enemyCat.instanceId)) {
          collection.push(scene.enemyCat);
          if (scene.playerParty.length < 3) {
            scene.playerParty.push(scene.enemyCat);
            scene.registry.set("playerParty", scene.playerParty);
          }
        }
        scene.registry.set("playerCollection", collection);
        scene.registry.set("playerParty", scene.playerParty);

        scene.time.delayedCall(2000, () => {
          scene.updateLog(`포획 보너스! 모든 보유 고양이가 ${expReward} EXP를 획득했습니다.`);
          battleUI.showSummaryPanel(scene, "포획", expReward, false, scene.playerCat.level, false, 0, null, null, true);
        });
      } else {
        scene.updateLog("야생 고양이가 빠져나왔다!");
        scene.time.delayedCall(1000, () => scene.nextTurn());
      }
    });
  },

  /** Flees from the current wild battle. */
  playerRun(scene) {
    if (scene.isTrainer) {
      scene.updateLog("트레이너 배틀에서는 도망칠 수 없습니다!");
      scene.time.delayedCall(1500, () => {
        scene.menuUI.setVisible(true);
        scene.canInput = true;
      });
      return;
    }

    scene.updateLog("도망쳤다...");
    scene.time.delayedCall(1000, () => {
      battleUI.showSummaryPanel(scene, "도주", 0, false, scene.playerCat.level, false);
    });
  },

  /** Uses a healing item on the active creature. */
  playerItemUse(scene, itemId, healAmount) {
    scene.canInput = false;

    const inventory = scene.registry.get("playerInventory") || {};
    inventory[itemId]--;
    scene.registry.set("playerInventory", inventory);

    scene.updateLog(`포션을 사용했다! ${scene.playerCat.name}의 체력이 회복되었다.`);
    scene.playerCat.currentHp = Math.min(scene.playerCat.maxHp, scene.playerCat.currentHp + healAmount);

    scene.playerHpText.setText(`HP: ${scene.playerCat.currentHp}/${scene.playerCat.maxHp}`);
    scene.playerHpBar.width = 260 * (scene.playerCat.currentHp / scene.playerCat.maxHp);

    audioManager.playSE("se_heal");
    skillEffectSystem.playEffect(scene, scene.playerSprite, "heal", "버프", 1);

    scene.time.delayedCall(1500, () => scene.nextTurn());
  },

  /** Swaps the active creature. `isAuto` = triggered by faint (no turn cost when true is wrong; see notes). */
  swapActiveCat(scene, newCat, isAuto) {
    scene.canInput = false;

    if (!isAuto) {
      scene.updateLog(`${koreanUtils.getPostPosition(scene.playerCat.name, "을")} 들이고 ${koreanUtils.getPostPosition(newCat.name, "을")} 내보냈다!`);
    } else {
      scene.updateLog(`${koreanUtils.getPostPosition(newCat.name, "이")} 전투에 나섰다!`);
    }

    audioManager.playSE("se_heal");

    scene.playerCat = newCat;
    battleUI.refreshPlayerPanel(scene);

    scene.playerSprite.setAlpha(0);
    scene.tweens.add({
      targets: scene.playerSprite,
      alpha: 1,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        scene.time.delayedCall(500, () => scene.nextTurn());
      },
    });
  },

  // ─── Enemy AI ─────────────────────────────────────────────────────────────

  /** Simple enemy AI: 80% chance to use a random skill, 20% basic attack. */
  enemyTurn(scene) {
    const enemySkills = scene.enemyCat.skills || [];
    const useSkill = Math.random() < 0.8 && enemySkills.length > 0;

    if (useSkill) {
      const skillId = enemySkills[Math.floor(Math.random() * enemySkills.length)];
      const skill = SKILLS[skillId];
      if (skill) {
        scene.updateLog(`${koreanUtils.getPostPosition(scene.enemyCat.name, "이")} ${koreanUtils.getPostPosition(skill.name, "을")} 사용했다!`);

        const { damage, multiplier } = battleSystem.calculateDamage(scene.enemyCat, scene.playerCat, skillId);
        audioManager.playSkillSE(skill.type);
        skillEffectSystem.playEffect(scene, scene.playerSprite, skillId, skill.type, multiplier);

        scene.time.delayedCall(1000, () => {
          battleUI.displayTypeFeedback(scene, multiplier);
          battleUI.applyDamage(scene, scene.playerCat, damage, "player");
          if (scene.playerCat.currentHp <= 0) {
            scene.handlePlayerFaint();
          } else {
            scene.nextTurn();
          }
        });
        return;
      }
    }

    // Fallback: basic attack
    scene.updateLog(`${koreanUtils.getPostPosition(scene.enemyCat.name, "이")} 할퀴기를 사용했다!`);
    const { damage, multiplier } = battleSystem.calculateDamage(scene.enemyCat, scene.playerCat, "scratch");

    audioManager.playSE("se_attack_basic");
    skillEffectSystem.playEffect(scene, scene.playerSprite, "scratch", "노말", multiplier);

    scene.time.delayedCall(400, () => {
      battleUI.displayTypeFeedback(scene, multiplier);
      battleUI.applyDamage(scene, scene.playerCat, damage, "player");
      if (scene.playerCat.currentHp <= 0) {
        scene.handlePlayerFaint();
      } else {
        scene.nextTurn();
      }
    });
  },
};
