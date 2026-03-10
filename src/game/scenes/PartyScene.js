import Phaser from 'phaser';
import { battleSystem } from '../systems/battleSystem.js';

/**
 * PartyScene
 * Interactive scene for managing the active Party (Max 3) and the Collection.
 */
export class PartyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PartyScene' });
  }

  init(data) {
    data = data || {};
    this.isTargetMode = data.isTargetMode || false;
    this.itemId = data.itemId || null;
    this.itemEffect = data.itemEffect || 0;
    this.itemName = data.itemName || '';
    this.returnScene = data.returnScene || 'MenuScene';
  }

  create() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    this.party = this.registry.get('playerParty') || [];
    this.collection = this.registry.get('playerCollection') || [];

    // Ensure state integrity
    this.syncCollectionAndParty();

    this.createUI(width, height);
  }

  /**
   * Prevents desync bugs by ensuring all party members also exist as identical references in the collection.
   */
  syncCollectionAndParty() {
    this.party.forEach(pMember => {
      const matchIndex = this.collection.findIndex(c => c.instanceId === pMember.instanceId);
      if (matchIndex === -1) {
        this.collection.push(pMember);
      } else {
        this.collection[matchIndex] = pMember;
      }
    });
    this.saveState();
  }

  saveState() {
    this.registry.set('playerParty', this.party);
    this.registry.set('playerCollection', this.collection);
  }

  createUI(width, height) {
    if (this.mainContainer) this.mainContainer.destroy();
    
    this.mainContainer = this.add.container(0, 0);

    // Titles
    if (this.isTargetMode) {
      this.mainContainer.add(this.add.text(width / 2, 40, `Select target for ${this.itemName}`, { font: 'bold 36px Arial', fill: '#f1c40f' }).setOrigin(0.5));
    } else {
      this.mainContainer.add(this.add.text(width * 0.25, 40, `Active Party (${this.party.length}/3)`, { font: 'bold 32px Arial', fill: '#f1c40f' }).setOrigin(0.5));
      this.mainContainer.add(this.add.text(width * 0.75, 40, `Collection`, { font: 'bold 32px Arial', fill: '#bdc3c7' }).setOrigin(0.5));
    }

    this.mainContainer.add(this.add.text(width / 2, height - 30, 'Press ESC to return', { font: '20px Arial', fill: '#95a5a6' }).setOrigin(0.5));

    // Render Party List
    this.party.forEach((member, index) => {
      const cardX = this.isTargetMode ? width / 2 : width * 0.25;
      const card = this.createCreatureCard(member, cardX, 120 + (index * 130), true, index === 0);
      this.mainContainer.add(card);
    });

    // Render Collection List (Only if NOT in target mode)
    if (!this.isTargetMode) {
        // Only show creatures NOT currently in the party
        const partyIds = this.party.map(p => p.instanceId);
        const benchedCreatures = this.collection.filter(c => !partyIds.includes(c.instanceId));

        benchedCreatures.forEach((member, index) => {
          const card = this.createCreatureCard(member, width * 0.75, 120 + (index * 130), false, false);
          this.mainContainer.add(card);
        });
    }

    this.setupInputs();

    this.events.on('resume', () => {
        this.setupInputs();
    });

    // --- DEBUG CONTROLS (Temporary for Phase 5.5) ---
    this.add.text(width / 2, height - 90, '[DEBUG] 1: +50 EXP | 2: +200 EXP | 3: Lvl 9 (Pre-Evo) | 4: Heal', { font: '16px Arial', fill: '#e74c3c' }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ONE', () => this.debugAction('add50'));
    this.input.keyboard.on('keydown-TWO', () => this.debugAction('add200'));
    this.input.keyboard.on('keydown-THREE', () => this.debugAction('setLvl9'));
    this.input.keyboard.on('keydown-FOUR', () => this.debugAction('heal'));
  }

  setupInputs() {
    this.input.keyboard.off('keydown-ESC');
    this.input.keyboard.on('keydown-ESC', () => {
      // Remove debug listeners when leaving
      this.input.keyboard.off('keydown-ONE');
      this.input.keyboard.off('keydown-TWO');
      this.input.keyboard.off('keydown-THREE');
      this.input.keyboard.off('keydown-FOUR');
      
      this.scene.stop();
      this.scene.resume(this.returnScene);
    });
  }

  createCreatureCard(creature, x, y, isParty, isActive) {
    const card = this.add.container(x, y);
    const bgWidth = 500;
    const bgHeight = 110;

    const bgColor = isActive ? 0x27ae60 : (isParty ? 0x2980b9 : 0x34495e);
    const bg = this.add.rectangle(0, 0, bgWidth, bgHeight, bgColor).setInteractive({ useHandCursor: true });
    
    // Details
    const nameText = this.add.text(-bgWidth/2 + 20, -35, creature.name, { font: 'bold 24px Arial', fill: '#ffffff' });
    const lvlText = this.add.text(-bgWidth/2 + 20, -5, `Lvl ${creature.level}`, { font: '20px Arial', fill: '#ecf0f1' });
    const hpText = this.add.text(-bgWidth/2 + 20, 20, `HP: ${creature.currentHp}/${creature.maxHp}`, { font: '18px Arial', fill: '#e74c3c' });
    
    // Exact EXP Ratio
    const expNeeded = creature.level * 50;
    const expText = this.add.text(-bgWidth/2 + 150, 20, `EXP: ${creature.exp}/${expNeeded}`, { font: '18px Arial', fill: '#3498db' });
    
    // Action Buttons
    const btnContainer = this.add.container(bgWidth/2 - 120, 0);

    if (this.isTargetMode) {
      // In Target Mode, explicitly only show USE button for Party members
      if (isParty) {
          const useBtn = this.createButton(0, 0, 'Use Item', 0x27ae60, () => this.applyItem(creature));
          btnContainer.add(useBtn);
      }
    } else {
      if (isParty) {
        if (!isActive) {
          // Make Active Button
          const makeActiveBtn = this.createButton(0, -20, 'Make Active', 0xf39c12, () => this.makeActive(creature));
          btnContainer.add(makeActiveBtn);
        }
        
        // Remove Button (Only if party > 1)
        if (this.party.length > 1) {
          const removeBtn = this.createButton(0, 20, 'Remove', 0xc0392b, () => this.removeFromParty(creature));
          btnContainer.add(removeBtn);
        }
      } else {
        // Add to Party Button (Only if party < 3)
        if (this.party.length < 3) {
          const addBtn = this.createButton(0, 0, 'Add to Party', 0x27ae60, () => this.addToParty(creature));
          btnContainer.add(addBtn);
        }
      }
    }

    card.add([bg, nameText, lvlText, hpText, btnContainer]);
    return card;
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 150, 35, color).setInteractive({ useHandCursor: true });
    const label = this.add.text(0, 0, text, { font: '18px Arial', fill: '#ffffff' }).setOrigin(0.5);

    bg.on('pointerdown', callback);
    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout', () => bg.setAlpha(1));

    container.add([bg, label]);
    return container;
  }

  makeActive(creature) {
    const idx = this.party.findIndex(p => p.instanceId === creature.instanceId);
    if (idx > 0) {
      // Swap with index 0
      const temp = this.party[0];
      this.party[0] = this.party[idx];
      this.party[idx] = temp;
      
      this.saveState();
      this.createUI(this.cameras.main.width, this.cameras.main.height);
    }
  }

  removeFromParty(creature) {
    if (this.party.length <= 1) return; // Guard against 0 length party

    this.party = this.party.filter(p => p.instanceId !== creature.instanceId);
    this.saveState();
    this.createUI(this.cameras.main.width, this.cameras.main.height);
  }

  addToParty(creature) {
    if (this.party.length >= 3) return; // Guard against overfilling

    // Avoid duplication
    if (!this.party.find(p => p.instanceId === creature.instanceId)) {
        this.party.push(creature);
        this.saveState();
        this.createUI(this.cameras.main.width, this.cameras.main.height);
    }
  }

  applyItem(creature) {
     if (creature.currentHp >= creature.maxHp) {
        // Full HP, deny usage to save the item
        this.cameras.main.shake(100, 0.005);
        return;
     }

     // Double check inventory
     const inventory = this.registry.get('playerInventory') || {};
     if (!inventory[this.itemId] || inventory[this.itemId] <= 0) return;

     // Consume item
     inventory[this.itemId]--;
     this.registry.set('playerInventory', inventory);

     // Apply Healing
     creature.currentHp = Math.min(creature.maxHp, creature.currentHp + this.itemEffect);
     
     // Save and Return cleanly
     this.saveState();
     this.cameras.main.flash(200, 150, 255, 150);

     this.time.delayedCall(300, () => {
         this.scene.stop();
         
         // Resume InventoryScene and tell it to wake up to refresh counts
         this.scene.resume(this.returnScene);
         const returnInstance = this.scene.get(this.returnScene);
         if (returnInstance && returnInstance.wake) {
             returnInstance.wake();
         }
     });
  }

  // --- DEBUG METHODS ---
  debugAction(actionType) {
    if (this.party.length === 0) return;
    const active = this.party[0];

    if (actionType === 'add50') {
        battleSystem.gainExp(active, 50);
        if (active.readyToEvolve) battleSystem.evolveCreature(active);
    } else if (actionType === 'add200') {
        battleSystem.gainExp(active, 200);
        if (active.readyToEvolve) battleSystem.evolveCreature(active);
    } else if (actionType === 'setLvl9') {
        active.level = 9;
        active.exp = 400; // Close to level 10
        active.maxHp = Math.floor(active.baseHp * (1 + (9 - 1) * 0.1));
        active.currentHp = active.maxHp;
        active.stats.attack = Math.floor(active.baseAttack * (1 + (9 - 1) * 0.1));
        active.stats.defense = Math.floor(active.baseDefense * (1 + (9 - 1) * 0.1));
    } else if (actionType === 'heal') {
        active.currentHp = active.maxHp;
    }

    this.saveState();
    this.createUI(this.cameras.main.width, this.cameras.main.height);
  }
}
