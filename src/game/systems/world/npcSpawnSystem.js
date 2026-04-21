import { NPCS } from "../../data/npcs.js";
import { ASSETS } from "../../config/assetPaths.js";
import { legendarySystem } from "../legendarySystem.js";
import { npcInteractionSystem } from "./npcInteractionSystem.js";
import { characterSystem } from "./characterSystem.js";

/**
 * npcSpawnSystem
 * NPC/herb spawning and quest indicator rendering for WorldScene.
 * All methods receive the WorldScene instance as `scene`.
 */
export const npcSpawnSystem = {

  /** Spawns all NPCs defined in the current map's spawn data. */
  createNPCs(scene) {
    scene.npcs = scene.add.group();
    scene.mapData.spawns.forEach((spawn) => {
      if (spawn.type !== "npc") return;

      let npcId = spawn.id;
      if (npcId === "mira") npcId = "elder_hyunseok";
      const npcData = NPCS[npcId];

      if (!npcData) {
        console.warn(`WorldScene: No data for NPC '${npcId}' in createNPCs. Skipping.`);
        return;
      }

      // --- Rowan Visibility Logic ---
      if (npcId === "trainer_guardian_rowan") {
        const isRowanDefeated = (scene.registry.get("defeatedTrainers") || []).includes("guardian_rowan");
        if (isRowanDefeated || scene.registry.get("chapter1_done")) return;
      }

      // --- Chief Hyunseok Visibility Logic ---
      if (npcId === "elder_hyunseok") {
        const isClimaxStarted = scene.registry.get("is_climax_battle") === true;
        const isRowanDefeated = (scene.registry.get("defeatedTrainers") || []).includes("guardian_rowan");

        if (scene.registry.get("chapter1_done")) {
          if (scene.mapId !== "starwhisk_village") return;
        } else if (isRowanDefeated) {
          if (scene.mapId === "mosslight_shrine") {
            // Spawn him at the altar
          } else if (scene.mapId === "starwhisk_village") {
            return;
          }
        } else if (isClimaxStarted && scene.mapId === "starwhisk_village") {
          return;
        }
      }

      // --- Ellie Visibility Logic ---
      if (npcId === "ellie") {
        const defeated = scene.registry.get("defeatedTrainers") || [];
        if (defeated.includes("ellie")) return;
      }

      // Determine sprite key and character block
      const spriteKey = npcData.sprite || "people1";
      const config =
        Object.values(ASSETS.CHARACTERS).find((c) => c.KEY === spriteKey) ||
        ASSETS.CHARACTERS.PEOPLE1;

      const characterIndex =
        npcData.characterIndex !== undefined
          ? npcData.characterIndex
          : config.CHARACTER_INDEX || 0;

      let nx = spawn.x;
      let ny = spawn.y;
      let finalSpriteKey = config.KEY;
      let finalCharIdx = characterIndex;

      // Custom positioning for Hyunseok based on story state
      if (npcId === "elder_hyunseok") {
        const isRowanDefeated = (scene.registry.get("defeatedTrainers") || []).includes("guardian_rowan");

        if (scene.registry.get("chapter1_done")) {
          nx = 2;
          ny = 16;
          finalSpriteKey = "people2";
          finalCharIdx = 0;
        } else if (isRowanDefeated && scene.mapId === "mosslight_shrine") {
          nx = 7;
          ny = 5;
          finalSpriteKey = "people4";
          finalCharIdx = 37;
        }
      }

      const npcFrames = characterSystem.getCharacterFrames(finalCharIdx);
      const startFrame = npcFrames.down[1];

      const npc = scene.add.sprite(
        nx * 32 + 16,
        (ny + 1) * 32,
        finalSpriteKey,
        startFrame,
      );
      npc.animFrames = npcFrames;
      npc.setOrigin(0.5, 1);
      npc.npcId = spawn.id;
      npc.tileX = nx;
      npc.tileY = ny;

      // Differentiate trainers with red tint
      if (npcData.role === "trainer" || npcData.role === "boss_trainer") {
        npc.setTint(0xff8888);
      }

      scene.npcs.add(npc);
    });

    // Dynamically inject Legendary Spawns (foreshadowing only for now)
    if (
      scene.mapId === "ancient_forest" &&
      legendarySystem.canSpawnLegendary(scene.registry, "VERDANTLYNX")
    ) {
      const lx = 20;
      const ly = 12;

      const legSprite = scene.add.sprite(lx * 32 + 16, (ly + 1) * 32, "creature_verdantlynx");
      legSprite.setOrigin(0.5, 1);
      legSprite.npcId = "legendary_verdantlynx";
      legSprite.tileX = lx;
      legSprite.tileY = ly;
      scene.npcs.add(legSprite);
    }
  },

  /** Spawns herb collectibles in herb-gathering quest maps. */
  spawnHerbs(scene) {
    const isGreenpaw = scene.mapId === "greenpaw_forest";
    const isMosslight = scene.mapId === "mosslight_path";
    if (!isGreenpaw && !isMosslight) return;

    const activeQuests = scene.registry.get("activeQuests") || {};
    const ts = activeQuests["quest_toby_supply"];
    if (!ts || ts.completed || ts.objectives[1].completed) return;

    let herbSpawnCoords = [];
    if (isGreenpaw) {
      herbSpawnCoords = [
        { x: 8, y: 8, id: "herb_1" },
        { x: 12, y: 12, id: "herb_2" },
        { x: 16, y: 10, id: "herb_3" },
      ];
    } else if (isMosslight) {
      herbSpawnCoords = [
        { x: 9, y: 9, id: "herb_m1" },
        { x: 16, y: 16, id: "herb_m2" },
        { x: 17, y: 11, id: "herb_m3" },
      ];
    }

    herbSpawnCoords.forEach((coord) => {
      if (scene.registry.get(`${coord.id}_picked`)) return;
      const herb = scene.add.sprite(coord.x * 32 + 16, coord.y * 32 + 16, "monster2", 0);
      herb.isHerb = true;
      herb.herbId = coord.id;
      herb.tileX = coord.x;
      herb.tileY = coord.y;
      scene.npcs.add(herb);
    });
  },

  /** Refreshes the floating ! / ? quest indicators above NPCs. */
  updateQuestIndicators(scene) {
    if (!scene.indicatorGroup || !scene.indicatorGroup.scene) {
      scene.indicatorGroup = scene.add.group();
    } else {
      try {
        scene.indicatorGroup.clear(true, true);
      } catch (e) {
        console.warn("WorldScene: Failed to clear indicatorGroup, recreating...", e);
        scene.indicatorGroup = scene.add.group();
      }
    }

    const activeQuests = scene.registry.get("activeQuests") || {};
    if (!scene.npcs) return;

    scene.npcs.getChildren().forEach((npcSprite) => {
      if (npcSprite.isHerb || npcSprite.npcId === "lost_cat") return;
      const npcId = npcSprite.npcId === "mira" ? "elder_hyunseok" : npcSprite.npcId;
      const status = npcInteractionSystem.getNpcQuestStatus(npcId, activeQuests);

      if (status) {
        const char = status === "available" ? "!" : "?";
        const indicator = scene.add
          .text(npcSprite.x, npcSprite.y - 40, char, {
            font: "bold 24px Arial",
            fill: "#f1c40f",
            stroke: "#000",
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(20);

        scene.tweens.add({
          targets: indicator,
          y: indicator.y - 10,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        scene.indicatorGroup.add(indicator);
      }
    });

    // Custom indicator for relic placement at the Altar
    if (scene.mapId === "mosslight_shrine") {
      const fa = activeQuests["forest_awakening"];
      if (
        fa && !fa.completed &&
        fa.objectives.find(o => o.id === "defeat_rowan").completed &&
        !fa.objectives.find(o => o.id === "use_relic").completed
      ) {
        const indicator = scene.add
          .text(7 * 32 + 16, 2 * 32 + 16 - 20, "?", {
            font: "bold 24px Arial",
            fill: "#f1c40f",
            stroke: "#000",
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(20);

        scene.tweens.add({
          targets: indicator,
          y: indicator.y - 10,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        scene.indicatorGroup.add(indicator);
      }
    }
  },
};
