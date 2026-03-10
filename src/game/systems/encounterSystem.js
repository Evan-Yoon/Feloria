/**
 * encounterSystem.js - Handles wild monster encounter logic.
 */
export const encounterSystem = {
  /**
   * Checks if an encounter should trigger based on movement.
   * @param {number} probability - Probability between 0 and 1 (default 0.1)
   * @returns {boolean} - True if an encounter is triggered
   */
  checkEncounter: (probability = 0.1) => {
    return Math.random() < probability;
  }
};
