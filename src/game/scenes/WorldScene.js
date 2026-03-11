import Phaser from 'phaser';
import { mapLoader } from '../systems/mapLoader.js';
import { encounterSystem } from '../systems/encounterSystem.js';
import { dialogueSystem } from '../systems/dialogueSystem.js';
import { questSystem } from '../systems/questSystem.js';
import { TRAINers } from '../data/trainers.js';

/**
 * WorldScene
 * The main top-down exploration scene.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    // Current map configuration
    this.mapId = data.mapId || 'starwhisk_village';
    this.spawnX = data.spawnX; // Tile X
    this.spawnY = data.spawnY; // Tile Y
    
    // Movement state
    this.isMoving = false;
    this.movementDuration = 250; // ms per tile
    this.playerDir = 'down';
    
    // Interaction lock
    this.isDialogueActive = false;
  }

  preload() {
    // In Phase 6, we load map data dynamically or ensure it was preloaded
    mapLoader.preloadMap(this, 'starwhisk_village');
    mapLoader.preloadMap(this, 'greenpaw_forest');
    mapLoader.preloadMap(this, 'mosslight_path');
  }

  create() {
    console.log(`WorldScene: Entering ${this.mapId}`);

    // 1. Load Map
    this.mapData = mapLoader.createMap(this, this.mapId);
    if (!this.mapData) return;

    // Quest Check: Enter Forest
    if (this.mapId === 'greenpaw_forest') {
      questSystem.completeObjective(this.registry, 'first_steps', 'enter_forest');
    }

    // 2. Set Camera Bounds
    this.cameras.main.setBounds(0, 0, this.mapData.widthInPixels, this.mapData.heightInPixels);

    // 3. Create Player
    this.createPlayer();

    // 4. Create NPCs
    this.createNPCs();

    // 5. Input Handling
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    
    // Interaction Key (Space)
    this.input.keyboard.on('keydown-SPACE', () => this.handleInteraction());

    // Menu Key (ESC or ENTER)
    this.input.keyboard.on('keydown-ESC', () => this.openMenu());
    this.input.keyboard.on('keydown-ENTER', () => this.openMenu());

    // 6. Camera Follow
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2); // Zoom in for the pixel RPG feel

    // 7. Map Name UI
    this.createMapNameUI();
  }

  createMapNameUI() {
    const mapName = this.mapData.name;
    const padding = 10;
    
    // We add text to the scene
    this.mapNameText = this.add.text(padding, padding, mapName, {
      fontFamily: '"Press Start 2P", Courier, monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: true,
        fill: true
      }
    });

    // Fix position to camera so it doesn't move when walking
    this.mapNameText.setScrollFactor(0);
    this.mapNameText.setDepth(100);
  }

  openMenu() {
    if (this.isDialogueActive || this.isMoving) return;
    this.scene.pause();
    this.scene.launch('MenuScene');
  }

  /**
   * Spawns the player at the correct tile position.
   */
  createPlayer() {
    // If no specific spawn provided, use map default
    const spawn = this.mapData.spawns.find(s => s.type === 'player');
    const tx = this.spawnX !== undefined ? this.spawnX : (spawn ? spawn.x : 10);
    const ty = this.spawnY !== undefined ? this.spawnY : (spawn ? spawn.y : 10);

    // Phaser spritesheet index: 0:Down, 1:Up, 2:Left, 3:Right (Matching our Preload generation)
    this.player = this.add.sprite(tx * 32 + 16, ty * 32 + 16, 'player', 0);
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
    this.mapData.spawns.forEach(spawn => {
      if (spawn.type === 'npc') {
        const npc = this.add.sprite(spawn.x * 32 + 16, spawn.y * 32 + 16, 'npc');
        npc.npcId = spawn.id;
        npc.tileX = spawn.x;
        npc.tileY = spawn.y;
        this.npcs.add(npc);
      }
    });
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
    if (dx > 0) { this.playerDir = 'right'; this.player.setFrame(3); }
    else if (dx < 0) { this.playerDir = 'left'; this.player.setFrame(2); }
    else if (dy > 0) { this.playerDir = 'down'; this.player.setFrame(0); }
    else if (dy < 0) { this.playerDir = 'up'; this.player.setFrame(1); }

    // 1. Check Bounds
    if (nextX < 0 || nextX >= this.mapData.map.width || nextY < 0 || nextY >= this.mapData.map.height) return;

    // 2. Check Collision Layer
    const collisionLayer = this.mapData.layers.collisionLayer;
    if (collisionLayer) {
        const tile = collisionLayer.getTileAt(nextX, nextY);
        if (tile && tile.index !== 0) return; // Blocked
    }

    // 3. Check NPCs
    const npcAtTile = this.npcs.getChildren().find(n => n.tileX === nextX && n.tileY === nextY);
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
      }
    });
  }

  /**
   * Checks for warps or encounters after finishing a move.
   */
  onMoveComplete() {
    // 1. Check Warps
    const warp = this.mapData.warps.find(w => w.x === this.player.tileX && w.y === this.player.tileY);
    if (warp) {
      // Add a slight delay to prevent warp loop jitter
      this.isMoving = true; 
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('WorldScene', {
            mapId: warp.targetMap,
            spawnX: warp.targetX,
            spawnY: warp.targetY
          });
      });
      return;
    }

    // 2. Check Encounters
    const encounterLayer = this.mapData.layers.encounterLayer;
    if (encounterLayer) {
        const tile = encounterLayer.getTileAt(this.player.tileX, this.player.tileY);
        if (tile && tile.index !== 0) {
            const encounter = encounterSystem.checkEncounter(this.mapId, 0.15);
            if (encounter) {
                this.triggerBattle(encounter);
            }
        }
    }
  }

  /**
   * Handles NPC interaction when the action key is pressed.
   */
  handleInteraction() {
    if (this.isMoving || this.isDialogueActive) return;

    // Determine tile in front of player
    let targetX = this.player.tileX;
    let targetY = this.player.tileY;

    if (this.playerDir === 'left') targetX--;
    else if (this.playerDir === 'right') targetX++;
    else if (this.playerDir === 'up') targetY--;
    else if (this.playerDir === 'down') targetY++;

    // Find NPC
    const npc = this.npcs.getChildren().find(n => n.tileX === targetX && n.tileY === targetY);
    if (npc) {
      this.isDialogueActive = true;
      let dialogue;

      // Check if it's a Trainer
      if (npc.npcId.startsWith('trainer_')) {
          const trainerId = npc.npcId.replace('trainer_', '');
          const trainerData = TRAINers[trainerId];
          const defeatedTrainers = this.registry.get('defeatedTrainers') || [];
          const isDefeated = defeatedTrainers.includes(trainerId);

          dialogue = {
              name: trainerData.name,
              pages: [isDefeated ? trainerData.dialogueAfter : trainerData.dialogueBefore]
          };

          this.scene.launch('DialogScene', {
              dialogue: dialogue,
              onComplete: () => {
                  this.isDialogueActive = false;
                  if (!isDefeated) {
                      this.triggerTrainerBattle(trainerId);
                  }
              }
          });
          return;
      }

      // Standard NPC Dialogue
      dialogue = dialogueSystem.getDialogue(npc.npcId);
      
      // Quest progression for Elder Mira
      if (npc.npcId === 'mira') {
        const quest = questSystem.getQuest(this.registry, 'first_steps');
        if (quest && !quest.objectives.find(o => o.id === 'talk_mira').completed) {
          questSystem.completeObjective(this.registry, 'first_steps', 'talk_mira');
        } else if (quest && quest.objectives.find(o => o.id === 'capture_cat').completed) {
          questSystem.completeObjective(this.registry, 'first_steps', 'return_mira');
        }
      }

      this.scene.launch('DialogScene', {
        dialogue: dialogue,
        onComplete: () => {
          this.isDialogueActive = false;
          // Check special post-dialogue flags
          if (dialogue.pages.includes('[HEAL_PROMPT]')) {
              this.healParty();
          } else if (dialogue.pages.includes('[SHOP_PROMPT]')) {
              this.scene.pause();
              this.scene.launch('ShopScene');
          }
        }
      });
    }
  }

  healParty() {
      const party = this.registry.get('playerParty') || [];
      party.forEach(p => p.currentHp = p.maxHp);
      this.registry.set('playerParty', party);

      this.cameras.main.flash(300, 150, 255, 150);
      
      // Flash completely heals, log internally
      console.log("WorldScene: Party fully healed via Elder Mira.");
  }

  triggerTrainerBattle(trainerId) {
      console.log(`TRAINER BATTLE: ${trainerId}`);
      this.registry.set('world_mapId', this.mapId);
      this.registry.set('world_spawnX', this.player.tileX);
      this.registry.set('world_spawnY', this.player.tileY);

      this.cameras.main.flash(500, 255, 0, 0); // Red flash

      this.time.delayedCall(600, () => {
          this.scene.start('BattleScene', {
              isTrainer: true,
              trainerId: trainerId
          });
      });
  }

  triggerBattle(encounter) {
    if (!encounter) return;
    
    console.log(`ENCOUNTER TRIGGERED: ${encounter.creatureId} Lvl ${encounter.level}`);
    
    // Save return state
    this.registry.set('world_mapId', this.mapId);
    this.registry.set('world_spawnX', this.player.tileX);
    this.registry.set('world_spawnY', this.player.tileY);

    this.cameras.main.flash(500, 255, 255, 255);
    
    this.time.delayedCall(600, () => {
        this.scene.start('BattleScene', {
            enemyId: encounter.creatureId,
            enemyLevel: encounter.level
        });
    });
  }
}
