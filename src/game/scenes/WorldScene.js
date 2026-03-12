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
    this.isEncounterTriggered = false;
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
    console.log(`WorldScene: NPCS keys = ${Object.keys(NPCS).join(', ')}`);
    console.log(`WorldScene: elder_hyunseok data =`, NPCS.elder_hyunseok);

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
    this.input.keyboard.on("keydown-C", () => this.openCodex());

    // 6. Camera Follow
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2); // Zoom in for the pixel RPG feel

    // 7. Map Name UI
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }

    this.time.delayedCall(10, () => {
      this.events.emit('displayMapName', this.mapData.name);

      // --- Map BGM Integration ---
      import('../systems/audioManager.js').then(module => {
        const bgmMap = {
          'starwhisk_village': 'bgm_village',
          'greenpaw_forest': 'bgm_forest_greenpaw',
          'mosslight_path': 'bgm_path_mosslight',
          'ancient_forest': 'bgm_forest_ancient',
          'mosslight_shrine': 'bgm_shrine_mosslight'
        };
        const bgmKey = bgmMap[this.mapId] || 'bgm_village';
        module.audioManager.setMapBGM(bgmKey);
        
        // Don't restart if already playing (e.g. from battle return)
        if (!data.triggerClimax && !data.triggerPostClimax) {
          module.audioManager.resumeMapBGM();
        }
      });

      if (data.triggerClimax) {
        this.runClimaxSequence();
      } else if (data.triggerPostClimax) {
        this.runPostClimaxSequence();
      } else {
        this.checkStoryTriggers(data);
      }
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
    this.player.setFrame(ASSETS.CHARACTERS.PLAYER.UP_FRAME || 1);

    this.scene.launch("DialogScene", {
      dialogue: {
        name: npcData.name,
        pages: customDialogue || npcData.getDialogue(this.registry),
        faceKey: npcData.faceKey,
        faceIndex: npcData.faceIndex || 0
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

          this.events.emit('notifyItem', {
            message: `포획 크리스탈 x2 획득!`,
            color: 0x27ae60
          });

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

  openCodex() {
    if (this.isDialogueActive || this.isMoving) return;
    this.events.emit('hideMapName');
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
    const isInitialSpawn = this.mapId === 'starwhisk_village' && !this.registry.get("intro_done");

    const tx = this.spawnX !== undefined ? this.spawnX : (isInitialSpawn ? 10 : (spawn ? spawn.x : 10));
    const ty = this.spawnY !== undefined ? this.spawnY : (isInitialSpawn ? 9 : (spawn ? spawn.y : 10));

    // Get frames for the specific character block
    const frames = this.getCharacterFrames(config.KEY, config.CHARACTER_INDEX);
    const startFrame = frames.down[1]; // Middle frame, down facing

    this.player = this.add.sprite(tx * 32 + 16, (ty + 1) * 32, config.KEY, startFrame);
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
    console.log(`WorldScene: getCharacterFrames for ${textureKey}, index ${charIndex}, sheet size: ${image.width}x${image.height}, cols: ${sheetCols}`);

    const blocksPerRow = 4;
    const blockX = charIndex % blocksPerRow;
    const blockY = Math.floor(charIndex / blocksPerRow);

    const startX = blockX * 3;
    const startY = blockY * 4;

    const frames = {
      down: [(startY + 0) * sheetCols + startX, (startY + 0) * sheetCols + startX + 1, (startY + 0) * sheetCols + startX + 2],
      left: [(startY + 1) * sheetCols + startX, (startY + 1) * sheetCols + startX + 1, (startY + 1) * sheetCols + startX + 2],
      right: [(startY + 2) * sheetCols + startX, (startY + 2) * sheetCols + startX + 1, (startY + 2) * sheetCols + startX + 2],
      up: [(startY + 3) * sheetCols + startX, (startY + 3) * sheetCols + startX + 1, (startY + 3) * sheetCols + startX + 2]
    };
    console.log(`WorldScene: calculated frames for ${textureKey}:`, frames);
    return frames;
  }

  createCharacterAnims(sprite, prefix, frames) {
    const directions = ['down', 'left', 'right', 'up'];
    directions.forEach(dir => {
      const key = `${prefix}_walk_${dir}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key: key,
          frames: this.anims.generateFrameNumbers(sprite.texture.key, { frames: frames[dir] }),
          frameRate: 8,
          repeat: -1
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
          console.warn(`WorldScene: No data for NPC '${npcId}' in createNPCs`);
          return;
        }

        // --- Chief Hyunseok Visibility Logic ---
        if (npcId === "elder_hyunseok") {
          const firstSteps = questSystem.getQuest(this.registry, 'first_steps');
          const isRowanDefeated = (this.registry.get("defeatedTrainers") || []).includes("guardian_rowan");
          
          if (firstSteps && firstSteps.completed && !isRowanDefeated) {
             // He "leaves" for the shrine (or hides his presence)
             console.log("WorldScene: Chief Hyunseok is currently at the shrine.");
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
        const config = Object.values(ASSETS.CHARACTERS).find(c => c.KEY === spriteKey) || ASSETS.CHARACTERS.PEOPLE1;

        const characterIndex = npcData.characterIndex !== undefined ? npcData.characterIndex : (config.CHARACTER_INDEX || 0);

        const frames = this.getCharacterFrames(config.KEY, characterIndex);
        const startFrame = frames.down[1];

        let nx = spawn.x;
        let ny = spawn.y;

        // Custom positioning for prison scene
        if (npcId === "elder_hyunseok" && this.mapId === "starwhisk_village" && this.registry.get("chapter1_done")) {
          nx = 2;
          ny = 16;
          // (Prison construction logic remains same)
          const ground = this.mapData.layers.groundLayer;
          const collision = this.mapData.layers.collisionLayer;
          const rocks = [
            { x: 1, y: 15 }, { x: 2, y: 15 }, { x: 3, y: 15 },
            { x: 1, y: 16 }, { x: 3, y: 16 },
            { x: 1, y: 17 }, { x: 3, y: 17 }
          ];
          rocks.forEach(pos => {
            if (ground) this.mapData.map.putTileAt(4, pos.x, pos.y, true, ground);
            if (collision) this.mapData.map.putTileAt(4, pos.x, pos.y, true, collision);
          });
        }

        const npc = this.add.sprite(
          nx * 32 + 16,
          (ny + 1) * 32,
          config.KEY,
          startFrame
        );
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
    if (this.mapId === 'ancient_forest' && legendarySystem.canSpawnLegendary(this.registry, 'VERDANTLYNX')) {
      const lx = 20; // Deep in the forest
      const ly = 12;

      // Use the newly registered creature sprite asset
      const legSprite = this.add.sprite(lx * 32 + 16, (ly + 1) * 32, 'creature_verdantlynx');
      legSprite.setOrigin(0.5, 1);
      legSprite.npcId = 'legendary_verdantlynx';
      legSprite.tileX = lx;
      legSprite.tileY = ly;
      this.npcs.add(legSprite);
    }
  }

  update(time, delta) {
    if (this.isMoving || this.isDialogueActive || this.isEncounterTriggered) return;

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
    if (this.checkEventTriggers()) return;

    // 1. Check Warps
    const warp = this.mapData.warps.find(
      (w) => w.x === this.player.tileX && w.y === this.player.tileY,
    );
    if (warp) {
      // Add a slight delay to prevent warp loop jitter
      this.isMoving = true;
      this.events.emit('hideMapName');
      
      // Play Map Transition SE
      import('../systems/audioManager.js').then(module => {
        module.audioManager.playSE('se_move');
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
      let npcId = npcSprite.npcId;
      // Fallback: mira is actually Chief Hyunseok (elder_hyunseok)
      if (npcId === "mira") npcId = "elder_hyunseok";

      const npcData = NPCS[npcId];

      if (!npcData) {
        console.warn(`WorldScene: NPC ID '${npcId}' not found in npcs.js`);
        return;
      }

      this.isDialogueActive = true;
      let pages = npcData.getDialogue(this.registry);

      // Pre-dialogue objective triggers
      if (npcData.id === "Chief Hyunseok") {
        const quest = questSystem.getQuest(this.registry, "first_steps");
        if (quest && !quest.objectives.find((o) => o.id === "talk_mira").completed) {
          questSystem.completeObjective(this.registry, "first_steps", "talk_mira");
        } else if (quest && quest.objectives.find((o) => o.id === "capture_cat").completed) {
          questSystem.completeObjective(this.registry, "first_steps", "return_mira");
        }
      }

      console.log(`WorldScene: Interacting with ${npcSprite.npcId}`, npcData);
      this.scene.launch("DialogScene", {
        dialogue: {
          name: npcData.name,
          pages: pages,
          faceKey: npcData.faceKey,
          faceIndex: npcData.faceIndex || 0
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
        // Transition Quest logic
        const firstSteps = questSystem.getQuest(this.registry, 'first_steps');
        if (firstSteps && !firstSteps.completed && firstSteps.objectives.find(o => o.id === 'return_mira').completed) {
          // Chief has sent player to defeat Rowan
          questSystem.completeObjective(this.registry, 'first_steps', 'return_mira'); // This will mark firstSteps complete
          // Start next phase objectives are already in the registry but maybe we should explicitly announce it?
          this.events.emit('notifyItem', { message: "새로운 퀘스트: 숲의 각성", color: 0xf1c40f });
        }
        break;
      case "shopkeeper":
        this.scene.pause();
        this.scene.launch("ShopScene");
        break;
      case "trainer":
      case "boss_trainer":
        if (this.isPartyDead()) {
          this.events.emit('notifyItem', {
            message: `모든 고양이가 쓰러졌습니다! 촌장 현석에게 치료를 받으세요.`,
            color: 0xe74c3c
          });
          return;
        }
        const defeated = this.registry.get("defeatedTrainers") || [];
        if (!defeated.includes(npcData.trainerId)) {
          // Ellie only fights during the Rowan quest
          if (npcData.trainerId === 'ellie') {
            const activeQuests = this.registry.get('activeQuests') || {};
            const forestQuest = activeQuests['forest_awakening'];
            if (!forestQuest || forestQuest.completed) {
              console.log("WorldScene: Ellie is peaceful (no quest).");
              return; 
            }
          }
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
      const activeQuests = this.registry.get('activeQuests') || {};
      const forestQuest = activeQuests['forest_awakening'];
      const isQuestActive = forestQuest && !forestQuest.completed;

      if (this.player.tileY <= 6 && !this.registry.get('boss_rowan_intro') && isQuestActive) {
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

  async runClimaxSequence() {
    this.isDialogueActive = true;
    cutsceneSystem.lockInput(this);

    // 1. Rowan's final words (if any additional needed, but npc dialogue already says enough)

    // 2. Chief Hyunseok Appears
    const spawn = this.mapData.spawns.find(s => s.id === 'trainer_guardian_rowan');
    const hyunseok = this.add.sprite(spawn.x * 32 + 16, (spawn.y + 5) * 32, 'people4', 37); // actor sheet index
    hyunseok.setOrigin(0.5, 1);
    hyunseok.setAlpha(0);
    hyunseok.setDepth(11);

    await cutsceneSystem.panCameraTo(this, hyunseok.x, hyunseok.y, 1000);

    this.tweens.add({
      targets: hyunseok,
      alpha: 1,
      duration: 1000
    });

    await cutsceneSystem.delay(this, 1000);

    // Walk up to player
    await new Promise(resolve => {
      this.tweens.add({
        targets: hyunseok,
        y: (spawn.y + 2) * 32,
        duration: 2000,
        onComplete: resolve
      });
    });

    const npcData = NPCS['boss_hyunseok_climax'];
    
    // Play Climax BGM
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playBGM('bgm_climax_event');
    });

    await cutsceneSystem.playDialogue(this, npcData.name, npcData.getDialogue(this.registry), npcData.faceKey, npcData.faceIndex);

    // 3. Trigger Battle
    this.registry.set('is_climax_battle', true);
    this.triggerTrainerBattle('boss_hyunseok');
  }

  async runPostClimaxSequence() {
    this.isDialogueActive = true;
    cutsceneSystem.lockInput(this);

    const npcData = NPCS['boss_hyunseok_defeated'];
    await cutsceneSystem.playDialogue(this, npcData.name, npcData.getDialogue(this.registry), npcData.faceKey, npcData.faceIndex);

    // 4. Legendary Cats Scatter Effect
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playBGS('bgs_quake');
    });

    await cutsceneSystem.shakeCamera(this, 3000, 0.05);
    this.cameras.main.flash(1000, 255, 255, 255);

    this.updateLogText("전설의 고양이들이 대륙 곳곳으로 흩어졌습니다...");

    await cutsceneSystem.delay(this, 2000);

    // 5. Final Fade and Set State
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.registry.set('chapter1_done', true);
      this.registry.set('is_climax_battle', false);

      // Stop Quake BGS
      import('../systems/audioManager.js').then(module => {
        module.audioManager.stopBGS();
      });

      // Return to village prison
      this.scene.start('WorldScene', {
        mapId: 'starwhisk_village',
        spawnX: 2,
        spawnY: 17
      });
    });
  }

  updateLogText(text) {
    this.events.emit('notifyItem', { message: text, color: 0x3498db });
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
      }
    });

    await cutsceneSystem.delay(this, 1000);

    this.isDialogueActive = false;
    cutsceneSystem.unlockInput(this);

    // Note: Battle Scene is NOT launched here for foreshadowing
    console.log(`WorldScene: Legendary ${legendaryId} foreshadowed. No battle triggered in Chapter 1.`);
  }

  healParty() {
    const party = this.registry.get("playerParty") || [];
    party.forEach((p) => (p.currentHp = p.maxHp));
    this.registry.set("playerParty", party);

    this.cameras.main.flash(300, 150, 255, 150);

    // Play Heal SE
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_heal');
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

    this.events.emit('hideMapName');
    
    // Play Encounter SE
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_encounter');
    });

    this.cameras.main.flash(500, 255, 0, 0); // Red flash

    this.time.delayedCall(600, () => {
      this.scene.start("BattleScene", {
        isTrainer: true,
        trainerId: trainerId,
        onComplete: () => {
          if (trainerId === 'guardian_rowan') {
            this.runClimaxSequence();
          }
        }
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

    this.events.emit('hideMapName');
    
    // Play Encounter SE
    import('../systems/audioManager.js').then(module => {
      module.audioManager.playSE('se_encounter');
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
    return party.every(cat => cat.currentHp <= 0);
  }
}
