/**
 * Centralized asset key and path organization.
 * Use this file to define all asset keys and their corresponding file paths.
 * This ensures consistency across different scenes and makes it easy to update assets.
 */

export const ASSETS = {
  TILESETS: {
    OVERWORLD: {
      KEY: 'overworld-tiles',
      PATH: '/assets/tilesets/overworld.png'
    }
  },
  SPRITES: {
    PLAYER: {
      KEY: 'player',
      PATH: '/assets/sprites/player/player.png',
      FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 }
    },
    CAT_STARTER_LEAF: {
      KEY: 'leafkit',
      PATH: '/assets/sprites/cats/leafkit.png',
      FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 }
    },
    CAT_STARTER_FIRE: {
      KEY: 'emberpaw',
      PATH: '/assets/sprites/cats/emberpaw.png',
      FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 }
    },
    CAT_STARTER_WATER: {
      KEY: 'misttail',
      PATH: '/assets/sprites/cats/misttail.png',
      FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 }
    }
  },
  UI: {
    FRAME: {
      KEY: 'ui-frame',
      PATH: '/assets/ui/frames/default.png'
    },
    CURSOR: {
      KEY: 'ui-cursor',
      PATH: '/assets/ui/icons/cursor.png'
    }
  }
};
