import { ENCOUNTER_TABLES } from '../data/encounters.js';

/**
 * encounterSystem.js - Handles probability and selection of wild encounters.
 */
export const encounterSystem = {
  /**
   * Checks if an encounter occurs and returns a random creature ID from the map pool.
   */
  checkEncounter: (mapId, chance = 0.15) => {
    if (Math.random() < chance) {
      const table = ENCOUNTER_TABLES[mapId];
      if (!table || table.pool.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * table.pool.length);
      const creatureId = table.pool[randomIndex];
      const levelRange = table.levelRange || [1, 5];
      const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
      
      return { creatureId, level };
    }
    return null;
  }
};
