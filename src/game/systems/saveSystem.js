/**
 * saveSystem.js
 * Handles extracting global phase state from the Phaser registry,
 * serializing it to localStorage, and loading it back in safely.
 */

const SAVE_KEY = 'feloria_save_data';
const SAVE_VERSION = 1;

const getSaveKey = (slot) => `feloria_save_data_${slot}`;

export const saveSystem = {
  /**
   * Checks if valid save data exists in a specific slot.
   */
  hasSaveData: (slot = 0) => {
    const dataStr = localStorage.getItem(getSaveKey(slot));
    if (!dataStr) return false;
    
    try {
      const data = JSON.parse(dataStr);
      return data && data.version >= 1 && data.state;
    } catch (e) {
      console.warn("Save data corrupted or invalid.");
      return false;
    }
  },

  /**
   * Extracts state from registry and active world parameters, saving it.
   * @param {Phaser.Data.DataManager} registry 
   * @param {string} mapId 
   * @param {number} playerX 
   * @param {number} playerY 
   */
  saveData: (registry, mapId, playerX, playerY, slot = 0) => {
    const state = {
      playerName: registry.get('playerName') || 'Hero',
      selectedStarter: registry.get('selectedStarter') || null,
      
      // Core progression arrays/objects
      playerParty: registry.get('playerParty') || [],
      playerCollection: registry.get('playerCollection') || [],
      playerInventory: registry.get('playerInventory') || {},
      
      // Currencies and trackers
      playerGold: registry.get('playerGold') || 0,
      seenCreatureIds: registry.get('seenCreatureIds') || [],
      caughtCreatureIds: registry.get('caughtCreatureIds') || [],
      defeatedTrainers: registry.get('defeatedTrainers') || [],
      activeQuests: registry.get('activeQuests') || [],
      completedQuests: registry.get('completedQuests') || [],

      // Story Flags
      intro_started: registry.get('intro_started') || false,
      intro_done: registry.get('intro_done') || false,
      chapter1_done: registry.get('chapter1_done') || false,
      boss_rowan_intro: registry.get('boss_rowan_intro') || false,
      is_climax_battle: registry.get('is_climax_battle') || false,

      // World state
      currentMapId: mapId,
      playerX: playerX,
      playerY: playerY
    };

    const saveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      state: state
    };

    try {
      localStorage.setItem(getSaveKey(slot), JSON.stringify(saveData));
      console.log(`[SaveSystem] Successfully saved game state to slot ${slot} at ${new Date(saveData.timestamp).toLocaleTimeString()}`);
      return true;
    } catch (e) {
      console.error("[SaveSystem] Failed to stringify or save to localStorage:", e);
      return false;
    }
  },

  /**
   * Loads state from localStorage and writes it directly over the active registry.
   * Returns routing information for the WorldScene to use.
   * @param {Phaser.Data.DataManager} registry 
   * @param {number} slot 
   */
  loadData: (registry, slot = 0) => {
    const dataStr = localStorage.getItem(getSaveKey(slot));
    if (!dataStr) {
      console.warn(`[SaveSystem] No save data found in slot ${slot}.`);
      return null;
    }

    try {
      const parsedSave = JSON.parse(dataStr);
      
      if (!parsedSave.state) {
        throw new Error("Save data missing 'state' object.");
      }

      const state = parsedSave.state;

      // Fully overwrite registry
      registry.set('playerName', state.playerName);
      registry.set('selectedStarter', state.selectedStarter);
      
      registry.set('playerParty', state.playerParty);
      registry.set('playerCollection', state.playerCollection);
      registry.set('playerInventory', state.playerInventory || {}); // Fallback if old save
      
      registry.set('playerGold', state.playerGold || 0);
      registry.set('seenCreatureIds', state.seenCreatureIds || []);
      registry.set('caughtCreatureIds', state.caughtCreatureIds || []);
      registry.set('defeatedTrainers', state.defeatedTrainers || []);
      
      registry.set('activeQuests', state.activeQuests || []);
      registry.set('completedQuests', state.completedQuests || []);

      // Load story flags
      registry.set('intro_started', state.intro_started || false);
      registry.set('intro_done', state.intro_done || false);
      registry.set('chapter1_done', state.chapter1_done || false);
      registry.set('boss_rowan_intro', state.boss_rowan_intro || false);
      registry.set('is_climax_battle', state.is_climax_battle || false);

      console.log(`[SaveSystem] Successfully loaded slot ${slot} state from ${new Date(parsedSave.timestamp).toLocaleTimeString()}`);
      
      // Return routing config so StartScene knows where to jump
      return {
        mapId: state.currentMapId || 'starwhisk_village',
        spawnX: state.playerX !== undefined ? state.playerX : 10,
        spawnY: state.playerY !== undefined ? state.playerY : 10
      };

    } catch (e) {
      console.error("[SaveSystem] Failed to parse or load state:", e);
      return null;
    }
  },

  /**
   * Retrieves summary data for all slots (0 to 5) to display in UI.
   */
  getAllSaves: () => {
    const saves = [];
    for (let i = 0; i <= 5; i++) {
        const dataStr = localStorage.getItem(getSaveKey(i));
        if (dataStr) {
            try {
                const parsed = JSON.parse(dataStr);
                const pName = parsed.state.playerName || 'Hero';
                const level = parsed.state.playerParty[0]?.level || 1;
                const mapId = parsed.state.currentMapId || 'Unknown Location';
                
                saves.push({
                    slot: i,
                    exists: true,
                    timestamp: parsed.timestamp,
                    label: `Lvl ${level} ${pName}`
                });
            } catch (e) {
                saves.push({ slot: i, exists: true, label: "Corrupted Data", timestamp: 0 });
            }
        } else {
            saves.push({ slot: i, exists: false, label: "Empty Slot", timestamp: 0 });
        }
    }
    return saves;
  }
};
