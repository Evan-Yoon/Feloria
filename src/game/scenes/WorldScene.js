import Phaser from "phaser";
import { mapLoader } from "../systems/mapLoader.js";
import { saveSystem } from "../systems/saveSystem.js";
import { encounterSystem } from "../systems/encounterSystem.js";
import { questSystem } from "../systems/questSystem.js";
import { legendarySystem } from "../systems/legendarySystem.js";
import { characterSystem } from "../systems/world/characterSystem.js";
import { npcSpawnSystem } from "../systems/world/npcSpawnSystem.js";
import { npcInteractionSystem } from "../systems/world/npcInteractionSystem.js";
import { worldStorySystem } from "../systems/world/worldStorySystem.js";

/**
 * WorldScene
 * The main top-down exploration scene.
 * Orchestration only — spawning, NPC, and story logic live in systems/world/.
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
    this.movementDuration = 150; // ms per tile
    this.playerDir = "down";

    // Interaction lock
    this.isDialogueActive = false;
    this.isTransitioning = false;
    this.isEncounterTriggered = false;
    this.wasQuestUpdatedInInteraction = false;
  }

  preload() {
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
      this.scene.start("StartScene");
      return;
    }

    // 1.5 Render Village Prison
    if (this.mapId === "starwhisk_village") {
      const ground = this.mapData.layers.groundLayer;
      const collision = this.mapData.layers.collisionLayer;
      const rocks = [
        { x: 1, y: 15 }, { x: 2, y: 15 }, { x: 3, y: 15 },
        { x: 1, y: 16 }, { x: 3, y: 16 },
        { x: 1, y: 17 }, { x: 3, y: 17 },
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
    characterSystem.createPlayer(this);

    // 4. Create NPCs
    npcSpawnSystem.createNPCs(this);

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
      npcSpawnSystem.spawnHerbs(this);
    });
  }

  checkStoryTriggers(data) {
    const introDone = this.registry.get("intro_done");

    // Start first quest automatically if not done
    if (!introDone && !this.registry.get("intro_started")) {
      questSystem.startQuest(this.registry, "first_steps");
    }

    // 1. Initial Intro (Talk to Chief)
    if (this.mapId === "starwhisk_village" && !introDone && !this.registry.get("intro_started")) {
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
    this.scene.launch("CodexScene", { callerScene: "WorldScene" });
  }

  // ─── Game Loop ──────────────────────────────────────────────────────────────

  update() {
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

  movePlayer(dx, dy) {
    const nextX = this.player.tileX + dx;
    const nextY = this.player.tileY + dy;

    if (dx > 0) this.playerDir = "right";
    else if (dx < 0) this.playerDir = "left";
    else if (dy > 0) this.playerDir = "down";
    else if (dy < 0) this.playerDir = "up";

    this.player.play(`player_walk_${this.playerDir}`, true);

    // Check Bounds
    if (
      nextX < 0 || nextX >= this.mapData.map.width ||
      nextY < 0 || nextY >= this.mapData.map.height
    ) return;

    // Check Collision Layer
    const collisionLayer = this.mapData.layers.collisionLayer;
    if (collisionLayer) {
      const tile = collisionLayer.getTileAt(nextX, nextY);
      if (tile && tile.index !== 0) return;
    }

    // Block gray walls (index 4) even if not in collision layer
    const groundLayer = this.mapData.layers.groundLayer;
    if (groundLayer) {
      const tile = groundLayer.getTileAt(nextX, nextY);
      if (tile && tile.index === 4) return;
    }

    // Check NPCs
    const npcAtTile = this.npcs.getChildren().find((n) => n.tileX === nextX && n.tileY === nextY);
    if (npcAtTile) return;

    // Start Movement
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

  onMoveComplete() {
    // Check Event Triggers
    if (this.mapId === "mosslight_shrine" && !this.registry.get("lost_cat_event_triggered")) {
      const activeQuests = this.registry.get("activeQuests") || {};
      const lc = activeQuests["quest_lina_lost_cat"];
      if (lc && !lc.completed && !lc.objectives[1].completed) {
        worldStorySystem.triggerLostCatEvent(this);
      }
    }

    // Check Warps
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

    // Check Encounters
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

  // ─── Helpers ────────────────────────────────────────────────────────────────

  startQuest(id) {
    if (questSystem.startQuest(this.registry, id)) {
      const q = questSystem.getQuest(this.registry, id);
      this.events.emit("notifyItem", { message: `새로운 퀘스트: ${q.title}`, color: 0xf1c40f });
      this.updateQuestIndicators();
    }
  }

  updateQuestIndicators() {
    npcSpawnSystem.updateQuestIndicators(this);
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

  // ─── Story sequence delegates ────────────────────────────────────────────────

  runClimaxSequence() {
    worldStorySystem.runClimaxSequence(this);
  }

  runPostClimaxSequence() {
    worldStorySystem.runPostClimaxSequence(this);
  }
}
