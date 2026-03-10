import { battleSystem } from '../systems/battleSystem.js';
import { codexSystem } from '../systems/codexSystem.js';
import { questSystem } from '../systems/questSystem.js';

/**
 * BattleScene
 * Handles the turn-based combat, capture logic, and results.
 */
export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    // 1. Get player data from Registry (with fallback for HMR testing)
    this.playerParty = this.registry.get('playerParty') || [];
    this.playerCat = this.playerParty[0];
    if (!this.playerCat) {
      console.warn('BattleScene: No player party found, using fallback Leafkit.');
      this.playerCat = battleSystem.createInstance('LEAFKIT', 5);
      this.registry.set('playerParty', [this.playerCat]);
    }

    // 2. Generate enemy from data passed by WorldScene (with fallback for HMR caching old boolean encounters)
    const enemyId = data.enemyId && typeof data.enemyId === 'string' ? data.enemyId : 'SNAGPUSS';
    this.enemyCat = battleSystem.createInstance(enemyId, data.enemyLevel || 2);

    if (!this.enemyCat) {
      console.warn(`BattleScene: Failed to load enemy ${enemyId}, falling back to Snagpuss.`);
      this.enemyCat = battleSystem.createInstance('SNAGPUSS', 2);
    }

    // 3. Mark Codex and Quests
    codexSystem.markSeen(this.registry, this.enemyCat.id);
    questSystem.completeObjective(this.registry, 'first_steps', 'trigger_encounter');

    // 4. Battle State
    this.isPlayerTurn = true;
    this.isBattleOver = false;
    this.canInput = true;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0);

    // --- UI SETUP ---
    this.createBattleUI(width, height);

    // --- INITIAL LOG ---
    this.updateLog(`A wild ${this.enemyCat.name} appeared!`);
  }

  createBattleUI(width, height) {
    // 1. Player UI (Bottom Right)
    this.playerUI = this.add.container(width * 0.7, height * 0.5);
    this.playerSprite = this.add.sprite(0, -60, this.playerCat.id.toLowerCase()).setScale(3);
    this.playerName = this.add.text(0, 0, `${this.playerCat.name} Lvl ${this.playerCat.level}`, { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5, 0);
    this.playerHpText = this.add.text(0, 30, `HP: ${this.playerCat.currentHp}/${this.playerCat.maxHp}`, { font: '20px Arial', fill: '#2ecc71' }).setOrigin(0.5, 0);

    // Player HP Bar
    this.playerHpBg = this.add.rectangle(0, 60, 150, 15, 0x000000).setOrigin(0.5, 0);
    this.playerHpBar = this.add.rectangle(-75, 60, 150, 15, 0x27ae60).setOrigin(0, 0);

    this.playerUI.add([this.playerSprite, this.playerName, this.playerHpText, this.playerHpBg, this.playerHpBar]);

    // 2. Enemy UI (Top Left)
    this.enemyUI = this.add.container(width * 0.3, height * 0.3);
    this.enemySprite = this.add.sprite(0, -60, 'npc').setScale(3); // Placeholder NPC sprite for wild cats for now
    this.enemyName = this.add.text(0, 0, `${this.enemyCat.name} Lvl ${this.enemyCat.level}`, { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5, 0);
    this.enemyHpText = this.add.text(0, 30, `HP: ${this.enemyCat.currentHp}/${this.enemyCat.maxHp}`, { font: '20px Arial', fill: '#e74c3c' }).setOrigin(0.5, 0);

    // Enemy HP Bar
    this.enemyHpBg = this.add.rectangle(0, 60, 150, 15, 0x000000).setOrigin(0.5, 0);
    this.enemyHpBar = this.add.rectangle(-75, 60, 150, 15, 0xc0392b).setOrigin(0, 0);

    this.enemyUI.add([this.enemySprite, this.enemyName, this.enemyHpText, this.enemyHpBg, this.enemyHpBar]);

    // 3. Battle Log (Bottom)
    this.logBg = this.add.rectangle(0, height - 150, width, 150, 0x000000, 0.8).setOrigin(0);
    this.logText = this.add.text(width / 2, height - 75, '', { font: '24px Arial', fill: '#ffffff', align: 'center', wordWrap: { width: width - 100 } }).setOrigin(0.5);

    // 4. Action Menu (Right Side)
    this.menuUI = this.add.container(width - 250, height - 350);
    const menuItems = ['Attack', 'Skill', 'Capture', 'Run'];
    this.menuButtons = [];

    menuItems.forEach((text, i) => {
      const btn = this.add.text(0, i * 60, text, { font: '28px Arial', fill: '#ffffff', backgroundColor: '#34495e', padding: { x: 20, y: 10 } })
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => this.handleAction(text));
      this.menuUI.add(btn);
      this.menuButtons.push(btn);
    });
  }

  handleAction(action) {
    if (!this.canInput || this.isBattleOver || !this.isPlayerTurn) return;

    this.canInput = false;
    this.menuUI.setVisible(false);

    switch (action) {
      case 'Attack': this.playerAttack(); break;
      case 'Skill': this.playerSkill(); break;
      case 'Capture': this.playerCapture(); break;
      case 'Run': this.playerRun(); break;
    }
  }

  playerAttack() {
    this.updateLog(`${this.playerCat.name} used Scratch!`);
    const damage = battleSystem.calculateDamage(this.playerCat, this.enemyCat, 'scratch');

    this.time.delayedCall(800, () => {
      this.applyDamage(this.enemyCat, damage, 'enemy');
      if (this.enemyCat.currentHp <= 0) {
        this.victory();
      } else {
        this.nextTurn();
      }
    });
  }

  playerSkill() {
    // Use the first specialized skill
    const skillId = this.playerCat.skills.find(s => s !== 'scratch') || 'scratch';
    this.updateLog(`${this.playerCat.name} used ${skillId.replace('_', ' ')}!`);
    const damage = battleSystem.calculateDamage(this.playerCat, this.enemyCat, skillId);

    this.time.delayedCall(800, () => {
      this.applyDamage(this.enemyCat, damage, 'enemy');
      if (this.enemyCat.currentHp <= 0) {
        this.victory();
      } else {
        this.nextTurn();
      }
    });
  }

  playerCapture() {
    this.updateLog(`You threw a capture crystal...`);

    this.time.delayedCall(1000, () => {
      if (battleSystem.checkCapture(this.enemyCat)) {
        this.updateLog('Success! You captured the wild cat!');
        
        // Update Codex and Quest
        codexSystem.markCaught(this.registry, this.enemyCat.id);
        questSystem.completeObjective(this.registry, 'first_steps', 'capture_cat');

        this.time.delayedCall(2000, () => {
          // Add to collection
          const collection = this.registry.get('playerCollection') || [];
          // Double check instanceId isn't duped (should be safe since it's newly created)
          if (!collection.find(c => c.instanceId === this.enemyCat.instanceId)) {
            collection.push(this.enemyCat);
            this.registry.set('playerCollection', collection);
            
            // Auto-add to party if space available (Max 3)
            if (this.playerParty.length < 3) {
                this.playerParty.push(this.enemyCat);
                this.registry.set('playerParty', this.playerParty);
                console.log(`BattleScene: Added ${this.enemyCat.name} to party.`);
            } else {
                console.log(`BattleScene: Party full. ${this.enemyCat.name} sent to collection.`);
            }
          }
          
          this.showSummaryPanel('Captured', 0, false, this.playerCat.level, false);
        });
      } else {
        this.updateLog('The wild cat broke free!');
        this.time.delayedCall(1000, () => this.nextTurn());
      }
    });
  }

  playerRun() {
    this.updateLog('You ran away...');
    this.time.delayedCall(1000, () => {
      this.showSummaryPanel('Fled', 0, false, this.playerCat.level, false);
    });
  }

  enemyTurn() {
    this.updateLog(`${this.enemyCat.name} used Scratch!`);
    const damage = battleSystem.calculateDamage(this.enemyCat, this.playerCat, 'scratch');

    this.time.delayedCall(1000, () => {
      this.applyDamage(this.playerCat, damage, 'player');
      if (this.playerCat.currentHp <= 0) {
        this.defeat();
      } else {
        this.nextTurn();
      }
    });
  }

  applyDamage(target, damage, targetType) {
    target.currentHp = Math.max(0, target.currentHp - damage);

    // Update HP UI
    const ratio = target.currentHp / target.maxHp;
    if (targetType === 'player') {
      this.playerHpText.setText(`HP: ${target.currentHp}/${target.maxHp}`);
      this.playerHpBar.width = 150 * ratio;
      this.cameras.main.shake(200, 0.01);
    } else {
      this.enemyHpText.setText(`HP: ${target.currentHp}/${target.maxHp}`);
      this.enemyHpBar.width = 150 * ratio;
      this.enemySprite.setTint(0xff0000);
      this.time.delayedCall(100, () => this.enemySprite.clearTint());
    }
  }

  nextTurn() {
    if (this.isBattleOver) return;

    this.isPlayerTurn = !this.isPlayerTurn;
    this.canInput = this.isPlayerTurn;

    if (this.isPlayerTurn) {
      this.updateLog(`What will ${this.playerCat.name} do?`);
      this.menuUI.setVisible(true);
    } else {
      this.enemyTurn();
    }
  }

  victory() {
    this.isBattleOver = true;
    
    // Calculate EXP
    const expGain = battleSystem.calculateExp(this.enemyCat);
    let oldLevel = this.playerCat.level;
    const leveledUp = battleSystem.gainExp(this.playerCat, expGain);
    let evolutionHappened = false;

    // Process Evolution if threshold hit
    if (this.playerCat.readyToEvolve) {
        battleSystem.evolveCreature(this.playerCat);
        evolutionHappened = true;
    }

    // Save party changes to registry to persist
    this.registry.set('playerParty', this.playerParty);
    
    // Also ensure collection reference reflects the updated HP/Level/Evolution
    const collection = this.registry.get('playerCollection') || [];
    const collIndex = collection.findIndex(c => c.instanceId === this.playerCat.instanceId);
    if (collIndex !== -1) collection[collIndex] = this.playerCat;
    this.registry.set('playerCollection', collection);

    this.updateLog("Battle won! Click the summary window to continue.");
    
    this.time.delayedCall(2000, () => {
      this.showSummaryPanel('Victory', expGain, leveledUp, oldLevel, evolutionHappened);
    });
  }

  defeat() {
    this.isBattleOver = true;
    
    // Persist HP (will be 0)
    this.registry.set('playerParty', this.playerParty);
    
    this.updateLog(`${this.playerCat.name} fainted...`);
    this.time.delayedCall(1500, () => {
      this.showSummaryPanel('Defeat', 0, false, this.playerCat.level, false);
    });
  }

  updateLog(msg) {
    this.logText.setText(msg);
  }

  showSummaryPanel(result, expGained, leveledUp, oldLevel, evolutionHappened) {
    const { width, height } = this.cameras.main;
    
    // Dim background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    const panelWidth = 600;
    const panelHeight = 400;
    const panelBg = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x2c3e50).setInteractive({ useHandCursor: true });
    this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight).setStrokeStyle(4, 0xecf0f1);

    this.add.text(width / 2, height / 2 - 150, `Battle Result: ${result}`, { font: 'bold 36px Arial', fill: '#f1c40f' }).setOrigin(0.5);

    let yPos = height / 2 - 80;

    if (result === 'Victory') {
      this.add.text(width / 2, yPos, `EXP Gained: +${expGained}`, { font: '24px Arial', fill: '#2ecc71' }).setOrigin(0.5);
      yPos += 40;
      
      const expNeeded = this.playerCat.level * 50;
      this.add.text(width / 2, yPos, `Total EXP: ${this.playerCat.exp} / ${expNeeded}`, { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5);
      yPos += 50;

      if (leveledUp) {
        this.add.text(width / 2, yPos, `LEVEL UP! (${oldLevel} -> ${this.playerCat.level})`, { font: 'bold 28px Arial', fill: '#3498db' }).setOrigin(0.5);
        yPos += 40;
      }
      if (evolutionHappened) {
        this.add.text(width / 2, yPos, `EVOLUTION! Now ${this.playerCat.name}`, { font: 'bold 28px Arial', fill: '#9b59b6' }).setOrigin(0.5);
        yPos += 40;
      }
    } else {
        this.add.text(width / 2, yPos, `No EXP gained.`, { font: '24px Arial', fill: '#95a5a6' }).setOrigin(0.5);
    }

    this.add.text(width / 2, height / 2 + 150, '- Click anywhere to continue -', { font: '20px Arial', fill: '#bdc3c7' }).setOrigin(0.5);

    // Click to proceed
    panelBg.on('pointerdown', () => this.endBattle());
  }

  endBattle() {
    // Ensure final state is saved right before transitioning
    this.registry.set('playerParty', this.playerParty);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Return to world using saved position
      const mapId = this.registry.get('world_mapId') || 'starwhisk_village';
      const tx = this.registry.get('world_spawnX');
      const ty = this.registry.get('world_spawnY');

      this.scene.start('WorldScene', {
        mapId, spawnX: tx, spawnY: ty
      });
    });
  }
}
