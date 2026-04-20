import Phaser from "phaser";
import { ASSETS } from "../config/assetPaths.js";
import { mapLoader } from "../systems/mapLoader.js";
import { saveSystem } from "../systems/saveSystem.js";
import { encounterSystem } from "../systems/encounterSystem.js";
import { questSystem } from "../systems/questSystem.js";
import { TRAINERS } from "../data/trainers.js";
import { NPCS } from "../data/npcs.js";
import { cutsceneSystem } from "../systems/cutsceneSystem.js";
import { legendarySystem } from "../systems/legendarySystem.js";
import { npcInteractionSystem } from "../systems/npcInteractionSystem.js";
import { worldStorySystem } from "../systems/worldStorySystem.js";

/**
 * WorldScene
 * The main top-down exploration scene.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: "WorldScene" });
  }

  init(data) {
    // Current map configuration
    this.mapId = data.mapId || "starwhisk_village";
    this.spawnX = data.spawnX; // Tile X
    this.spawnY = data.spawnY; // Tile Y

    // Movement state
    this.isMoving = false;
    this.movementDuration = 150; // ms per tile (Faster movement)
    this.playerDir = "down";

    // Interaction lock
    this.isDialogueActive = false;
    this.isTransitioning = false;
    this.isEncounterTriggered = false;
    this.wasQuestUpdatedInInteraction = false;
  }

  preload() {
    // In Phase 6, we load map data dynamically or ensure it was preloaded
    mapLoader.preloadMap(this, "starwhisk_village");
    mapLoader.preloadMap(this, "greenpaw_forest");
    mapLoader.preloadMap(this, "mosslight_path");
    mapLoader.preloadMap(this, "ancient_forest");
    mapLoader.preloadMap(this, "mosslight_shrine");
  }

  create(data = {}) {

    // 0. Initialize Inputs Early (Prevents 'left' of undefined if create() returns early)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");

    // 1. Load Map
    this.mapData = mapLoader.createMap(this, this.mapId);
    if (!this.mapData) {
      console.error(`WorldScene: Critical error - mapData failed for ${this.mapId}`);
      this.scene.start("StartScene"); // Fallback to safe scene
      return;
    }

    // 1.5 Render Village Prison
    if (this.mapId === "starwhisk_village") {
      const ground = this.mapData.layers.groundLayer;
      const collision = this.mapData.layers.collisionLayer;
      const rocks = [
        { x: 1, y: 15 },
        { x: 2, y: 15 },
        { x: 3, y: 15 },
        { x: 1, y: 16 },
        { x: 3, y: 16 },
        { x: 1, y: 17 },
        { x: 3, y: 17 },
      ];
      rocks.forEach((pos) => {
        if (ground) this.mapData.map.putTileAt(4, pos.x, pos.y, true, ground);
        if (collision) this.mapData.map.putTileAt(4, pos.x, pos.y, true, collision);
      });
    }

    // Quest Check: Enter Forest
    if (this.mapId === "greenpaw_forest") {
      questSystem.completeObjective(this.registry, "first_steps", "enter_forest");
    }

    // 2. Set Camera Bounds
    if (this.mapData.widthInPixels && this.mapData.heightInPixels) {
      this.cameras.main.setBounds(0, 0, this.mapData.widthInPixels, this.mapData.heightInPixels);
    }

    // 3. Create Player
    this.createPlayer();

    // 4. Create NPCs
    this.createNPCs();

    // 4.5. Initialize Indicator Group
    this.indicatorGroup = this.add.group();

    // 5. Input Handling
    this.input.keyboard.on("keydown-SPACE", () => npcInteractionSystem.handleInteraction(this));
    this.input.keyboard.on("keydown-ESC", () => this.openMenu());
    this.input.keyboard.on("keydown-ENTER", () => this.openMenu());
    this.input.keyboard.on("keydown-C", () => this.openCodex());

    // 6. Camera Follow
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2);

    // 7. Map Name UI
    if (!this.scene.isActive("UIScene")) {
      this.scene.launch("UIScene");
    }

    this.time.delayedCall(10, () => {
      this.events.emit("displayMapName", this.mapData.name);

      // --- Map BGM Integration ---
      import("../systems/audioManager.js").then((module) => {
        const bgmMap = {
          starwhisk_village: "bgm_village",
          greenpaw_forest: "bgm_forest_greenpaw",
          mosslight_path: "bgm_path_mosslight",
          ancient_forest: "bgm_forest_ancient",
          mosslight_shrine: "bgm_shrine_mosslight",
        };
        const bgmKey = bgmMap[this.mapId] || "bgm_village";
        module.audioManager.setMapBGM(bgmKey);

        if (!data.triggerClimax && !data.triggerPostClimax) {
          module.audioManager.resumeMapBGM(1000);
        }
      });

      if (data.triggerClimax) {
        this.runClimaxSequence();
      } else if (data.triggerPostClimax) {
        this.runPostClimaxSequence();
      } else {
        this.checkStoryTriggers(data);
      }

      this.updateQuestIndicators();
      this.spawnHerbs();
    });
  }

  checkStoryTriggers(data) {
    const introDone = this.registry.get("intro_done");

    // Start first quest automatically if not done
    if (!introDone && !this.registry.get("intro_started")) {
      questSystem.startQuest(this.registry, "first_steps");
    }

    // 1. Initial Intro (Talk to Chief)
    if (
      this.mapId === "starwhisk_village" &&
      !introDone &&
      !this.registry.get("intro_started")
    ) {
      this.time.delayedCall(500, () => {
        worldStorySystem.triggerForcedDialogue(this, "elder_hyunseok");
      });
      return;
    }

    // 2. Post-Starter Dialogue
    if (data.intro_phase === "received_starter" && !introDone) {
      this.time.delayedCall(500, () => {
        worldStorySystem.triggerForcedDialogue(this, "elder_hyunseok_gift");
      });
      return;
    }

    // Existing Quest/Legendary checks
    if (this.mapId === "mosslight_path") {
      questSystem.completeObjective(this.registry, "forest_awakening", "explore_path");
    } else if (this.mapId === "ancient_forest") {
      questSystem.completeObjective(this.registry, "forest_awakening", "enter_ancient_forest");

      const ld = this.registry.get("activeQuests")?.["quest_luke_despair"];
      if (ld && !ld.completed) {
        questSystem.completeObjective(this.registry, "quest_luke_despair", "reach_ancient_forest");
      }
    }

    // Auto-complete Defeat Tasks upon returning to Map
    const defeated = this.registry.get("defeatedTrainers") || [];
    const activeQuests = this.registry.get("activeQuests") || {};

    if (defeated.includes("sera") && activeQuests["quest_sera_blockade"]) {
      questSystem.completeObjective(this.registry, "quest_sera_blockade", "defeat_sera");
    }

    if (defeated.includes("luke") && activeQuests["quest_luke_despair"]) {
      questSystem.completeObjective(this.registry, "quest_luke_despair", "defeat_luke");
    }

    if (defeated.includes("guardian_rowan") && activeQuests["forest_awakening"]) {
      const isComplete = questSystem.completeObjective(this.registry, "forest_awakening", "defeat_rowan");
      if (isComplete) {
        setTimeout(() => {
          this.events.emit("notifyItem", {
            message: "신전 중심부(최상단)로 이동해 [Spacebar]로 정화의 유물을 조율하세요.",
            color: 0x3498db,
          });
        }, 1000);
      }
    }

    legendarySystem.applyWorldEffects(this);
  }

  openMenu() {
    if (this.isDialogueActive || this.isMoving) return;
    this.events.emit("hideMapName");
    this.scene.pause();
    this.scene.launch("MenuScene");
  }

  openCodex() {
    if (this.isDialogueActive || this.isMoving) return;
    this.events.emit("hideMapName");
    this.scene.pause();
    this.scene.launch("CodexScene");
  }

  /**
   * Spawns the player at the correct tile position.
   */
  createPlayer() {
    const config = ASSETS.CHARACTERS.PLAYER;
    const spawn = this.mapData.spawns.find((s) => s.type === "player");
    const isInitialSpawn =
      this.mapId === "starwhisk_village" && !this.registry.get("intro_done");

    const tx =
      this.spawnX !== undefined
        ? this.spawnX
        : isInitialSpawn
          ? 10
          : spawn
            ? spawn.x
            : 10;
    const ty =
      this.spawnY !== undefined
        ? this.spawnY
        : isInitialSpawn
          ? 9
          : spawn
            ? spawn.y
            : 10;

    const frames = this.getCharacterFrames(config.KEY, config.CHARACTER_INDEX);
    const startFrame = frames.down[1];

    this.player = this.add.sprite(tx * 32 + 16, (ty + 1) * 32, config.KEY, startFrame);
    this.player.setOrigin(0.5, 1);
    this.player.setDepth(10);
    this.player.tileX = tx;
    this.player.tileY = ty;
    this.player.animFrames = frames;

    this.createCharacterAnims(this.player, "player", frames);
  }

  /**
   * RPG Maker character sheet helper
   * Sheet usually 4x2 blocks of 3x4 frames
   */
  getCharacterFrames(textureKey, charIndex) {
    // Standard RPG Maker MV Actor sheet: 4x2 character blocks, 3x4 frames each = 12 cols, 8 rows
    const sheetCols = 12;

    const blocksPerRow = 4;
    const blockX = charIndex % blocksPerRow;
    const blockY = Math.floor(charIndex / blocksPerRow);

    const startX = blockX * 3;
    const startY = blockY * 4;

    const frames = {
      down: [
        (startY + 0) * sheetCols + startX,
        (startY + 0) * sheetCols + startX + 1,
        (startY + 0) * sheetCols + startX + 2,
      ],
      left: [
        (startY + 1) * sheetCols + startX,
        (startY + 1) * sheetCols + startX + 1,
        (startY + 1) * sheetCols + startX + 2,
      ],
      right: [
        (startY + 2) * sheetCols + startX,
        (startY + 2) * sheetCols + startX + 1,
        (startY + 2) * sheetCols + startX + 2,
      ],
      up: [
        (startY + 3) * sheetCols + startX,
        (startY + 3) * sheetCols + startX + 1,
        (startY + 3) * sheetCols + startX + 2,
      ],
    };
    return frames;
  }

  createCharacterAnims(sprite, prefix, frames) {
    const directions = ["down", "left", "right", "up"];
    directions.forEach((dir) => {
      const key = `${prefix}_walk_${dir}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key: key,
          frames: this.anims.generateFrameNumbers(sprite.texture.key, {
            frames: frames[dir],
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  }

  /**
   * Spawns NPCs defined in the map data.
   */
  createNPCs() {
    this.npcs = this.add.group();
    this.mapData.spawns.forEach((spawn) => {
      if (spawn.type === "npc") {
        let npcId = spawn.id;
        if (npcId === "mira") npcId = "elder_hyunseok";
        const npcData = NPCS[npcId];

        if (!npcData) {
          console.warn(
            `WorldScene: No data for NPC '${npcId}' in createNPCs. Skipping.`,
          );
          return;
        }

        // --- Rowan Visibility Logic ---
        if (npcId === "trainer_guardian_rowan") {
          const isRowanDefeated = (
            this.registry.get("defeatedTrainers") || []
          ).includes("guardian_rowan");
          if (isRowanDefeated || this.registry.get("chapter1_done")) {
            return;
          }
        }

        // --- Chief Hyunseok Visibility Logic ---
        if (npcId === "elder_hyunseok") {
          const isClimaxStarted = this.registry.get("is_climax_battle") === true;
          const isRowanDefeated = (
            this.registry.get("defeatedTrainers") || []
          ).includes("guardian_rowan");

          if (this.registry.get("chapter1_done")) {
            if (this.mapId !== "starwhisk_village") return;
          } else if (isRowanDefeated) {
            if (this.mapId === "mosslight_shrine") {
              // Spawn him at the altar
            } else if (this.mapId === "starwhisk_village") {
              return;
            }
          } else if (isClimaxStarted && this.mapId === "starwhisk_village") {
            return;
          }
        }

        // --- Ellie Visibility Logic ---
        if (npcId === "ellie") {
          const defeated = this.registry.get("defeatedTrainers") || [];
          if (defeated.includes("ellie")) {
            return;
          }
        }

        // 1. Determine Sprite Key and Character Block
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
          const isRowanDefeated = (
            this.registry.get("defeatedTrainers") || []
          ).includes("guardian_rowan");

          if (this.registry.get("chapter1_done")) {
            nx = 2;
            ny = 16;
            finalSpriteKey = "people2";
            finalCharIdx = 0;
          } else if (isRowanDefeated && this.mapId === "mosslight_shrine") {
            nx = 7;
            ny = 5;
            finalSpriteKey = "people4";
            finalCharIdx = 37;
          }
        }

        const npcFrames = this.getCharacterFrames(finalSpriteKey, finalCharIdx);
        const startFrame = npcFrames.down[1];

        const npc = this.add.sprite(
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

        // 2. Differentiate Trainers with red tint
        if (npcData.role === "trainer" || npcData.role === "boss_trainer") {
          npc.setTint(0xff8888);
        }

        this.npcs.add(npc);
      }
    });

    // Dynamically inject Legendary Spawns (Foreshadowing only for now)
    if (
      this.mapId === "ancient_forest" &&
      legendarySystem.canSpawnLegendary(this.registry, "VERDANTLYNX")
    ) {
      const lx = 20;
      const ly = 12;

      const legSprite = this.add.sprite(lx * 32 + 16, (ly + 1) * 32, "creature_verdantlynx");
      legSprite.setOrigin(0.5, 1);
      legSprite.npcId = "legendary_verdantlynx";
      legSprite.tileX = lx;
      legSprite.tileY = ly;
      this.npcs.add(legSprite);
    }
  }

  updateQuestIndicators() {
    if (!this.indicatorGroup || !this.indicatorGroup.scene) {
      this.indicatorGroup = this.add.group();
    } else {
      try {
        this.indicatorGroup.clear(true, true);
      } catch (e) {
        console.warn("WorldScene: Failed to clear indicatorGroup, recreating...", e);
        this.indicatorGroup = this.add.group();
      }
    }

    const activeQuests = this.registry.get("activeQuests") || {};
    if (!this.npcs) return;

    this.npcs.getChildren().forEach((npcSprite) => {
      if (npcSprite.isHerb || npcSprite.npcId === "lost_cat") return;
      const npcId = npcSprite.npcId === "mira" ? "elder_hyunseok" : npcSprite.npcId;
      const status = npcInteractionSystem.getNpcQuestStatus(npcId, activeQuests);

      if (status) {
        const char = status === "available" ? "!" : "?";
        const indicator = this.add
          .text(npcSprite.x, npcSprite.y - 40, char, {
            font: "bold 24px Arial",
            fill: "#f1c40f",
            stroke: "#000",
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(20);

        this.tweens.add({
          targets: indicator,
          y: indicator.y - 10,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.indicatorGroup.add(indicator);
      }
    });

    // Custom indicator for relic placement at the Altar
    if (this.mapId === "mosslight_shrine") {
      const fa = activeQuests["forest_awakening"];
      if (
        fa && !fa.completed &&
        fa.objectives.find(o => o.id === "defeat_rowan").completed &&
        !fa.objectives.find(o => o.id === "use_relic").completed
      ) {
        const indicator = this.add
          .text(7 * 32 + 16, 2 * 32 + 16 - 20, "?", {
            font: "bold 24px Arial",
            fill: "#f1c40f",
            stroke: "#000",
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(20);

        this.tweens.add({
          targets: indicator,
          y: indicator.y - 10,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.indicatorGroup.add(indicator);
      }
    }
  }

  spawnHerbs() {
    const isGreenpaw = this.mapId === "greenpaw_forest";
    const isMosslight = this.mapId === "mosslight_path";
    if (!isGreenpaw && !isMosslight) return;

    const activeQuests = this.registry.get("activeQuests") || {};
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
      if (this.registry.get(`${coord.id}_picked`)) return;
      const herb = this.add.sprite(coord.x * 32 + 16, coord.y * 32 + 16, "monster2", 0);
      herb.isHerb = true;
      herb.herbId = coord.id;
      herb.tileX = coord.x;
      herb.tileY = coord.y;
      this.npcs.add(herb);
    });
  }

  update(time, delta) {
    if (!this.cursors || !this.wasd || this.isMoving || this.isDialogueActive || this.isEncounterTriggered)
      return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.movePlayer(dx, dy);
    } else {
      if (this.player.anims.isPlaying) {
        this.player.stop();
        this.player.setFrame(this.player.animFrames[this.playerDir][1]);
      }
    }
  }

  /**
   * Handles tile-based movement with collision detection.
   */
  movePlayer(dx, dy) {
    const nextX = this.player.tileX + dx;
    const nextY = this.player.tileY + dy;

    if (dx > 0) this.playerDir = "right";
    else if (dx < 0) this.playerDir = "left";
    else if (dy > 0) this.playerDir = "down";
    else if (dy < 0) this.playerDir = "up";

    this.player.play(`player_walk_${this.playerDir}`, true);

    // 1. Check Bounds
    if (
      nextX < 0 ||
      nextX >= this.mapData.map.width ||
      nextY < 0 ||
      nextY >= this.mapData.map.height
    )
      return;

    // 2. Check Collision Layer
    const collisionLayer = this.mapData.layers.collisionLayer;
    if (collisionLayer) {
      const tile = collisionLayer.getTileAt(nextX, nextY);
      if (tile && tile.index !== 0) return;
    }

    // Safety check: Block gray walls (index 4) even if not in collision layer
    const groundLayer = this.mapData.layers.groundLayer;
    if (groundLayer) {
      const tile = groundLayer.getTileAt(nextX, nextY);
      if (tile && tile.index === 4) return;
    }

    // 3. Check NPCs
    const npcAtTile = this.npcs
      .getChildren()
      .find((n) => n.tileX === nextX && n.tileY === nextY);
    if (npcAtTile) return;

    // 4. Start Movement
    this.isMoving = true;
    this.tweens.add({
      targets: this.player,
      x: nextX * 32 + 16,
      y: (nextY + 1) * 32,
      duration: this.movementDuration,
      onComplete: () => {
        this.isMoving = false;
        this.player.tileX = nextX;
        this.player.tileY = nextY;
        this.onMoveComplete();
      },
    });
  }

  /**
   * Checks for warps or encounters after finishing a move.
   */
  onMoveComplete() {
    // 0. Check Event Triggers
    if (
      this.mapId === "mosslight_shrine" &&
      !this.registry.get("lost_cat_event_triggered")
    ) {
      const activeQuests = this.registry.get("activeQuests") || {};
      const lc = activeQuests["quest_lina_lost_cat"];
      if (lc && !lc.completed && !lc.objectives[1].completed) {
        worldStorySystem.triggerLostCatEvent(this);
      }
    }

    // 1. Check Warps
    const warp = this.mapData.warps.find(
      (w) => w.x === this.player.tileX && w.y === this.player.tileY,
    );
    if (warp) {
      this.isMoving = true;
      this.events.emit("hideMapName");

      import("../systems/audioManager.js").then((module) => {
        module.audioManager.playSE("se_move");
      });

      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        saveSystem.saveData(this.registry, warp.targetMap, warp.targetX, warp.targetY);
        this.scene.start("WorldScene", {
          mapId: warp.targetMap,
          spawnX: warp.targetX,
          spawnY: warp.targetY,
        });
      });
      return;
    }

    // 2. Check Encounters
    const encounterLayer = this.mapData.layers.encounterLayer;
    if (encounterLayer) {
      const tile = encounterLayer.getTileAt(this.player.tileX, this.player.tileY);
      if (tile && tile.index !== 0 && !this.isPartyDead()) {
        const encounter = encounterSystem.checkEncounter(this.mapId, 0.15);
        if (encounter) {
          this.triggerBattle(encounter);
        }
      }
    }
  }

  startQuest(id) {
    if (questSystem.startQuest(this.registry, id)) {
      const q = questSystem.getQuest(this.registry, id);
      this.events.emit("notifyItem", { message: `새로운 퀘스트: ${q.title}`, color: 0xf1c40f });
      this.updateQuestIndicators();
    }
  }

  updateLogText(text) {
    this.events.emit("notifyItem", { message: text, color: 0x3498db });
  }

  healParty() {
    const party = this.registry.get("playerParty") || [];
    let needsHeal = false;
    party.forEach((p) => {
      if (p.currentHp < p.maxHp) needsHeal = true;
    });

    if (!needsHeal) {
      let heals = this.registry.get("consecutiveHeals") || 0;
      heals++;
      this.registry.set("consecutiveHeals", heals);

      if (heals >= 5) {
        this.events.emit("notifyItem", { message: "이제 그만 할일 하러가거라", color: 0xe74c3c });
      } else {
        this.events.emit("notifyItem", { message: "힐 할 고양이가 없다", color: 0xf1c40f });
      }
      return;
    }

    this.registry.set("consecutiveHeals", 0);

    party.forEach((p) => (p.currentHp = p.maxHp));
    this.registry.set("playerParty", party);

    this.cameras.main.flash(300, 150, 255, 150);

    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_heal");
    });

    saveSystem.saveData(this.registry, this.mapId, this.player.tileX, this.player.tileY);
  }

  triggerTrainerBattle(trainerId) {
    this.registry.set("world_mapId", this.mapId);
    this.registry.set("world_spawnX", this.player.tileX);
    this.registry.set("world_spawnY", this.player.tileY);

    this.isEncounterTriggered = true;
    this.player.stop();
    this.player.setFrame(this.player.animFrames[this.playerDir][1]);

    this.events.emit("hideMapName");

    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_encounter");
    });

    this.cameras.main.flash(500, 255, 0, 0);

    this.time.delayedCall(600, () => {
      this.scene.start("BattleScene", { isTrainer: true, trainerId: trainerId });
    });
  }

  triggerBattle(encounter) {
    if (!encounter) return;

    this.registry.set("world_mapId", this.mapId);
    this.registry.set("world_spawnX", this.player.tileX);
    this.registry.set("world_spawnY", this.player.tileY);

    this.isEncounterTriggered = true;
    this.player.stop();
    this.player.setFrame(this.player.animFrames[this.playerDir][1]);

    this.events.emit("hideMapName");

    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_encounter");
    });

    this.cameras.main.flash(500, 255, 255, 255);

    this.time.delayedCall(600, () => {
      this.scene.start("BattleScene", { enemyId: encounter.creatureId, enemyLevel: encounter.level });
    });
  }

  isPartyDead() {
    const party = this.registry.get("playerParty") || [];
    if (party.length === 0) return false;
    return party.every((cat) => cat.currentHp <= 0);
  }

  // --- Story sequence delegates ---

  runClimaxSequence() {
    worldStorySystem.runClimaxSequence(this);
  }

  runPostClimaxSequence() {
    worldStorySystem.runPostClimaxSequence(this);
  }
}
