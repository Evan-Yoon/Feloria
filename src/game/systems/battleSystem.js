import { CREATURES } from '../data/creatures.js';
import { SKILLS } from '../data/skills.js';

/**
 * battleSystem.js - Core logic for turn-based battles.
 */
export const battleSystem = {
  /**
   * Generates a fully fleshed out creature instance for battle.
   */
  createInstance: (creatureId, level = 1) => {
    const species = CREATURES[creatureId];
    if (!species) return null;

    // Stat scaling logic (simple for now)
    const hp = Math.floor(species.baseHp * (1 + (level - 1) * 0.1));
    
    return {
      ...species,
      level,
      maxHp: hp,
      currentHp: hp,
      stats: {
        attack: Math.floor(species.baseAttack * (1 + (level - 1) * 0.1)),
        defense: Math.floor(species.baseDefense * (1 + (level - 1) * 0.1))
      }
    };
  },

  /**
   * Calculates damage dealt from an attacker to a target using a skill.
   */
  calculateDamage: (attacker, target, skillId) => {
    const skill = SKILLS[skillId];
    if (!skill) return 0;

    // Very simple formula: (Base Damage + Attack) - (Target Defense / 2)
    let damage = (skill.damage + attacker.stats.attack) - (target.stats.defense / 2);
    
    // Ensure at least 1 damage
    return Math.max(1, Math.floor(damage));
  },

  /**
   * Checks if a capture attempt is successful.
   * Higher chance when enemy HP is low.
   */
  checkCapture: (enemy) => {
    const hpRatio = enemy.currentHp / enemy.maxHp;
    
    // Base 20% chance + up to 60% based on missing health
    const successProbability = 0.2 + (1.0 - hpRatio) * 0.6;
    
    return Math.random() < successProbability;
  }
};
