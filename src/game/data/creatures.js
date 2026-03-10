/**
 * creatures.js - Database of all creature species in Feloria.
 */
export const CREATURES = {
  // Starters
  LEAFKIT: {
    id: 'leafkit',
    name: 'Leafkit',
    type: 'nature',
    baseHp: 20,
    baseAttack: 5,
    baseDefense: 4,
    skills: ['scratch', 'vine_whip']
  },
  EMBERPAW: {
    id: 'emberpaw',
    name: 'Emberpaw',
    type: 'fire',
    baseHp: 18,
    baseAttack: 6,
    baseDefense: 3,
    skills: ['scratch', 'ember']
  },
  MISTTAIL: {
    id: 'misttail',
    name: 'Misttail',
    type: 'water',
    baseHp: 22,
    baseAttack: 4,
    baseDefense: 5,
    skills: ['scratch', 'bubble']
  },

  // Wild Cats - Greenpaw Forest
  SNAGPUSS: {
    id: 'snagpuss',
    name: 'Snagpuss',
    type: 'nature',
    baseHp: 15,
    baseAttack: 4,
    baseDefense: 3,
    skills: ['scratch', 'growl']
  },
  FERNCLAW: {
    id: 'fernclaw',
    name: 'Fernclaw',
    type: 'nature',
    baseHp: 18,
    baseAttack: 5,
    baseDefense: 3,
    skills: ['scratch', 'vine_whip']
  },
  THISTLEFUR: {
    id: 'thistlefur',
    name: 'Thistlefur',
    type: 'nature',
    baseHp: 14,
    baseAttack: 6,
    baseDefense: 2,
    skills: ['scratch', 'growl']
  }
};
