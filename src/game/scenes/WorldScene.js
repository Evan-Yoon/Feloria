import Phaser from "phaser";
import { mapLoader } from "../systems/mapLoader.js";
import { saveSystem } from "../systems/saveSystem.js";
import { encounterSystem } from "../systems/encounterSystem.js";
import { dialogueSystem } from "../systems/dialogueSystem.js";
import { questSystem } from "../systems/questSystem.js";
import { TRAINERS } from "../data/trainers.js";
import { NPCS } from "../data/npcs.js";
import { cutsceneSystem } from "../systems/cutsceneSystem.js";
import { legendarySystem } from "../systems/legendarySystem.js";

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
    this.movementDuration = 250; // ms per tile
    this.playerDir = "down";

    // Interaction lock
    this.isDialogueActive = false;
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
    console.log(`WorldScene: Entering ${this.mapId}`);

    // 1. Load Map
    this.mapData = mapLoader.createMap(this, this.mapId);
    if (!this.mapData) return;

    // Quest Check: Enter Forest
    if (this.mapId === "greenpaw_forest") {
      questSystem.completeObjective(
        this.registry,
        "first_steps",
        "enter_forest",
      );
    }

    // 2. Set Camera Bounds
    this.cameras.main.setBounds(
      0,
      0,
      this.mapData.widthInPixels,
      this.mapData.heightInPixels,
    );

    // 3. Create Player
    this.createPlayer();

    // 4. Create NPCs
    this.createNPCs();

    // 5. Input Handling
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");

    // Interaction Key (Space)
    this.input.keyboard.on("keydown-SPACE", () => this.handleInteraction());

    // Menu Key (ESC or ENTER)
    this.input.keyboard.on("keydown-ESC", () => this.openMenu());
    this.input.keyboard.on("keydown-ENTER", () => this.openMenu());

    // 6. Camera Follow
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2); // Zoom in for the pixel RPG feel

    // 7. Map Name UI
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }

    this.time.delayedCall(10, () => {
      this.events.emit('displayMapName', this.mapData.name);

      this.checkStoryTriggers(data);
    });
  }

  checkStoryTriggers(data) {
    const introDone = this.registry.get("intro_done");

    // 1. Initial Intro (Talk to Chief)
    if (this.mapId === 'starwhisk_village' && !introDone && !this.registry.get('intro_started')) {
      this.time.delayedCall(500, () => {
        this.triggerForcedDialogue("elder_hyunseok");
      });
      return;
    }

    // 2. Post-Starter Dialogue
    if (data.intro_phase === 'received_starter' && !introDone) {
      this.time.delayedCall(500, () => {
        this.triggerForcedDialogue("elder_hyunseok_gift");
      });
      return;
    }

    // Existing Quest/Legendary checks
    if (this.mapId === 'mosslight_path') {
      questSystem.completeObjective(this.registry, 'forest_awakening', 'explore_path');
    } else if (this.mapId === 'ancient_forest') {
      questSystem.completeObjective(this.registry, 'forest_awakening', 'enter_ancient_forest');
    }

    legendarySystem.applyWorldEffects(this);
  }

  triggerForcedDialogue(npcId) {
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

    this.isDialogueActive = true;
    this.playerDir = "up";
    this.player.setFrame(1);

    this.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: customDialogue || npcData.getDialogue(this.registry)
      },
      onComplete: () => {
        this.isDialogueActive = false;

        if (npcId === "elder_hyunseok") {
          this.registry.set('intro_started', true);
          this.scene.start('StarterSelectScene');
        } else if (npcId === "elder_hyunseok_gift") {
          // Give crystals
          const inventory = this.registry.get("playerInventory") || {};
          inventory["capture_crystal"] = (inventory["capture_crystal"] || 0) + 2;
          this.registry.set("playerInventory", inventory);

          this.registry.set("intro_done", true);

          // Start first quest instantly
          const activeQuests = this.registry.get('activeQuests') || {};
          if (activeQuests['first_steps']) {
            questSystem.completeObjective(this.registry, "first_steps", "talk_mira");
          }
        }
      }
    });
  }

  openMenu() {
    if (this.isDialogueActive || this.isMoving) return;
    this.events.emit('hideMapName');
    this.scene.pause();
    this.scene.launch("MenuScene");
  }

  /**
   * Spawns the player at the correct tile position.
   */
  createPlayer() {
    // If no specific spawn provided, use map default
    const spawn = this.mapData.spawns.find((s) => s.type === "player");
    const tx = this.spawnX !== undefined ? this.spawnX : spawn ? spawn.x : 10;
    const ty = this.spawnY !== undefined ? this.spawnY : spawn ? spawn.y : 10;

    // Phaser spritesheet index: 0:Down, 1:Up, 2:Left, 3:Right (Matching our Preload generation)
    this.player = this.add.sprite(tx * 32 + 16, ty * 32 + 16, "player", 0);
    this.player.setDepth(10);

    // Store tile position
    this.player.tileX = tx;
    this.player.tileY = ty;
  }

  /**
   * Spawns NPCs defined in the map data.
   */
  createNPCs() {
    this.npcs = this.add.group();
    this.mapData.spawns.forEach((spawn) => {
      if (spawn.type === "npc") {
        let texture = "npc";
        if (spawn.id === "mira" || spawn.id === "trainer_guardian_rowan") texture = "npc_mira";
        else if (spawn.id && spawn.id.startsWith("trainer")) texture = "npc_trainer";

        let nx = spawn.x;
        let ny = spawn.y;

        if (spawn.id === "mira" && this.mapId === "starwhisk_village" && this.registry.get("chapter1_done")) {
          nx = 2;
          ny = 16;

          // Build temporary prison
          const ground = this.mapData.layers.groundLayer;
          const collision = this.mapData.layers.collisionLayer;

          const rocks = [
            { x: 1, y: 15 }, { x: 2, y: 15 }, { x: 3, y: 15 },
            { x: 1, y: 16 }, { x: 3, y: 16 },
            { x: 1, y: 17 }, { x: 3, y: 17 } // Leave (2,17) open for player to talk
          ];

          rocks.forEach(pos => {
            if (ground) this.mapData.map.putTileAt(4, pos.x, pos.y, true, ground);
            if (collision) this.mapData.map.putTileAt(4, pos.x, pos.y, true, collision);
          });
        }

        const npc = this.add.sprite(
          nx * 32 + 16,
          ny * 32 + 16,
          texture,
        );
        npc.npcId = spawn.id;
        npc.tileX = nx;
        npc.tileY = ny;
        this.npcs.add(npc);
      }
    });

    // Dynamically inject Legendary Spawns
    if (this.mapId === 'ancient_forest' && legendarySystem.canSpawnLegendary(this.registry, 'VERDANTLYNX')) {
      const lx = 20; // Deep in the forest
      const ly = 12;

      const legSprite = this.add.sprite(lx * 32 + 16, ly * 32 + 16, 'verdantlynx');
      // Tint the sprite so we don't have to load a separate overworld atlas right now
      legSprite.setTintFill(0x2ecc71);
      legSprite.npcId = 'legendary_verdantlynx';
      legSprite.tileX = lx;
      legSprite.tileY = ly;
      this.npcs.add(legSprite);
    }
  }

  update(time, delta) {
    if (this.isMoving || this.isDialogueActive) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.movePlayer(dx, dy);
    }
  }

  /**
   * Handles tile-based movement with collision detection.
   */
  movePlayer(dx, dy) {
    const nextX = this.player.tileX + dx;
    const nextY = this.player.tileY + dy;

    // Update direction/sprite frame
    if (dx > 0) {
      this.playerDir = "right";
      this.player.setFrame(3);
    } else if (dx < 0) {
      this.playerDir = "left";
      this.player.setFrame(2);
    } else if (dy > 0) {
      this.playerDir = "down";
      this.player.setFrame(0);
    } else if (dy < 0) {
      this.playerDir = "up";
      this.player.setFrame(1);
    }

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
      if (tile && tile.index !== 0) return; // Blocked
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
      y: nextY * 32 + 16,
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
    if (this.checkEventTriggers()) return;

    // 1. Check Warps
    const warp = this.mapData.warps.find(
      (w) => w.x === this.player.tileX && w.y === this.player.tileY,
    );
    if (warp) {
      // Add a slight delay to prevent warp loop jitter
      this.isMoving = true;
      this.events.emit('hideMapName');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        // Autosave upon map transition securely
        saveSystem.saveData(
          this.registry,
          warp.targetMap,
          warp.targetX,
          warp.targetY,
        );

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
      const tile = encounterLayer.getTileAt(
        this.player.tileX,
        this.player.tileY,
      );
      if (tile && tile.index !== 0) {
        const encounter = encounterSystem.checkEncounter(this.mapId, 0.15);
        if (encounter) {
          this.triggerBattle(encounter);
        }
      }
    }
  }

  handleInteraction() {
    if (this.isMoving || this.isDialogueActive) return;

    // Determine tile in front of player
    let targetX = this.player.tileX;
    let targetY = this.player.tileY;

    if (this.playerDir === "left") targetX--;
    else if (this.playerDir === "right") targetX++;
    else if (this.playerDir === "up") targetY--;
    else if (this.playerDir === "down") targetY++;

    // Find NPC Sprite
    const npcSprite = this.npcs
      .getChildren()
      .find((n) => n.tileX === targetX && n.tileY === targetY);

    if (npcSprite) {
      // Find NPC Data
      // Special check for dynamic legendaries
      if (npcSprite.npcId && npcSprite.npcId.startsWith("legendary_")) {
        this.triggerLegendaryEncounter(npcSprite);
        return;
      }

      const npcData = NPCS[npcSprite.npcId];

      if (!npcData) {
        console.warn(`WorldScene: NPC ID '${npcSprite.npcId}' not found in npcs.js`);
        return;
      }

      this.isDialogueActive = true;
      let pages = npcData.getDialogue(this.registry);

      // Pre-dialogue objective triggers
      if (npcData.id === "mira") {
        const quest = questSystem.getQuest(this.registry, "first_steps");
        if (quest && !quest.objectives.find((o) => o.id === "talk_mira").completed) {
          questSystem.completeObjective(this.registry, "first_steps", "talk_mira");
        } else if (quest && quest.objectives.find((o) => o.id === "capture_cat").completed) {
          questSystem.completeObjective(this.registry, "first_steps", "return_mira");
        }
      }

      this.scene.launch("DialogScene", {
        dialogue: {
          name: npcData.name,
          pages: pages
        },
        onComplete: () => {
          this.isDialogueActive = false;
          this.processNpcRole(npcSprite, npcData);
        },
      });
    }
  }

  /**
   * Dispatches behavior based on the NPC's role rather than hardcoded IDs.
   */
  processNpcRole(npcSprite, npcData) {
    let currentRole = npcData.role;

    // Story-based role overrides
    if (npcSprite.npcId === "eugene" && this.registry.get("chapter1_done")) {
      currentRole = "healer_quest";
    } else if (npcSprite.npcId === "mira" && this.registry.get("chapter1_done")) {
      currentRole = "prison";
    }

    switch (currentRole) {
      case "healer_quest":
        this.healParty();
        break;
      case "shopkeeper":
        this.scene.pause();
        this.scene.launch("ShopScene");
        break;
      case "trainer":
      case "boss_trainer":
        const defeated = this.registry.get("defeatedTrainers") || [];
        if (!defeated.includes(npcData.trainerId)) {
          this.triggerTrainerBattle(npcData.trainerId);
        } else if (npcData.role === "boss_trainer" && npcData.trainerId === "guardian_rowan") {
          questSystem.completeObjective(this.registry, "forest_awakening", "defeat_rowan");
        }
        break;
      default:
        // Lore or Hint NPCs usually don't have post-dialogue state changes
        break;
    }
  }

  checkEventTriggers() {
    // Mosslight Shrine Boss Intro
    if (this.mapId === 'mosslight_shrine') {
      if (this.player.tileY <= 6 && !this.registry.get('boss_rowan_intro')) {
        this.runMosslightBossIntro();
        return true;
      }
    }
    return false;
  }

  async runMosslightBossIntro() {
    // Find Rowan
    const rowan = this.npcs.getChildren().find(n => n.npcId === 'trainer_guardian_rowan');
    if (!rowan) return;

    cutsceneSystem.lockInput(this);

    // Pan camera to Rowan
    await cutsceneSystem.panCameraTo(this, rowan.x, rowan.y * 32, 1500);

    await cutsceneSystem.delay(this, 500);

    const npcData = NPCS['trainer_guardian_rowan'];
    await cutsceneSystem.playDialogue(this, npcData.name, [
      "여기까지 온 것을 보니 실력은 인정하겠다.",
      "하지만 이곳은 신성한 신전이다.",
      "세계의 균형을 지키기 위해…",
      "나는 너를 막아야 한다."
    ]);

    // Pan back to player
    await cutsceneSystem.restoreCameraToPlayer(this, 1500);

    this.registry.set('boss_rowan_intro', true);
    cutsceneSystem.unlockInput(this);

    // Force trigger battle
    this.triggerTrainerBattle('guardian_rowan');
  }

  async triggerLegendaryEncounter(sprite) {
    if (this.isDialogueActive) return;
    this.isDialogueActive = true;

    const legendaryId = sprite.npcId.split("_")[1].toUpperCase();

    cutsceneSystem.lockInput(this);

    // Dramatic pan smoothly
    await cutsceneSystem.panCameraTo(this, sprite.x, sprite.y, 1500);

    // Pulse animation
    this.tweens.add({
      targets: sprite,
      scale: 1.2,
      yoyo: true,
      duration: 300,
      repeat: 2
    });

    await cutsceneSystem.shakeCamera(this, 1000, 0.02);

    const roarText = this.add.text(sprite.x, sprite.y - 40, "GROOOOAAAR!", {
      font: 'bold 24px "Press Start 2P", Courier',
      fill: '#e74c3c',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    await cutsceneSystem.delay(this, 1500);
    roarText.destroy();

    await cutsceneSystem.restoreCameraToPlayer(this, 1000);

    this.isDialogueActive = false;
    cutsceneSystem.unlockInput(this);

    // Force battle with legendary stats
    this.events.emit('hideMapName');
    this.scene.pause();
    this.scene.launch("BattleScene", {
      isWild: true,
      enemyPool: [{ creatureId: legendaryId, level: 50 }], // Forced Lv 50 Boss
      background: this.mapId
    });
  }

  healParty() {
    const party = this.registry.get("playerParty") || [];
    party.forEach((p) => (p.currentHp = p.maxHp));
    this.registry.set("playerParty", party);

    this.cameras.main.flash(300, 150, 255, 150);

    // Flash completely heals, log internally
    console.log("WorldScene: Party fully healed via Elder Mira.");

    // Autosave after healing
    saveSystem.saveData(
      this.registry,
      this.mapId,
      this.player.tileX,
      this.player.tileY,
    );
  }

  triggerTrainerBattle(trainerId) {
    console.log(`TRAINER BATTLE: ${trainerId}`);
    this.registry.set("world_mapId", this.mapId);
    this.registry.set("world_spawnX", this.player.tileX);
    this.registry.set("world_spawnY", this.player.tileY);

    this.events.emit('hideMapName');
    this.cameras.main.flash(500, 255, 0, 0); // Red flash

    this.time.delayedCall(600, () => {
      this.scene.start("BattleScene", {
        isTrainer: true,
        trainerId: trainerId,
      });
    });
  }

  triggerBattle(encounter) {
    if (!encounter) return;

    console.log(
      `ENCOUNTER TRIGGERED: ${encounter.creatureId} Lvl ${encounter.level}`,
    );

    // Save return state
    this.registry.set("world_mapId", this.mapId);
    this.registry.set("world_spawnX", this.player.tileX);
    this.registry.set("world_spawnY", this.player.tileY);

    this.events.emit('hideMapName');
    this.cameras.main.flash(500, 255, 255, 255);

    this.time.delayedCall(600, () => {
      this.scene.start("BattleScene", {
        enemyId: encounter.creatureId,
        enemyLevel: encounter.level,
      });
    });
  }
}
