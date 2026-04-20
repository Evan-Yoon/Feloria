import { NPCS } from "../../data/npcs.js";
import { questSystem } from "../questSystem.js";
import { audioManager } from "../audioManager.js";

/**
 * npcInteractionSystem
 * Handles NPC interaction dispatching, quest status, and NPC role behaviour.
 * All methods receive the WorldScene instance as `scene` to access Phaser state.
 */
export const npcInteractionSystem = {

  /** Returns "available", "ready", "complete", or null for the given NPC. */
  getNpcQuestStatus(npcId, activeQuests) {
    const fs = activeQuests["first_steps"];
    const ts = activeQuests["quest_toby_supply"];
    const lc = activeQuests["quest_lina_lost_cat"];
    const sb = activeQuests["quest_sera_blockade"];
    const ld = activeQuests["quest_luke_despair"];
    const cr = activeQuests["quest_chiefs_relic"];
    const fa = activeQuests["forest_awakening"];

    // 1. First Steps Quest (Chief Hyunseok)
    if (!fs && npcId === "elder_hyunseok") return "available";
    if (fs && !fs.completed && fs.objectives.find((o) => o.id === "capture_cat").completed && npcId === "elder_hyunseok") return "ready";

    // 2. Toby Supply Quest (Shopkeeper)
    if (ts && !ts.objectives.find((o) => o.id === "talk_toby").completed && npcId === "shopkeeper") return "available";
    if (ts && !ts.completed && ts.objectives[1].completed && npcId === "shopkeeper") return "ready";

    // 3. Lina Lost Cat Quest (Villager1)
    if (!lc && ts && ts.completed && npcId === "villager1") return "available";
    if (lc && !lc.completed && lc.objectives[1].completed && npcId === "villager1") return "ready";

    // 4. Sera Blockade Quest (Chief -> Sera -> Chief)
    if (!sb && lc && lc.completed && npcId === "elder_hyunseok") return "available";
    if (sb && !sb.completed && !sb.objectives.find(o => o.id === "defeat_sera").completed && npcId === "trainer_sera") return "ready";
    if (sb && !sb.completed && sb.objectives.find(o => o.id === "defeat_sera").completed && !sb.objectives.find(o => o.id === "report_chief").completed && npcId === "elder_hyunseok") return "ready";

    // 5. Luke Despair Quest (Chief -> Luke -> Chief)
    if (!ld && sb && sb.completed && npcId === "elder_hyunseok") return "available";
    if (ld && !ld.completed && !ld.objectives.find(o => o.id === "defeat_luke").completed && npcId === "trainer_luke") return "ready";
    if (ld && !ld.completed && ld.objectives.find(o => o.id === "defeat_luke").completed && !ld.objectives.find(o => o.id === "report_chief").completed && npcId === "elder_hyunseok") return "ready";

    // 6. Chief's Relic Quest (Chief)
    if (!cr && ld && ld.completed && npcId === "elder_hyunseok") return "available";
    if (cr && !cr.completed && cr.objectives[0].completed && npcId === "elder_hyunseok") return "ready";
    if (cr && !cr.completed && !cr.objectives[0].completed && npcId === "elder_hyunseok") return "ready";

    // 7. Forest Awakening Quest
    if (fa && !fa.completed && fa.objectives.find(o => o.id === "enter_ancient_forest").completed && !fa.objectives.find(o => o.id === "defeat_rowan").completed && npcId === "trainer_guardian_rowan") return "ready";
    if (fa && !fa.completed && !fa.objectives.find(o => o.id === "defeat_rowan").completed && npcId === "ellie") return "complete";

    return null;
  },

  /** Main SPACE-key interaction handler. */
  handleInteraction(scene) {
    if (scene.isTransitioning || scene.isMoving || scene.isDialogueActive) return;

    let targetX = scene.player.tileX;
    let targetY = scene.player.tileY;

    if (scene.playerDir === "left") targetX--;
    else if (scene.playerDir === "right") targetX++;
    else if (scene.playerDir === "up") targetY--;
    else if (scene.playerDir === "down") targetY++;

    // Relic usage check at Shrine Altar
    if (scene.mapId === "mosslight_shrine" && targetY <= 2) {
      const activeQuests = scene.registry.get("activeQuests") || {};
      const fa = activeQuests["forest_awakening"];
      if (
        fa && !fa.completed &&
        fa.objectives.find(o => o.id === "defeat_rowan").completed &&
        !fa.objectives.find(o => o.id === "use_relic").completed
      ) {
        questSystem.completeObjective(scene.registry, "forest_awakening", "use_relic");

        scene.events.emit("notifyItem", {
          message: "신전의 중심부에서 정화의 유물을 조율합니다...",
          color: 0x3498db,
        });

        setTimeout(() => {
          scene.runClimaxSequence();
        }, 1500);

        return;
      }
    }

    // Find NPC at target tile
    let npcSprite = scene.npcs
      .getChildren()
      .find((n) => n.tileX === targetX && n.tileY === targetY);

    // Custom check for prison bars interaction (interact across rock)
    if (!npcSprite && scene.mapId === "starwhisk_village") {
      let farX = targetX;
      let farY = targetY;
      if (scene.playerDir === "left") farX--;
      else if (scene.playerDir === "right") farX++;
      else if (scene.playerDir === "up") farY--;
      else if (scene.playerDir === "down") farY++;

      const farNpc = scene.npcs
        .getChildren()
        .find(
          (n) =>
            n.tileX === farX &&
            n.tileY === farY &&
            (n.npcId === "elder_hyunseok" || n.npcId === "mira")
        );

      if (farNpc) npcSprite = farNpc;
    }

    if (!npcSprite) return;

    if (npcSprite.isHerb) {
      npcInteractionSystem.collectHerb(scene, npcSprite);
      return;
    }

    if (npcSprite.npcId === "lost_cat") {
      npcInteractionSystem.handleLostCatPickup(scene, npcSprite);
      return;
    }

    let npcId = npcSprite.npcId;
    if (npcId === "mira") npcId = "elder_hyunseok";

    const npcData = NPCS[npcId];
    if (!npcData) {
      console.warn(`WorldScene: NPC ID '${npcId}' not found in npcs.js`);
      return;
    }

    scene.isDialogueActive = true;

    // Automatic Quest Start Logic
    const activeQuests = scene.registry.get("activeQuests") || {};
    const status = npcInteractionSystem.getNpcQuestStatus(npcId, activeQuests);
    if (status === "available") {
      if (npcId === "shopkeeper")
        questSystem.startQuest(scene.registry, "quest_toby_supply");
      else if (npcId === "villager1")
        questSystem.startQuest(scene.registry, "quest_lina_lost_cat");
      else if (npcId === "elder_hyunseok") {
        const lc = questSystem.getQuest(scene.registry, "quest_lina_lost_cat");
        const ld = questSystem.getQuest(scene.registry, "quest_luke_despair");
        if (lc?.completed)
          questSystem.startQuest(scene.registry, "quest_sera_blockade");
        else if (ld?.completed)
          questSystem.startQuest(scene.registry, "quest_chiefs_relic");
      } else if (npcId === "trainer_luke") {
        questSystem.startQuest(scene.registry, "quest_luke_despair");
      }
    }

    let pages = npcData.getDialogue(scene.registry);

    // Pre-dialogue objective triggers
    if (npcData.id === "Chief Hyunseok") {
      const quest = questSystem.getQuest(scene.registry, "first_steps");
      if (quest && !quest.objectives.find((o) => o.id === "talk_mira").completed) {
        questSystem.completeObjective(scene.registry, "first_steps", "talk_mira");
      } else if (quest && quest.objectives.find((o) => o.id === "capture_cat").completed) {
        questSystem.completeObjective(scene.registry, "first_steps", "return_mira");
      }

      const seraQuest = questSystem.getQuest(scene.registry, "quest_sera_blockade");
      const lukeQuest = questSystem.getQuest(scene.registry, "quest_luke_despair");
      const relicQuest = questSystem.getQuest(scene.registry, "quest_chiefs_relic");

      if (seraQuest && !seraQuest.completed) {
        questSystem.completeObjective(scene.registry, "quest_sera_blockade", "talk_chief");
      } else if (lukeQuest && !lukeQuest.completed && lukeQuest.objectives.find(o => o.id === "defeat_luke").completed) {
        questSystem.completeObjective(scene.registry, "quest_luke_despair", "report_chief");
      } else if (relicQuest && !relicQuest.completed) {
        questSystem.completeObjective(scene.registry, "quest_chiefs_relic", "receive_relic");
      }
    } else if (npcId === "shopkeeper") {
      const quest = questSystem.getQuest(scene.registry, "quest_toby_supply");
      if (quest) {
        if (!quest.objectives[0].completed) {
          questSystem.completeObjective(scene.registry, "quest_toby_supply", "talk_toby");
          scene.wasQuestUpdatedInInteraction = true;
        } else if (quest.objectives[1].completed && !quest.objectives[2].completed) {
          questSystem.completeObjective(scene.registry, "quest_toby_supply", "return_toby");
          scene.wasQuestUpdatedInInteraction = true;
        }
      }
    } else if (npcId === "villager1") {
      const quest = questSystem.getQuest(scene.registry, "quest_lina_lost_cat");
      if (quest) {
        if (!quest.objectives[0].completed) {
          questSystem.completeObjective(scene.registry, "quest_lina_lost_cat", "talk_lina");
        } else if (quest.objectives[1].completed && !quest.objectives[2].completed) {
          questSystem.completeObjective(scene.registry, "quest_lina_lost_cat", "return_lina");
        }
      }
    }

    // NPC looks at player
    const oppDir = { up: "down", down: "up", left: "right", right: "left" };
    npcSprite.setFrame(npcSprite.animFrames[oppDir[scene.playerDir]][1]);

    scene.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: pages,
        faceKey: npcData.faceKey,
        faceIndex: npcData.faceIndex || 0,
      },
      onComplete: () => {
        scene.isDialogueActive = false;
        npcInteractionSystem.processNpcRole(scene, npcSprite, npcData);
        scene.wasQuestUpdatedInInteraction = false;
        scene.updateQuestIndicators();
      },
    });
  },

  /** Dispatches post-dialogue behaviour based on the NPC's role. */
  processNpcRole(scene, npcSprite, npcData) {
    let currentRole = npcData.role;

    if (npcSprite.npcId === "eugene" && scene.registry.get("chapter1_done")) {
      currentRole = "healer_quest";
    } else if (
      (npcSprite.npcId === "mira" || npcSprite.npcId === "elder_hyunseok") &&
      scene.registry.get("chapter1_done")
    ) {
      currentRole = "prison";
    }

    switch (currentRole) {
      case "healer_quest": {
        scene.healParty();
        const qH = scene.registry.get("activeQuests") || {};
        const firstSteps = qH["first_steps"];
        const seraBlockade = qH["quest_sera_blockade"];
        const lukeDespair = qH["quest_luke_despair"];

        if (firstSteps && !firstSteps.completed && firstSteps.objectives.find((o) => o.id === "return_mira").completed) {
          questSystem.completeObjective(scene.registry, "first_steps", "return_mira");
          scene.events.emit("notifyItem", { message: "새로운 퀘스트: 숲의 각성", color: 0xf1c40f });
        }

        if (seraBlockade && !seraBlockade.completed && seraBlockade.objectives.find(o => o.id === "defeat_sera").completed) {
          questSystem.completeObjective(scene.registry, "quest_sera_blockade", "report_chief");
        }

        if (lukeDespair && !lukeDespair.completed && lukeDespair.objectives.find(o => o.id === "defeat_luke").completed) {
          questSystem.completeObjective(scene.registry, "quest_luke_despair", "report_chief");
        }

        if (!qH["quest_toby_supply"] && qH["first_steps"]?.completed) {
          scene.startQuest("quest_toby_supply");
        } else if (qH["quest_toby_supply"]?.completed && qH["quest_lina_lost_cat"]?.completed && !qH["quest_sera_blockade"]) {
          scene.startQuest("quest_sera_blockade");
        } else if (qH["quest_sera_blockade"]?.completed && !qH["quest_luke_despair"]) {
          scene.startQuest("quest_luke_despair");
        } else if (qH["quest_luke_despair"]?.completed && !qH["quest_chiefs_relic"]) {
          scene.startQuest("quest_chiefs_relic");
        } else if (qH["quest_chiefs_relic"]?.objectives[0].completed) {
          if (!(scene.registry.get("playerInventory") || {}).purification_relic) {
            scene.registry.set("playerInventory", {
              ...scene.registry.get("playerInventory"),
              purification_relic: 1,
            });
            scene.events.emit("notifyItem", { message: "정화의 유물을 획득했습니다!", color: 0x3498db });
          }
          if (!qH["forest_awakening"]) scene.startQuest("forest_awakening");
        }
        break;
      }
      case "shopkeeper":
        if (scene.wasQuestUpdatedInInteraction) return;
        scene.scene.pause();
        scene.scene.launch("ShopScene");
        break;
      case "trainer":
      case "boss_trainer": {
        if (scene.isPartyDead()) {
          scene.events.emit("notifyItem", {
            message: `모든 고양이가 쓰러졌습니다! 촌장 현석에게 치료를 받으세요.`,
            color: 0xe74c3c,
          });
          return;
        }
        const defeated = scene.registry.get("defeatedTrainers") || [];
        if (!defeated.includes(npcData.trainerId)) {
          const activeQuests = scene.registry.get("activeQuests") || {};

          // Trainers that only battle under quest conditions
          const questBattleCheck = {
            ellie: () => { const q = activeQuests["forest_awakening"]; return !q || q.completed; },
            sera: () => { const q = activeQuests["quest_sera_blockade"]; return !q || q.completed || q.objectives.find(o => o.id === "defeat_sera").completed; },
            luke: () => { const q = activeQuests["quest_luke_despair"]; return !q || q.completed || q.objectives.find(o => o.id === "defeat_luke").completed; },
          };

          const skipBattle = questBattleCheck[npcData.trainerId];
          if (skipBattle && skipBattle()) {
            scene.scene.launch("DialogScene", {
              dialogue: {
                name: npcData.name,
                pages: npcData.getDialogue(scene.registry),
                faceKey: npcData.faceKey,
                faceIndex: npcData.faceIndex || 0,
              },
              onComplete: () => {
                scene.isDialogueActive = false;
                scene.updateQuestIndicators();
              },
            });
            return;
          }

          scene.isTransitioning = true;
          scene.triggerTrainerBattle(npcData.trainerId);
        }
        break;
      }
      case "lore_npc":
        // Handled via dialogue only; quest flow managed elsewhere
        break;
      default: {
        const q = scene.registry.get("activeQuests") || {};
        if (npcData.id === "Chief Hyunseok") {
          if (!q["quest_toby_supply"] && q["first_steps"]?.completed) {
            scene.startQuest("quest_toby_supply");
          } else if (q["quest_toby_supply"]?.completed && q["quest_lina_lost_cat"]?.completed && !q["quest_sera_blockade"]) {
            scene.startQuest("quest_sera_blockade");
          } else if (q["quest_sera_blockade"]?.completed && !q["quest_luke_despair"]) {
            scene.startQuest("quest_luke_despair");
          } else if (q["quest_luke_despair"]?.completed && !q["quest_chiefs_relic"]) {
            scene.startQuest("quest_chiefs_relic");
          } else if (q["quest_chiefs_relic"]?.objectives[0].completed) {
            if (!(scene.registry.get("playerInventory") || {}).purification_relic) {
              scene.registry.set("playerInventory", {
                ...scene.registry.get("playerInventory"),
                purification_relic: 1,
              });
              scene.events.emit("notifyItem", { message: "정화의 유물을 획득했습니다!", color: 0x3498db });
            }
            if (!q["forest_awakening"]) scene.startQuest("forest_awakening");
          }
        } else if (npcData.id === "shopkeeper") {
          if (q["quest_toby_supply"]) {
            questSystem.completeObjective(scene.registry, "quest_toby_supply", "talk_toby");
            if (q["quest_toby_supply"].objectives[1].completed) {
              questSystem.completeObjective(scene.registry, "quest_toby_supply", "return_toby");
            }
          }
        } else if (npcData.id === "villager1") {
          if (q["quest_lina_lost_cat"]) {
            questSystem.completeObjective(scene.registry, "quest_lina_lost_cat", "talk_lina");
            if (q["quest_lina_lost_cat"].objectives[1].completed) {
              questSystem.completeObjective(scene.registry, "quest_lina_lost_cat", "return_lina");
            }
          } else if (q["quest_toby_supply"]?.completed) {
            scene.startQuest("quest_lina_lost_cat");
          }
        } else if (npcData.id === "trainer_sera") {
          if (q["quest_sera_blockade"] && !q["quest_luke_despair"]) {
            scene.startQuest("quest_luke_despair");
          }
        }
        break;
      }
    }
  },

  /** Collects a herb item sprite and updates the herb-gathering quest. */
  collectHerb(scene, herbSprite) {
    scene.registry.set(`${herbSprite.herbId}_picked`, true);

    audioManager.playME("me_item_get");

    scene.events.emit("notifyItem", { message: "신비한 약초를 채집했습니다!", color: 0x2ecc71 });

    const activeQuests = scene.registry.get("activeQuests") || {};
    const ts = activeQuests["quest_toby_supply"];
    if (ts && ts.objectives[1].count < 3) {
      ts.objectives[1].count = (ts.objectives[1].count || 0) + 1;
      ts.objectives[1].text = `[그린포우 숲] 신비한 약초 3개 채집하기 (${ts.objectives[1].count}/3)`;
      scene.registry.set("activeQuests", activeQuests);

      if (ts.objectives[1].count >= 3) {
        questSystem.completeObjective(scene.registry, "quest_toby_supply", "collect_herbs");
      } else {
        const uiScene = scene.scene.manager.getScene("UIScene");
        if (uiScene) uiScene.events.emit("updateQuests");
      }
    }

    herbSprite.destroy();
    scene.updateQuestIndicators();
  },

  /** Handles picking up the lost cat during the Lina quest. */
  handleLostCatPickup(scene, catSprite) {
    scene.isDialogueActive = true;
    audioManager.playSE("se_cat");

    scene.events.emit("notifyItem", { message: "고양이를 발견하여 품에 안았습니다!", color: 0x2ecc71 });

    questSystem.completeObjective(scene.registry, "quest_lina_lost_cat", "find_cat");

    catSprite.destroy();
    scene.isDialogueActive = false;
    scene.updateQuestIndicators();
  },
};
