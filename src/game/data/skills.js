/**
 * skills.js - Database of all skills available in the game.
 */
export const SKILLS = {
  scratch: {
    id: 'scratch',
    name: 'Scratch',
    damage: 4,
    type: 'normal',
    description: 'A basic scratch attack.'
  },
  vine_whip: {
    id: 'vine_whip',
    name: 'Vine Whip',
    damage: 7,
    type: 'nature',
    description: 'A powerful whip with vines.'
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    damage: 7,
    type: 'fire',
    description: 'A small fire blast.'
  },
  bubble: {
    id: 'bubble',
    name: 'Bubble',
    damage: 7,
    type: 'water',
    description: 'A blast of bubbles.'
  },
  growl: {
    id: 'growl',
    name: 'Growl',
    damage: 0,
    type: 'normal',
    description: 'Reduce enemy attack (Not yet implemented).'
  }
};
