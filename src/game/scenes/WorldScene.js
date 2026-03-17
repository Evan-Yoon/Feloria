import Phaser from "phaser";
import { ASSETS } from "../config/assetPaths.js";
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
    console.log(`WorldScene: Entering ${this.mapId}`);
    console.log(`WorldScene: NPCS keys = ${Object.keys(NPCS).join(", ")}`);
    console.log(`WorldScene: elder_hyunseok data =`, NPCS.elder_hyunseok);

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

    // Quest Check: Enter Forest
    if (this.mapId === "greenpaw_forest") {
      questSystem.completeObjective(
        this.registry,
        "first_steps",
        "enter_forest",
      );
    }

    // 2. Set Camera Bounds
    if (this.mapData.widthInPixels && this.mapData.heightInPixels) {
      this.cameras.main.setBounds(
        0,
        0,
        this.mapData.widthInPixels,
        this.mapData.heightInPixels,
      );
    }

    // 3. Create Player
    this.createPlayer();

    // 4. Create NPCs
    this.createNPCs();

    // 4.5. Initialize Indicator Group
    this.indicatorGroup = this.add.group();

    // 5. Input Handling (Remaining setup)

    // Interaction Key (Space)
    this.input.keyboard.on("keydown-SPACE", () => this.handleInteraction());

    // Menu Key (ESC or ENTER)
    this.input.keyboard.on("keydown-ESC", () => this.openMenu());
    this.input.keyboard.on("keydown-ENTER", () => this.openMenu());
    this.input.keyboard.on("keydown-C", () => this.openCodex());

    // 6. Camera Follow
    this.cameras.main.setBackgroundColor(0x000000); // Ensure opaque background
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2); // Zoom in for the pixel RPG feel

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

        // Don't restart if already playing (e.g. from battle return)
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
        this.triggerForcedDialogue("elder_hyunseok");
      });
      return;
    }

    // 2. Post-Starter Dialogue
    if (data.intro_phase === "received_starter" && !introDone) {
      this.time.delayedCall(500, () => {
        this.triggerForcedDialogue("elder_hyunseok_gift");
      });
      return;
    }

    // Existing Quest/Legendary checks
    if (this.mapId === "mosslight_path") {
      questSystem.completeObjective(
        this.registry,
        "forest_awakening",
        "explore_path",
      );
    } else if (this.mapId === "ancient_forest") {
      questSystem.completeObjective(
        this.registry,
        "forest_awakening",
        "enter_ancient_forest",
      );

      const ld = this.registry.get("activeQuests")?.["quest_luke_despair"];
      if (ld && !ld.completed) {
        questSystem.completeObjective(
          this.registry,
          "quest_luke_despair",
          "reach_ancient_forest",
        );
      }
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
    this.player.setFrame(ASSETS.CHARACTERS.PLAYER.UP_FRAME || 1);

    this.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: customDialogue || npcData.getDialogue(this.registry),
        faceKey: npcData.faceKey,
        faceIndex: npcData.faceIndex || 0,
      },
      onComplete: () => {
        this.isDialogueActive = false;

        if (npcId === "elder_hyunseok") {
          this.isTransitioning = true;
          this.registry.set("intro_started", true);
          questSystem.completeObjective(
            this.registry,
            "first_steps",
            "talk_mira",
          );
          this.scene.start("StarterSelectScene");
        } else if (npcId === "elder_hyunseok_gift") {
          // Give crystals
          const inventory = this.registry.get("playerInventory") || {};
          inventory["capture_crystal"] =
            (inventory["capture_crystal"] || 0) + 2;
          this.registry.set("playerInventory", inventory);

          this.events.emit("notifyItem", {
            message: `포획 크리스탈 x2 획득!`,
            color: 0x27ae60,
          });

          this.registry.set("intro_done", true);

          // Start first quest instantly
          const activeQuests = this.registry.get("activeQuests") || {};
          if (activeQuests["first_steps"]) {
            questSystem.completeObjective(
              this.registry,
              "first_steps",
              "talk_mira",
            );
          }
        }
      },
    });
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
    // If no specific spawn provided, use map default
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

    // Get frames for the specific character block
    const frames = this.getCharacterFrames(config.KEY, config.CHARACTER_INDEX);
    const startFrame = frames.down[1]; // Middle frame, down facing

    this.player = this.add.sprite(
      tx * 32 + 16,
      (ty + 1) * 32,
      config.KEY,
      startFrame,
    );
    this.player.setOrigin(0.5, 1);
    this.player.setDepth(10);
    this.player.tileX = tx;
    this.player.tileY = ty;
    this.player.animFrames = frames;

    // Create animations for this specific player block
    this.createCharacterAnims(this.player, "player", frames);
  }

  /**
   * RPG Maker character sheet helper
   * Sheet usually 4x2 blocks of 3x4 frames
   */
  getCharacterFrames(textureKey, charIndex) {
    const texture = this.textures.get(textureKey);
    // Find how many frames per row in the actual texture
    // Each character block is 3 frames wide.
    const frameCount = texture.getFrameNames().length;
    // For spritesheets loaded via load.spritesheet, we can check the number of frames
    // Standard RPG Maker MV Actor sheet is 12 frames wide, 8 frames high (total 96 frames)
    // If it's a 4x2 block sheet, it has 12 columns.
    const image = texture.getSourceImage();
    const frameWidth = 32; // DEFINITIVE: 384 / 12 = 32. 256 / 8 = 32.
    const sheetCols = 12; // 12 columns in a standard 4x2 RPG Maker sheet
    console.log(
      `WorldScene: getCharacterFrames for ${textureKey}, index ${charIndex}, sheet size: ${image.width}x${image.height}, cols: ${sheetCols}`,
    );

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
    console.log(`WorldScene: calculated frames for ${textureKey}:`, frames);
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

        // --- Chief Hyunseok Visibility Logic ---
        if (npcId === "elder_hyunseok") {
          const isClimaxStarted = this.registry.get("is_climax_battle") === true;
          const isRowanDefeated = (
            this.registry.get("defeatedTrainers") || []
          ).includes("guardian_rowan");

          if (isClimaxStarted && !isRowanDefeated && this.mapId === "starwhisk_village") {
            // He "leaves" for the shrine during the climax battle phase
            return;
          }
        }

        // --- Ellie Visibility Logic ---
        if (npcId === "ellie") {
          const defeated = this.registry.get("defeatedTrainers") || [];
          if (defeated.includes("ellie")) {
            console.log("WorldScene: Ellie has been defeated and removed.");
            return;
          }
        }

        // 1. Determine Sprite Key and Character Block
        const spriteKey = npcData.sprite || "people1";
        // Find the character block in ASSETS.CHARACTERS that matches this KEY
        const config =
          Object.values(ASSETS.CHARACTERS).find((c) => c.KEY === spriteKey) ||
          ASSETS.CHARACTERS.PEOPLE1;

        const characterIndex =
          npcData.characterIndex !== undefined
            ? npcData.characterIndex
            : config.CHARACTER_INDEX || 0;

        const frames = this.getCharacterFrames(config.KEY, characterIndex);
        const startFrame = frames.down[1];

        let nx = spawn.x;
        let ny = spawn.y;

        // Custom positioning for prison scene
        if (
          npcId === "elder_hyunseok" &&
          this.mapId === "starwhisk_village" &&
          this.registry.get("chapter1_done")
        ) {
          nx = 2;
          ny = 16;
          // (Prison construction logic remains same)
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
            if (ground)
              this.mapData.map.putTileAt(4, pos.x, pos.y, true, ground);
            if (collision)
              this.mapData.map.putTileAt(4, pos.x, pos.y, true, collision);
          });
        }

        const npc = this.add.sprite(
          nx * 32 + 16,
          (ny + 1) * 32,
          config.KEY,
          startFrame,
        );
        npc.animFrames = frames;
        npc.setOrigin(0.5, 1);
        npc.npcId = spawn.id;
        npc.tileX = nx;
        npc.tileY = ny;

        // 2. Differentiate Trainers with red tint
        if (npcData.role === "trainer" || npcData.role === "boss_trainer") {
          npc.setTint(0xff8888); // Reddish color for trainers
        }

        this.npcs.add(npc);
      }
    });

    // Dynamically inject Legendary Spawns (Foreshadowing only for now)
    if (
      this.mapId === "ancient_forest" &&
      legendarySystem.canSpawnLegendary(this.registry, "VERDANTLYNX")
    ) {
      const lx = 20; // Deep in the forest
      const ly = 12;

      // Use the newly registered creature sprite asset
      const legSprite = this.add.sprite(
        lx * 32 + 16,
        (ly + 1) * 32,
        "creature_verdantlynx",
      );
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
        console.warn(
          "WorldScene: Failed to clear indicatorGroup, recreating...",
          e,
        );
        this.indicatorGroup = this.add.group();
      }
    }

    const activeQuests = this.registry.get("activeQuests") || {};
    if (!this.npcs) return;

    this.npcs.getChildren().forEach((npcSprite) => {
      if (npcSprite.isHerb || npcSprite.npcId === "lost_cat") return;
      const npcId =
        npcSprite.npcId === "mira" ? "elder_hyunseok" : npcSprite.npcId;
      const status = this.getNpcQuestStatus(npcId, activeQuests);

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
  }

  getNpcQuestStatus(npcId, activeQuests) {
    const fs = activeQuests["first_steps"];
    const ts = activeQuests["quest_toby_supply"];
    const lc = activeQuests["quest_lina_lost_cat"];
    const sb = activeQuests["quest_sera_blockade"];
    const ld = activeQuests["quest_luke_despair"];
    const cr = activeQuests["quest_chiefs_relic"];
    const fa = activeQuests["forest_awakening"];

    // 1. First Steps Quest (Chief Hyunseok)
    if (!fs && npcId === "elder_hyunseok") return "available"; // Give quest 'first_steps' (!)
    if (fs && !fs.completed && fs.objectives.find((o) => o.id === "capture_cat").completed && npcId === "elder_hyunseok") return "ready"; // Report back (?)

    // 2. Toby Supply Quest (Shopkeeper)
    if (ts && !ts.objectives.find((o) => o.id === "talk_toby").completed && npcId === "shopkeeper") return "available"; // Needs to talk to Toby (!)
    if (ts && !ts.completed && ts.objectives[1].completed && npcId === "shopkeeper") return "ready"; // Turn in herbs (?)

    // 3. Lina Lost Cat Quest (Villager1)
    if (!lc && ts && ts.completed && npcId === "villager1") return "available"; // Give quest 'quest_lina_lost_cat' (!)
    if (lc && !lc.completed && lc.objectives[1].completed && npcId === "villager1") return "ready"; // Return Mira (?)

    // 4. Sera Blockade Quest (Chief -> Sera -> Chief)
    if (!sb && lc && lc.completed && npcId === "elder_hyunseok") return "available"; // Give quest 'quest_sera_blockade' (!)
    if (sb && !sb.completed && !sb.objectives.find(o => o.id === "defeat_sera").completed && npcId === "trainer_sera") return "ready"; // Sera battle (ready symbol indicates important interaction)
    if (sb && !sb.completed && sb.objectives.find(o => o.id === "defeat_sera").completed && !sb.objectives.find(o => o.id === "report_chief").completed && npcId === "elder_hyunseok") return "ready"; // Report defeated Sera (?)

    // 5. Luke Despair Quest (Chief -> Luke -> Chief)
    if (!ld && sb && sb.completed && npcId === "elder_hyunseok") return "available"; // Give quest 'quest_luke_despair' (!)
    if (ld && !ld.completed && !ld.objectives.find(o => o.id === "defeat_luke").completed && npcId === "trainer_luke") return "ready"; // Luke battle (ready symbol indicates important interaction)
    if (ld && !ld.completed && ld.objectives.find(o => o.id === "defeat_luke").completed && !ld.objectives.find(o => o.id === "report_chief").completed && npcId === "elder_hyunseok") return "ready"; // Report defeated Luke (?)

    // 6. Chief's Relic Quest (Chief)
    // After returning from defeating Luke, Chief gives the relic automatically.
    // However, if we split the interaction, first we report Luke (above), then Chief gives relic quest.
    if (!cr && ld && ld.completed && npcId === "elder_hyunseok") return "available"; // Give quest 'quest_chiefs_relic' (!)
    if (cr && !cr.completed && cr.objectives[0].completed && npcId === "elder_hyunseok") return "ready"; // Turn in relic -> wait, it completes immediately during talk usually but if not, logic fallback
    if (cr && !cr.completed && !cr.objectives[0].completed && npcId === "elder_hyunseok") return "ready"; // Interaction to receive relic (?)

    // 7. Forest Awakening Quest
    // Guardian Rowan battle
    if (fa && !fa.completed && fa.objectives.find(o => o.id === "enter_ancient_forest").completed && !fa.objectives.find(o => o.id === "defeat_rowan").completed && npcId === "trainer_guardian_rowan") return "ready"; // Rowan battle (!)

    return null;
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
      const herb = this.add.sprite(
        coord.x * 32 + 16,
        coord.y * 32 + 16,
        "monster2",
        0,
      );
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
      // Idle - stop animation and set to middle frame
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

    // Update direction and play animation
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
      if (tile && tile.index !== 0) return; // Blocked
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
    if (this.mapId === "mosslight_shrine") {
      const activeQuests = this.registry.get("activeQuests") || {};
      const forestQuest = activeQuests["forest_awakening"];
      const isQuestActive = forestQuest && !forestQuest.completed;

      // Rowan Battle Trigger: Exactly at Y=5 (the horizontal line)
      if (
        this.player.tileY === 5 &&
        !this.registry.get("boss_rowan_intro") &&
        isQuestActive
      ) {
        this.runMosslightBossIntro();
        return;
      }
    }

    if (
      this.mapId === "mosslight_shrine" &&
      !this.registry.get("lost_cat_event_triggered")
    ) {
      const activeQuests = this.registry.get("activeQuests") || {};
      const lc = activeQuests["quest_lina_lost_cat"];
      if (lc && !lc.completed && !lc.objectives[1].completed) {
        this.triggerLostCatEvent();
      }
    }

    // 1. Check Warps
    const warp = this.mapData.warps.find(
      (w) => w.x === this.player.tileX && w.y === this.player.tileY,
    );
    if (warp) {
      // Add a slight delay to prevent warp loop jitter
      this.isMoving = true;
      this.events.emit("hideMapName");

      // Play Map Transition SE
      import("../systems/audioManager.js").then((module) => {
        module.audioManager.playSE("se_move");
      });

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
      if (tile && tile.index !== 0 && !this.isPartyDead()) {
        const encounter = encounterSystem.checkEncounter(this.mapId, 0.15);
        if (encounter) {
          this.triggerBattle(encounter);
        }
      }
    }
  }

  handleInteraction() {
    if (this.isTransitioning || this.isMoving || this.isDialogueActive) return;

    // Determine tile in front of player
    let targetX = this.player.tileX;
    let targetY = this.player.tileY;

    if (this.playerDir === "left") targetX--;
    else if (this.playerDir === "right") targetX++;
    else if (this.playerDir === "up") targetY--;
    else if (this.playerDir === "down") targetY++;

    // Relic usage check at Shrine Altar
    if (this.mapId === "mosslight_shrine" && targetY <= 2) {
      const activeQuests = this.registry.get("activeQuests") || {};
      const fa = activeQuests["forest_awakening"];
      if (fa && !fa.completed && fa.objectives.find(o => o.id === "defeat_rowan").completed && !fa.objectives.find(o => o.id === "use_relic").completed) {
        // Trigger relic usage
        questSystem.completeObjective(this.registry, "forest_awakening", "use_relic");

        // Relic Event Feedback
        this.events.emit("notifyItem", {
          message: "신전의 중심부에서 정화의 유물을 조율합니다...",
          color: 0x3498db,
        });

        // Pause to let the message show then trigger climax
        setTimeout(() => {
          this.runClimaxSequence();
        }, 1500);

        return;
      }
    }

    // Find NPC Sprite
    const npcSprite = this.npcs
      .getChildren()
      .find((n) => n.tileX === targetX && n.tileY === targetY);

    if (npcSprite) {
      if (npcSprite.isHerb) {
        this.collectHerb(npcSprite);
        return;
      }

      if (npcSprite.npcId === "lost_cat") {
        this.handleLostCatPickup(npcSprite);
        return;
      }

      // Find NPC Data
      let npcId = npcSprite.npcId;
      // Fallback: mira is actually Chief Hyunseok (elder_hyunseok)
      if (npcId === "mira") npcId = "elder_hyunseok";

      const npcData = NPCS[npcId];

      if (!npcData) {
        console.warn(`WorldScene: NPC ID '${npcId}' not found in npcs.js`);
        return;
      }

      this.isDialogueActive = true;

      // Automatic Quest Start Logic
      const activeQuests = this.registry.get("activeQuests") || {};
      const status = this.getNpcQuestStatus(npcId, activeQuests);
      if (status === "available") {
        if (npcId === "shopkeeper")
          questSystem.startQuest(this.registry, "quest_toby_supply");
        else if (npcId === "villager1")
          questSystem.startQuest(this.registry, "quest_lina_lost_cat");
        else if (npcId === "elder_hyunseok") {
          const lc = questSystem.getQuest(this.registry, "quest_lina_lost_cat");
          const ld = questSystem.getQuest(this.registry, "quest_luke_despair");
          if (lc?.completed)
            questSystem.startQuest(this.registry, "quest_sera_blockade");
          else if (ld?.completed)
            questSystem.startQuest(this.registry, "quest_chiefs_relic");
        } else if (npcId === "trainer_luke") {
          questSystem.startQuest(this.registry, "quest_luke_despair");
        }
      }

      let pages = npcData.getDialogue(this.registry);

      // Pre-dialogue objective triggers
      if (npcData.id === "Chief Hyunseok") {
        const quest = questSystem.getQuest(this.registry, "first_steps");
        if (
          quest &&
          !quest.objectives.find((o) => o.id === "talk_mira").completed
        ) {
          questSystem.completeObjective(
            this.registry,
            "first_steps",
            "talk_mira",
          );
        } else if (
          quest &&
          quest.objectives.find((o) => o.id === "capture_cat").completed
        ) {
          questSystem.completeObjective(
            this.registry,
            "first_steps",
            "return_mira",
          );
        }

        // --- Added fixes for elder_hyunseok interactions missing earlier ---
        const seraQuest = questSystem.getQuest(this.registry, "quest_sera_blockade");
        const lukeQuest = questSystem.getQuest(this.registry, "quest_luke_despair");
        const relicQuest = questSystem.getQuest(this.registry, "quest_chiefs_relic");

        if (seraQuest && !seraQuest.completed) {
          questSystem.completeObjective(
            this.registry,
            "quest_sera_blockade",
            "talk_chief",
          );
        } else if (lukeQuest && !lukeQuest.completed && lukeQuest.objectives.find(o => o.id === "defeat_luke").completed) {
          questSystem.completeObjective(
            this.registry,
            "quest_luke_despair",
            "report_chief"
          );
        } else if (relicQuest && !relicQuest.completed) {
          questSystem.completeObjective(
            this.registry,
            "quest_chiefs_relic",
            "receive_relic",
          );
        }
      } else if (npcId === "shopkeeper") {
        const quest = questSystem.getQuest(this.registry, "quest_toby_supply");
        if (quest) {
          if (!quest.objectives[0].completed) {
            questSystem.completeObjective(
              this.registry,
              "quest_toby_supply",
              "talk_toby",
            );
            this.wasQuestUpdatedInInteraction = true;
          } else if (
            quest.objectives[1].completed &&
            !quest.objectives[2].completed
          ) {
            questSystem.completeObjective(
              this.registry,
              "quest_toby_supply",
              "return_toby",
            );
            this.wasQuestUpdatedInInteraction = true;
          }
        }
      } else if (npcId === "villager1") {
        const quest = questSystem.getQuest(
          this.registry,
          "quest_lina_lost_cat",
        );
        if (quest) {
          if (!quest.objectives[0].completed) {
            questSystem.completeObjective(
              this.registry,
              "quest_lina_lost_cat",
              "talk_lina",
            );
          } else if (
            quest.objectives[1].completed &&
            !quest.objectives[2].completed
          ) {
            questSystem.completeObjective(
              this.registry,
              "quest_lina_lost_cat",
              "return_lina",
            );
          }
        }
      }

      console.log(`WorldScene: Interacting with ${npcSprite.npcId}`, npcData);

      // Look at player
      const oppDir = { up: "down", down: "up", left: "right", right: "left" };
      npcSprite.setFrame(npcSprite.animFrames[oppDir[this.playerDir]][1]);

      this.scene.launch("DialogScene", {
        dialogue: {
          name: npcData.name,
          pages: pages,
          faceKey: npcData.faceKey,
          faceIndex: npcData.faceIndex || 0,
        },
        onComplete: () => {
          this.isDialogueActive = false;
          this.processNpcRole(npcSprite, npcData);
          this.wasQuestUpdatedInInteraction = false; // Reset for next time
          this.updateQuestIndicators();
        },
      });
    }
  }

  collectHerb(herbSprite) {
    this.registry.set(`${herbSprite.herbId}_picked`, true);

    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playME("me_item_get");
    });

    this.events.emit("notifyItem", {
      message: "신비한 약초를 채집했습니다!",
      color: 0x2ecc71,
    });

    const activeQuests = this.registry.get("activeQuests") || {};
    const ts = activeQuests["quest_toby_supply"];
    if (ts) {
      if (ts.objectives[1].count < 3) {
        ts.objectives[1].count = (ts.objectives[1].count || 0) + 1;
        ts.objectives[1].text = `[그린포우 숲] 신비한 약초 3개 채집하기 (${ts.objectives[1].count}/3)`;
        this.registry.set("activeQuests", activeQuests);

        // Complete objective properly to emit events if reached 3
        if (ts.objectives[1].count >= 3) {
          questSystem.completeObjective(this.registry, "quest_toby_supply", "collect_herbs");
        } else {
          // Just update UI manually if not fully complete
          const uiScene = this.scene.manager.getScene("UIScene");
          if (uiScene) uiScene.events.emit("updateQuests");
        }
      }
    }

    herbSprite.destroy();
    this.updateQuestIndicators();
  }

  async playCutscene(
    npcSprite,
    targetTileX,
    targetTileY,
    dialogueKey,
    onCompleteCallback,
  ) {
    this.isDialogueActive = true;
    this.player.play(`player_walk_${this.playerDir}`, false).stop();
    this.player.setFrame(this.player.animFrames[this.playerDir][1]);

    const tx = targetTileX * 32 + 16;
    const ty = (targetTileY + 1) * 32;

    // Movement animation
    const dx = targetTileX - npcSprite.tileX;
    const dy = targetTileY - npcSprite.tileY;
    let dir = "down";
    if (dx > 0) dir = "right";
    else if (dx < 0) dir = "left";
    else if (dy > 0) dir = "down";
    else if (dy < 0) dir = "up";

    npcSprite.play(`${npcSprite.npcId}_walk_${dir}`, true);

    await new Promise((resolve) => {
      this.tweens.add({
        targets: npcSprite,
        x: tx,
        y: ty,
        duration: Math.abs(dx + dy) * this.movementDuration * 1.5,
        onComplete: () => {
          npcSprite.stop();
          npcSprite.tileX = targetTileX;
          npcSprite.tileY = targetTileY;
          resolve();
        },
      });
    });

    const npcData = NPCS[npcSprite.npcId];
    this.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: NPCS[dialogueKey]
          ? NPCS[dialogueKey].getDialogue(this.registry)
          : npcData.getDialogue(this.registry),
        faceKey: npcData.faceKey,
        faceIndex: npcData.faceIndex || 0,
      },
      onComplete: () => {
        this.isDialogueActive = false;
        if (onCompleteCallback) onCompleteCallback();
        this.updateQuestIndicators();
      },
    });
  }

  /**
   * Dispatches behavior based on the NPC's role rather than hardcoded IDs.
   */
  processNpcRole(npcSprite, npcData) {
    let currentRole = npcData.role;

    // Story-based role overrides
    if (npcSprite.npcId === "eugene" && this.registry.get("chapter1_done")) {
      currentRole = "healer_quest";
    } else if (
      npcSprite.npcId === "mira" &&
      this.registry.get("chapter1_done")
    ) {
      currentRole = "prison";
    }

    switch (currentRole) {
      case "healer_quest":
        this.healParty();
        // Transition Quest logic
        const qH = this.registry.get("activeQuests") || {};
        const firstSteps = qH["first_steps"];
        const seraBlockade = qH["quest_sera_blockade"];
        const lukeDespair = qH["quest_luke_despair"];

        if (
          firstSteps &&
          !firstSteps.completed &&
          firstSteps.objectives.find((o) => o.id === "return_mira").completed
        ) {
          questSystem.completeObjective(
            this.registry,
            "first_steps",
            "return_mira",
          );
          this.events.emit("notifyItem", {
            message: "새로운 퀘스트: 숲의 각성",
            color: 0xf1c40f,
          });
        }

        // Handle Sera Report Back
        if (seraBlockade && !seraBlockade.completed && seraBlockade.objectives.find(o => o.id === "defeat_sera").completed) {
          questSystem.completeObjective(this.registry, "quest_sera_blockade", "report_chief");
        }

        // Handle Luke Report Back
        if (lukeDespair && !lukeDespair.completed && lukeDespair.objectives.find(o => o.id === "defeat_luke").completed) {
          questSystem.completeObjective(this.registry, "quest_luke_despair", "report_chief");
        }

        // Also fallback to default quest assignment if possible
        if (!qH["quest_toby_supply"] && qH["first_steps"]?.completed) {
          this.startQuest("quest_toby_supply");
        } else if (
          qH["quest_toby_supply"]?.completed &&
          qH["quest_lina_lost_cat"]?.completed &&
          !qH["quest_sera_blockade"]
        ) {
          this.startQuest("quest_sera_blockade");
        } else if (
          qH["quest_sera_blockade"]?.completed &&
          !qH["quest_luke_despair"]
        ) {
          this.startQuest("quest_luke_despair");
        } else if (
          qH["quest_luke_despair"]?.completed &&
          !qH["quest_chiefs_relic"]
        ) {
          this.startQuest("quest_chiefs_relic");
        } else if (qH["quest_chiefs_relic"]) {
          if (qH["quest_chiefs_relic"].objectives[0].completed) {
            if (!(this.registry.get("playerInventory") || {}).purification_relic) {
              this.registry.set("playerInventory", {
                ...this.registry.get("playerInventory"),
                purification_relic: 1,
              });
              this.events.emit("notifyItem", {
                message: "정화의 유물을 획득했습니다!",
                color: 0x3498db,
              });
            }
            if (!qH["forest_awakening"]) {
              this.startQuest("forest_awakening");
            }
          }
        }
        break;
      case "shopkeeper":
        if (this.wasQuestUpdatedInInteraction) {
          console.log("WorldScene: Skipping shop launch due to quest progression.");
          return;
        }
        this.scene.pause();
        this.scene.launch("ShopScene");
        break;
      case "trainer":
      case "boss_trainer":
        if (this.isPartyDead()) {
          this.events.emit("notifyItem", {
            message: `모든 고양이가 쓰러졌습니다! 촌장 현석에게 치료를 받으세요.`,
            color: 0xe74c3c,
          });
          return;
        }
        const defeated = this.registry.get("defeatedTrainers") || [];
        if (!defeated.includes(npcData.trainerId)) {
          const activeQuests = this.registry.get("activeQuests") || {};

          if (npcData.trainerId === "ellie") {
            const forestQuest = activeQuests["forest_awakening"];
            if (!forestQuest || forestQuest.completed) {
              this.scene.launch("DialogScene", {
                dialogue: {
                  name: npcData.name,
                  pages: npcData.getDialogue(this.registry),
                  faceKey: npcData.faceKey,
                  faceIndex: npcData.faceIndex || 0,
                },
                onComplete: () => {
                  this.isDialogueActive = false;
                  this.updateQuestIndicators();
                },
              });
              return;
            }
          } else if (npcData.trainerId === "sera") {
            const seraQuest = activeQuests["quest_sera_blockade"];
            if (!seraQuest || seraQuest.completed || seraQuest.objectives.find(o => o.id === "defeat_sera").completed) {
              this.scene.launch("DialogScene", {
                dialogue: {
                  name: npcData.name,
                  pages: npcData.getDialogue(this.registry),
                  faceKey: npcData.faceKey,
                  faceIndex: npcData.faceIndex || 0,
                },
                onComplete: () => {
                  this.isDialogueActive = false;
                  this.updateQuestIndicators();
                },
              });
              return;
            }
          } else if (npcData.trainerId === "luke") {
            const lukeQuest = activeQuests["quest_luke_despair"];
            if (!lukeQuest || lukeQuest.completed || lukeQuest.objectives.find(o => o.id === "defeat_luke").completed) {
              this.scene.launch("DialogScene", {
                dialogue: {
                  name: npcData.name,
                  pages: npcData.getDialogue(this.registry),
                  faceKey: npcData.faceKey,
                  faceIndex: npcData.faceIndex || 0,
                },
                onComplete: () => {
                  this.isDialogueActive = false;
                  this.updateQuestIndicators();
                },
              });
              return;
            }
          }

          this.isTransitioning = true;
          this.triggerTrainerBattle(npcData.trainerId);
        } else {
          // Post-battle quest completion
          if (npcData.trainerId === "guardian_rowan") {
            questSystem.completeObjective(
              this.registry,
              "forest_awakening",
              "defeat_rowan",
            );

            // Hide Rowan
            const rowan = this.npcs.getChildren().find(n => n.npcId === "trainer_guardian_rowan");
            if (rowan) rowan.destroy();

            // Prompt user
            this.events.emit("notifyItem", {
              message: "신전 중심부(최상단)로 이동해 [Spacebar]로 정화의 유물을 조율하세요.",
              color: 0x3498db,
            });
          } else if (npcData.trainerId === "sera") {
            questSystem.completeObjective(
              this.registry,
              "quest_sera_blockade",
              "defeat_sera",
            );
          } else if (npcData.trainerId === "luke") {
            questSystem.completeObjective(
              this.registry,
              "quest_luke_despair",
              "defeat_luke",
            );
          }
        }
        break;
      case "lore_npc":
        if (npcData.id === "Chief Hyunseok") {
          const quests = this.registry.get("activeQuests") || {};
          if (
            quests["quest_sera_blockade"] &&
            quests["quest_sera_blockade"].completed &&
            !quests["quest_luke_despair"]
          ) {
            // Automatically move to Luke quest handled elsewhere
          }
        }
        break;
      default:
        // Transition Quest start/report logic
        const q = this.registry.get("activeQuests") || {};
        if (npcData.id === "Chief Hyunseok") {
          if (!q["quest_toby_supply"] && q["first_steps"]?.completed) {
            this.startQuest("quest_toby_supply");
          } else if (
            q["quest_toby_supply"]?.completed &&
            q["quest_lina_lost_cat"]?.completed &&
            !q["quest_sera_blockade"]
          ) {
            this.startQuest("quest_sera_blockade");
          } else if (
            q["quest_sera_blockade"]?.completed &&
            !q["quest_luke_despair"]
          ) {
            this.startQuest("quest_luke_despair");
          } else if (
            q["quest_luke_despair"]?.completed &&
            !q["quest_chiefs_relic"]
          ) {
            this.startQuest("quest_chiefs_relic");
          } else if (q["quest_chiefs_relic"]) {
            if (
              q["quest_chiefs_relic"].objectives[0].completed
            ) {
              if (!(this.registry.get("playerInventory") || {}).purification_relic) {
                this.registry.set("playerInventory", {
                  ...this.registry.get("playerInventory"),
                  purification_relic: 1,
                });

                this.events.emit("notifyItem", {
                  message: "정화의 유물을 획득했습니다!",
                  color: 0x3498db,
                });
              }
              if (!q["forest_awakening"]) {
                this.startQuest("forest_awakening");
              }
            }
          }
        } else if (npcData.id === "shopkeeper") {
          if (q["quest_toby_supply"]) {
            questSystem.completeObjective(
              this.registry,
              "quest_toby_supply",
              "talk_toby",
            );
            if (q["quest_toby_supply"].objectives[1].completed) {
              questSystem.completeObjective(
                this.registry,
                "quest_toby_supply",
                "return_toby",
              );
            }
          }
        } else if (npcData.id === "villager1") {
          if (q["quest_lina_lost_cat"]) {
            questSystem.completeObjective(
              this.registry,
              "quest_lina_lost_cat",
              "talk_lina",
            );
            if (q["quest_lina_lost_cat"].objectives[1].completed) {
              questSystem.completeObjective(
                this.registry,
                "quest_lina_lost_cat",
                "return_lina",
              );
            }
          } else if (q["quest_toby_supply"]?.completed) {
            this.startQuest("quest_lina_lost_cat");
          }
        } else if (npcData.id === "trainer_sera") {
          if (q["quest_sera_blockade"] && !q["quest_luke_despair"]) {
            this.startQuest("quest_luke_despair");
          }
        }
        break;
    }
  }

  startQuest(id) {
    if (questSystem.startQuest(this.registry, id)) {
      const q = questSystem.getQuest(this.registry, id);
      this.events.emit("notifyItem", {
        message: `새로운 퀘스트: ${q.title}`,
        color: 0xf1c40f,
      });
      this.updateQuestIndicators();
    }
  }

  async triggerLostCatEvent() {
    this.registry.set("lost_cat_event_triggered", true);
    cutsceneSystem.lockInput(this);

    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playBGS("bgs_quake");
    });

    await cutsceneSystem.shakeCamera(this, 2000, 0.02);

    // Spawn cat at a valid within-bounds location (grass area on right)
    const spawnX = 11,
      spawnY = 4;
    const cat = this.add.sprite(
      spawnX * 32 + 16,
      (spawnY + 1) * 32,
      "animal",
      40,
    ); // Cat index
    cat.setOrigin(0.5, 1);
    cat.npcId = "lost_cat";
    cat.tileX = spawnX;
    cat.tileY = spawnY;
    this.npcs.add(cat);

    await cutsceneSystem.panCameraTo(this, cat.x, cat.y, 1000);

    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_cat");
      module.audioManager.stopBGS();
    });

    await cutsceneSystem.delay(this, 1000);
    await cutsceneSystem.restoreCameraToPlayer(this, 1000);

    cutsceneSystem.unlockInput(this);
    this.updateQuestIndicators();
  }

  async handleLostCatPickup(catSprite) {
    this.isDialogueActive = true;
    import("../systems/audioManager.js").then((module) =>
      module.audioManager.playSE("se_cat"),
    );

    this.events.emit("notifyItem", {
      message: "고양이를 발견하여 품에 안았습니다!",
      color: 0x2ecc71,
    });

    questSystem.completeObjective(
      this.registry,
      "quest_lina_lost_cat",
      "find_cat",
    );

    catSprite.destroy();
    this.isDialogueActive = false;
    this.updateQuestIndicators();
  }

  checkEventTriggers() {
    // Current event triggers (handled in onMoveComplete for better control)
    return false;
  }

  async runMosslightBossIntro() {
    // Find Rowan
    const rowan = this.npcs
      .getChildren()
      .find((n) => n.npcId === "trainer_guardian_rowan");
    if (!rowan) return;

    cutsceneSystem.lockInput(this);

    // Pan camera to Rowan
    await cutsceneSystem.panCameraTo(this, rowan.x, rowan.y * 32, 1500);

    await cutsceneSystem.delay(this, 500);

    const npcData = NPCS["trainer_guardian_rowan"];
    await cutsceneSystem.playDialogue(this, npcData.name, [
      "여기까지 온 것을 보니 실력은 인정하겠다.",
      "하지만 이곳은 신성한 신전이다.",
      "세계의 균형을 지키기 위해…",
      "나는 너를 막아야 한다.",
    ]);

    // Pan back to player
    await cutsceneSystem.restoreCameraToPlayer(this, 1500);

    this.registry.set("boss_rowan_intro", true);
    cutsceneSystem.unlockInput(this);

    // Force trigger battle
    this.triggerTrainerBattle("guardian_rowan");
  }

  async runClimaxSequence() {
    this.isDialogueActive = true;
    cutsceneSystem.lockInput(this);

    // 1. Rowan's final words (if any additional needed, but npc dialogue already says enough)

    // 2. Chief Hyunseok Appears
    const spawn = this.mapData.spawns.find(
      (s) => s.id === "trainer_guardian_rowan",
    );
    const hyunseok = this.add.sprite(
      spawn.x * 32 + 16,
      (spawn.y + 5) * 32,
      "people4",
      37,
    ); // actor sheet index
    hyunseok.setOrigin(0.5, 1);
    hyunseok.setAlpha(0);
    hyunseok.setDepth(11);

    await cutsceneSystem.panCameraTo(this, hyunseok.x, hyunseok.y, 1000);

    this.tweens.add({
      targets: hyunseok,
      alpha: 1,
      duration: 1000,
    });

    await cutsceneSystem.delay(this, 1000);

    // Walk up to player
    await new Promise((resolve) => {
      this.tweens.add({
        targets: hyunseok,
        y: (spawn.y + 2) * 32,
        duration: 2000,
        onComplete: resolve,
      });
    });

    const npcData = NPCS["boss_hyunseok_climax"];

    // Play Climax BGM
    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playBGM("bgm_climax_event");
    });

    await cutsceneSystem.playDialogue(
      this,
      npcData.name,
      npcData.getDialogue(this.registry),
      npcData.faceKey,
      npcData.faceIndex,
    );

    // 3. Start Hidden Quest and Trigger Battle
    this.startQuest("climax_hyunseok_betrayal");

    this.registry.set("is_climax_battle", true);
    this.triggerTrainerBattle("boss_hyunseok");
  }

  async runPostClimaxSequence() {
    this.isDialogueActive = true;
    cutsceneSystem.lockInput(this);

    const npcData = NPCS["boss_hyunseok_defeated"];
    await cutsceneSystem.playDialogue(
      this,
      npcData.name,
      npcData.getDialogue(this.registry),
      npcData.faceKey,
      npcData.faceIndex,
    );

    // 4. Legendary Cats Scatter Effect
    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playBGS("bgs_quake");
    });

    await cutsceneSystem.shakeCamera(this, 3000, 0.05);
    this.cameras.main.flash(1000, 255, 255, 255);

    this.updateLogText("전설의 고양이들이 대륙 곳곳으로 흩어졌습니다...");

    await cutsceneSystem.delay(this, 2000);

    // 5. Final Fade and Set State
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.registry.set("chapter1_done", true);
      this.registry.set("is_climax_battle", false);

      // Stop Quake BGS
      import("../systems/audioManager.js").then((module) => {
        module.audioManager.stopBGS();
      });

      // Return to village prison
      this.scene.start("WorldScene", {
        mapId: "starwhisk_village",
        spawnX: 2,
        spawnY: 17,
      });
    });
  }

  updateLogText(text) {
    this.events.emit("notifyItem", { message: text, color: 0x3498db });
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
      repeat: 2,
    });

    await cutsceneSystem.shakeCamera(this, 1000, 0.02);

    const roarText = this.add
      .text(sprite.x, sprite.y - 40, "GROOOOAAAR!", {
        font: 'bold 24px "Press Start 2P", Courier',
        fill: "#e74c3c",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    await cutsceneSystem.delay(this, 1500);
    roarText.destroy();

    await cutsceneSystem.restoreCameraToPlayer(this, 1000);

    // Cinematic Sequence (Foreshadowing)
    await cutsceneSystem.delay(this, 1000);

    // Fade out the legendary sprite (it vanishes into the forest)
    this.tweens.add({
      targets: sprite,
      alpha: 0,
      y: sprite.y - 20,
      duration: 1000,
      onComplete: () => {
        sprite.destroy();
      },
    });

    await cutsceneSystem.delay(this, 1000);

    this.isDialogueActive = false;
    cutsceneSystem.unlockInput(this);

    // Note: Battle Scene is NOT launched here for foreshadowing
    console.log(
      `WorldScene: Legendary ${legendaryId} foreshadowed. No battle triggered in Chapter 1.`,
    );
  }

  healParty() {
    const party = this.registry.get("playerParty") || [];
    party.forEach((p) => (p.currentHp = p.maxHp));
    this.registry.set("playerParty", party);

    this.cameras.main.flash(300, 150, 255, 150);

    // Play Heal SE
    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_heal");
    });

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

    this.isEncounterTriggered = true;
    this.player.stop();
    this.player.setFrame(this.player.animFrames[this.playerDir][1]);

    this.events.emit("hideMapName");

    // Play Encounter SE
    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_encounter");
    });

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

    this.isEncounterTriggered = true;
    this.player.stop();
    this.player.setFrame(this.player.animFrames[this.playerDir][1]);

    this.events.emit("hideMapName");

    // Play Encounter SE
    import("../systems/audioManager.js").then((module) => {
      module.audioManager.playSE("se_encounter");
    });

    this.cameras.main.flash(500, 255, 255, 255);

    this.time.delayedCall(600, () => {
      this.scene.start("BattleScene", {
        enemyId: encounter.creatureId,
        enemyLevel: encounter.level,
      });
    });
  }

  isPartyDead() {
    const party = this.registry.get("playerParty") || [];
    if (party.length === 0) return false;
    return party.every((cat) => cat.currentHp <= 0);
  }
}
