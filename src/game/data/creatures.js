/**
 * creatures.js - Database of all creature species in Feloria.
 */
export const CREATURES = {
  // Starters
  LEAFKIT: {
    id: 'LEAFKIT',
    name: 'Leafkit',
    type: 'nature',
    baseHp: 20,
    baseAttack: 5,
    baseDefense: 4,
    baseExp: 10,
    skills: ['scratch', 'vine_whip'],
    description: 'A playful forest cat with leaves growing from its fur.',
    habitat: 'Starwhisk Village',
    evolution: { target: 'BRAMBLECAT', level: 10 }
  },
  EMBERPAW: {
    id: 'EMBERPAW',
    name: 'Emberpaw',
    type: 'fire',
    baseHp: 18,
    baseAttack: 6,
    baseDefense: 3,
    baseExp: 10,
    skills: ['scratch', 'ember'],
    description: 'A fiery feline whose paws leave warm trails.',
    habitat: 'Starwhisk Village',
    evolution: { target: 'CINDERCLAW', level: 10 }
  },
  MISTTAIL: {
    id: 'MISTTAIL',
    name: 'Misttail',
    type: 'water',
    baseHp: 22,
    baseAttack: 4,
    baseDefense: 5,
    baseExp: 10,
    skills: ['scratch', 'bubble'],
    description: 'A calm cat with a tail made of cool, trailing mist.',
    habitat: 'Starwhisk Village',
    evolution: { target: 'DEWTAIL', level: 10 }
  },

  // Starters Evolutions (Phase 4 block)
  BRAMBLECAT: {
    id: 'BRAMBLECAT', name: 'Bramblecat', type: 'nature',
    baseHp: 35, baseAttack: 9, baseDefense: 7, baseExp: 25,
    skills: ['scratch', 'vine_whip'], description: 'A sturdy feline protected by thick brambles.', habitat: 'Unknown'
  },
  CINDERCLAW: {
    id: 'CINDERCLAW', name: 'Cinderclaw', type: 'fire',
    baseHp: 32, baseAttack: 11, baseDefense: 5, baseExp: 25,
    skills: ['scratch', 'ember'], description: 'Its claws are searing hot, capable of slicing through stone.', habitat: 'Unknown'
  },
  DEWTAIL: {
    id: 'DEWTAIL', name: 'Dewtail', type: 'water',
    baseHp: 38, baseAttack: 7, baseDefense: 9, baseExp: 25,
    skills: ['scratch', 'bubble'], description: 'It commands water currents with elegant sweeps of its tail.', habitat: 'Unknown'
  },

  // Wild Cats - Greenpaw Forest
  SNAGPUSS: {
    id: 'SNAGPUSS',
    name: 'Snagpuss',
    type: 'nature',
    baseHp: 15,
    baseAttack: 4,
    baseDefense: 3,
    baseExp: 5,
    skills: ['scratch', 'growl'],
    description: 'A scrappy stray that loves to hide in tall grass.',
    habitat: 'Greenpaw Forest'
  },
  FERNCLAW: {
    id: 'FERNCLAW',
    name: 'Fernclaw',
    type: 'nature',
    baseHp: 18,
    baseAttack: 5,
    baseDefense: 3,
    baseExp: 6,
    skills: ['scratch', 'vine_whip'],
    description: 'Its claws resemble sharp fern leaves.',
    habitat: 'Greenpaw Forest'
  },
  THISTLEFUR: {
    id: 'THISTLEFUR',
    name: 'Thistlefur',
    type: 'nature',
    baseHp: 14,
    baseAttack: 6,
    baseDefense: 2,
    baseExp: 4,
    skills: ['scratch', 'growl'],
    description: 'Covered in prickly fur to deter predators.',
    habitat: 'Greenpaw Forest'
  }
};
