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
      instanceId: `${creatureId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`, // Unique ID for party tracking
      level,
      maxHp: hp,
      currentHp: hp,
      exp: 0,
      stats: {
        attack: Math.floor(species.baseAttack * (1 + (level - 1) * 0.1)),
        defense: Math.floor(species.baseDefense * (1 + (level - 1) * 0.1))
      },
      skills: species.skills ? [...species.skills] : []
    };
  },

  /**
   * Evolves a creature instance into its target evolution data.
   * Safely maintains instanceId, level, exp, and HP proportions.
   */
  evolveCreature: (creature) => {
    if (!creature.evolution || !creature.evolution.target) return creature;

    const evolvedSpecies = CREATURES[creature.evolution.target];
    if (!evolvedSpecies) return creature;

    // Calculate new stats based on current level
    const newMaxHp = Math.floor(evolvedSpecies.baseHp * (1 + (creature.level - 1) * 0.1));
    const newAttack = Math.floor(evolvedSpecies.baseAttack * (1 + (creature.level - 1) * 0.1));
    const newDefense = Math.floor(evolvedSpecies.baseDefense * (1 + (creature.level - 1) * 0.1));

    // Preserve HP proportion
    const hpRatio = creature.currentHp / creature.maxHp;
    const newCurrentHp = Math.max(1, Math.floor(newMaxHp * hpRatio));

    // Mutate the original object to ensure references in Party/Collection arrays stay valid
    creature.id = evolvedSpecies.id;
    creature.name = evolvedSpecies.name;
    creature.type = evolvedSpecies.type;
    creature.baseHp = evolvedSpecies.baseHp;
    creature.baseAttack = evolvedSpecies.baseAttack;
    creature.baseDefense = evolvedSpecies.baseDefense;
    creature.baseExp = evolvedSpecies.baseExp || 50;
    creature.skills = evolvedSpecies.skills ? [...evolvedSpecies.skills] : [];
    creature.description = evolvedSpecies.description || "";
    creature.habitat = evolvedSpecies.habitat;
    
    // Clear old evolution to prevent re-triggering (or assign next stage if it existed)
    creature.evolution = evolvedSpecies.evolution || null;
    creature.readyToEvolve = false;

    // Set new calculated stats
    creature.maxHp = newMaxHp;
    creature.currentHp = newCurrentHp;
    creature.stats.attack = newAttack;
    creature.stats.defense = newDefense;

    return creature;
  },

  /**
   * Calculates damage dealt from an attacker to a target using a skill.
   */
  calculateDamage: (attacker, target, skillId) => {
    const atk = attacker.stats.attack;
    const def = target.stats.defense;

    if (!skillId || skillId === "attack" || skillId === "scratch") {
      // Basic Attack is intentionally weak
      return Math.max(1, Math.floor((atk * 0.5) - (def * 0.2)));
    }

    const skill = SKILLS[skillId];
    if (!skill) return 0;

    // Skill Damage
    const power = skill.power || 1.0;
    
    // Damage = (Attack * PowerMultiplier) - (Defense * 0.5)
    let damage = (atk * power) - (def * 0.5);
    
    return Math.max(1, Math.floor(damage));
  },

  /**
   * Checks if a capture attempt is successful.
   * Higher chance when enemy HP is low, heavily influenced by species catchRate.
   */
  checkCapture: (enemy) => {
    const hpRatio = enemy.currentHp / enemy.maxHp;
    // Base formula: catchRate * (1 - hpRatio) + small flat bonus
    // A legendary with catchRate 0.01 at 10% HP = 0.01 * 0.9 + 0.05 = ~0.059 (6% catch chance)
    // A regular with catchRate 0.8 at 10% HP = 0.8 * 0.9 + 0.05 = ~0.77 (77% catch chance)
    
    // Default to 0.5 if not found
    const baseRate = enemy.catchRate !== undefined ? enemy.catchRate : 0.5;
    
    const successProbability = (baseRate * (1.0 - hpRatio)) + (baseRate * 0.2); 
    return Math.random() < successProbability;
  },

  /**
   * Calculates EXP gained from defeating an enemy.
   */
  calculateExp: (enemyInstance) => {
    // Formula: (Base XP * Level) / 5
    const baseExp = enemyInstance.baseExp || 50;
    return Math.max(1, Math.floor((baseExp * enemyInstance.level) / 5));
  },

  /**
   * Calculates Gold gained from winning a battle.
   */
  calculateGold: (isTrainer = false, trainerGold = 0) => {
      if (isTrainer) return trainerGold;
      // Wild battles drop between 3 and 10 Gold
      return Math.floor(Math.random() * 8) + 3;
  },

  /**
   * Applies EXP to a creature and handles level ups.
   * Returns true if the creature leveled up.
   */
  gainExp: (creature, amount) => {
    if (!creature.exp) creature.exp = 0;
    creature.exp += amount;
    
    // Simple fixed threshold for now: 50 EXP per level
    const expNeeded = creature.level * 50;
    
    if (creature.exp >= expNeeded) {
      creature.level += 1;
      creature.exp -= expNeeded; // Carry over
      
      // Stat increases
      creature.maxHp += 2;
      creature.currentHp += 2; // Heal slightly on level up
      creature.stats.attack += 1;
      creature.stats.defense += 1;

      // Check for evolution
      if (creature.evolution && creature.level >= creature.evolution.level) {
        creature.readyToEvolve = true;
      }
      return true; // Leveled up
    }
    return false;
  }
};
