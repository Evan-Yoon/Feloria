import { ASSETS } from "../../config/assetPaths.js";
import { NPCS } from "../../data/npcs.js";
import { questSystem } from "../questSystem.js";
import { cutsceneSystem } from "../cutsceneSystem.js";

/**
 * worldStorySystem
 * Story cutscene sequences and forced dialogue for WorldScene.
 * All methods receive the WorldScene instance as `scene`.
 */
export const worldStorySystem = {

  /** Triggers a forced dialogue with an NPC (used for intro / post-starter sequences). */
  triggerForcedDialogue(scene, npcId) {
    let npcData = NPCS[npcId];
    let customDialogue = null;

    if (npcId === "elder_hyunseok_gift") {
      npcData = NPCS["elder_hyunseok"];
      customDialogue = [
        "훌륭한 선택이구나! 그 고양이와 함께라면 숲의 뒤틀림도 해결할 수 있을 게야.",
        "자, 이건 내 선물이다.",
        "이걸 활용해서 더 많은 고양이를 잡게나. 더 필요하면 상점에서 살 수 있다네.",
      ];
    }

    if (!npcData) return;

    scene.isDialogueActive = true;
    scene.playerDir = "up";
    scene.player.setFrame(ASSETS.CHARACTERS.PLAYER.UP_FRAME || 1);

    scene.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: customDialogue || npcData.getDialogue(scene.registry),
        faceKey: npcData.faceKey,
        faceIndex: npcData.faceIndex || 0,
      },
      onComplete: () => {
        scene.isDialogueActive = false;

        if (npcId === "elder_hyunseok") {
          scene.isTransitioning = true;
          scene.registry.set("intro_started", true);
          questSystem.completeObjective(scene.registry, "first_steps", "talk_mira");
          scene.scene.start("StarterSelectScene");
        } else if (npcId === "elder_hyunseok_gift") {
          const inventory = scene.registry.get("playerInventory") || {};
          inventory["capture_crystal"] = (inventory["capture_crystal"] || 0) + 2;
          scene.registry.set("playerInventory", inventory);

          scene.events.emit("notifyItem", { message: `포획 크리스탈 x2 획득!`, color: 0x27ae60 });

          scene.registry.set("intro_done", true);

          const activeQuests = scene.registry.get("activeQuests") || {};
          if (activeQuests["first_steps"]) {
            questSystem.completeObjective(scene.registry, "first_steps", "talk_mira");
          }
        }
      },
    });
  },

  /**
   * Moves an NPC sprite to a target tile then plays a dialogue.
   * Primarily a utility for scripted cutscenes.
   */
  async playCutscene(scene, npcSprite, targetTileX, targetTileY, dialogueKey, onCompleteCallback) {
    scene.isDialogueActive = true;
    scene.player.play(`player_walk_${scene.playerDir}`, false).stop();
    scene.player.setFrame(scene.player.animFrames[scene.playerDir][1]);

    const tx = targetTileX * 32 + 16;
    const ty = (targetTileY + 1) * 32;

    const dx = targetTileX - npcSprite.tileX;
    const dy = targetTileY - npcSprite.tileY;
    let dir = "down";
    if (dx > 0) dir = "right";
    else if (dx < 0) dir = "left";
    else if (dy > 0) dir = "down";
    else if (dy < 0) dir = "up";

    npcSprite.play(`${npcSprite.npcId}_walk_${dir}`, true);

    await new Promise((resolve) => {
      scene.tweens.add({
        targets: npcSprite,
        x: tx,
        y: ty,
        duration: Math.abs(dx + dy) * scene.movementDuration * 1.5,
        onComplete: () => {
          npcSprite.stop();
          npcSprite.tileX = targetTileX;
          npcSprite.tileY = targetTileY;
          resolve();
        },
      });
    });

    const npcData = NPCS[npcSprite.npcId];
    scene.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: NPCS[dialogueKey]
          ? NPCS[dialogueKey].getDialogue(scene.registry)
          : npcData.getDialogue(scene.registry),
        faceKey: npcData.faceKey,
        faceIndex: npcData.faceIndex || 0,
      },
      onComplete: () => {
        scene.isDialogueActive = false;
        if (onCompleteCallback) onCompleteCallback();
        scene.updateQuestIndicators();
      },
    });
  },

  /** Spawns the lost cat in Mosslight Shrine with camera/audio dramatics. */
  async triggerLostCatEvent(scene) {
    scene.registry.set("lost_cat_event_triggered", true);
    cutsceneSystem.lockInput(scene);

    import("../audioManager.js").then((module) => {
      module.audioManager.playBGS("bgs_quake");
    });

    await cutsceneSystem.shakeCamera(scene, 2000, 0.02);

    const spawnX = 11, spawnY = 4;
    const cat = scene.add.sprite(spawnX * 32 + 16, (spawnY + 1) * 32, "animal", 40);
    cat.setOrigin(0.5, 1);
    cat.npcId = "lost_cat";
    cat.tileX = spawnX;
    cat.tileY = spawnY;
    scene.npcs.add(cat);

    await cutsceneSystem.panCameraTo(scene, cat.x, cat.y, 1000);

    import("../audioManager.js").then((module) => {
      module.audioManager.playSE("se_cat");
      module.audioManager.stopBGS();
    });

    await cutsceneSystem.delay(scene, 1000);
    await cutsceneSystem.restoreCameraToPlayer(scene, 1000);

    cutsceneSystem.unlockInput(scene);
    scene.updateQuestIndicators();
  },

  /** Rowan boss intro cutscene before the guardian battle. */
  async runMosslightBossIntro(scene) {
    const rowan = scene.npcs.getChildren().find((n) => n.npcId === "trainer_guardian_rowan");
    if (!rowan) return;

    cutsceneSystem.lockInput(scene);

    await cutsceneSystem.panCameraTo(scene, rowan.x, rowan.y * 32, 1500);
    await cutsceneSystem.delay(scene, 500);

    const npcData = NPCS["trainer_guardian_rowan"];
    await cutsceneSystem.playDialogue(scene, npcData.name, [
      "여기까지 온 것을 보니 실력은 인정하겠다.",
      "하지만 이곳은 신성한 신전이다.",
      "세계의 균형을 지키기 위해…",
      "나는 너를 막아야 한다.",
    ]);

    await cutsceneSystem.restoreCameraToPlayer(scene, 1500);

    scene.registry.set("boss_rowan_intro", true);
    cutsceneSystem.unlockInput(scene);

    scene.triggerTrainerBattle("guardian_rowan");
  },

  /** Climax sequence: Hyunseok reveals his betrayal and initiates the final boss battle. */
  async runClimaxSequence(scene) {
    scene.isDialogueActive = true;
    cutsceneSystem.lockInput(scene);

    const spawn = scene.mapData.spawns.find((s) => s.id === "trainer_guardian_rowan");
    const hyunseok = scene.add.sprite(spawn.x * 32 + 16, (spawn.y + 5) * 32, "people4", 37);
    hyunseok.setOrigin(0.5, 1);
    hyunseok.setAlpha(0);
    hyunseok.setDepth(11);

    await cutsceneSystem.panCameraTo(scene, hyunseok.x, hyunseok.y, 1000);

    scene.tweens.add({ targets: hyunseok, alpha: 1, duration: 1000 });
    await cutsceneSystem.delay(scene, 1000);

    await new Promise((resolve) => {
      scene.tweens.add({
        targets: hyunseok,
        y: (spawn.y + 2) * 32,
        duration: 2000,
        onComplete: resolve,
      });
    });

    const npcData = NPCS["boss_hyunseok_climax"];

    import("../audioManager.js").then((module) => {
      module.audioManager.playBGM("bgm_climax_event");
    });

    await cutsceneSystem.playDialogue(
      scene,
      npcData.name,
      npcData.getDialogue(scene.registry),
      npcData.faceKey,
      npcData.faceIndex,
    );

    scene.startQuest("climax_hyunseok_betrayal");
    scene.registry.set("is_climax_battle", true);
    scene.triggerTrainerBattle("boss_hyunseok");
  },

  /** Post-climax sequence: Hyunseok defeated, legendaries scatter, Chapter 1 ends. */
  async runPostClimaxSequence(scene) {
    scene.isDialogueActive = true;
    cutsceneSystem.lockInput(scene);

    const npcData = NPCS["boss_hyunseok_defeated"];
    await cutsceneSystem.playDialogue(
      scene,
      npcData.name,
      npcData.getDialogue(scene.registry),
      npcData.faceKey,
      npcData.faceIndex,
    );

    import("../audioManager.js").then((module) => {
      module.audioManager.playBGS("bgs_quake");
    });

    await cutsceneSystem.shakeCamera(scene, 3000, 0.05);

    // Legendary scatter effect
    const altarPxX = 7 * 32 + 16;
    const altarPxY = 2 * 32 + 16;
    const legendaries = [
      "creature_verdantlynx",
      "creature_embermane",
      "creature_floodlynx",
      "creature_voidlynx",
    ];

    legendaries.forEach((key, index) => {
      const sprite = scene.add.sprite(altarPxX, altarPxY, key);
      sprite.setDepth(20);
      sprite.setTintFill(0x000000);

      const angle = (Math.PI * 2 * index) / legendaries.length;
      const dist = 600;

      scene.tweens.add({
        targets: sprite,
        x: altarPxX + Math.cos(angle) * dist,
        y: altarPxY + Math.sin(angle) * dist,
        alpha: 0,
        duration: 4500,
        ease: "Cubic.easeOut",
        onComplete: () => sprite.destroy(),
      });
    });

    scene.cameras.main.flash(1000, 255, 255, 255);
    scene.updateLogText("전설의 고양이들이 대륙 곳곳으로 흩어졌습니다...");

    await cutsceneSystem.delay(scene, 4500);

    scene.cameras.main.fadeOut(2000, 0, 0, 0);
    scene.cameras.main.once("camerafadeoutcomplete", () => {
      scene.registry.set("chapter1_done", true);
      scene.registry.set("is_climax_battle", false);

      questSystem.completeObjective(scene.registry, "climax_hyunseok_betrayal", "defeat_hyunseok");

      import("../audioManager.js").then((module) => {
        module.audioManager.stopBGS();
      });

      scene.events.emit("notifyItem", {
        message: "=== 챕터 1 완료! ===\n대륙 곳곳으로 흩어진 전설의 고양이들을 찾아 다음 챕터를 준비하세요!",
        color: 0xf39c12,
      });

      scene.time.delayedCall(3000, () => {
        scene.scene.start("WorldScene", { mapId: "starwhisk_village", spawnX: 4, spawnY: 16 });
      });
    });
  },

  /** Foreshadowing cutscene when the player encounters a legendary creature sprite. */
  async triggerLegendaryEncounter(scene, sprite) {
    if (scene.isDialogueActive) return;
    scene.isDialogueActive = true;

    cutsceneSystem.lockInput(scene);

    await cutsceneSystem.panCameraTo(scene, sprite.x, sprite.y, 1500);

    scene.tweens.add({ targets: sprite, scale: 1.2, yoyo: true, duration: 300, repeat: 2 });

    await cutsceneSystem.shakeCamera(scene, 1000, 0.02);

    const roarText = scene.add
      .text(sprite.x, sprite.y - 40, "GROOOOAAAR!", {
        font: 'bold 24px "Press Start 2P", Courier',
        fill: "#e74c3c",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    await cutsceneSystem.delay(scene, 1500);
    roarText.destroy();

    await cutsceneSystem.restoreCameraToPlayer(scene, 1000);
    await cutsceneSystem.delay(scene, 1000);

    scene.tweens.add({
      targets: sprite,
      alpha: 0,
      y: sprite.y - 20,
      duration: 1000,
      onComplete: () => sprite.destroy(),
    });

    await cutsceneSystem.delay(scene, 1000);

    scene.isDialogueActive = false;
    cutsceneSystem.unlockInput(scene);
    // Note: Battle Scene is NOT launched here for foreshadowing (Chapter 1)
  },
};
