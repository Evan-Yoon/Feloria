/**
 * Centralized asset key and path organization.
 * Use this file to define all asset keys and their corresponding file paths.
 * This ensures consistency across different scenes and makes it easy to update assets.
 */

export const ASSETS = {
  ANIMATIONS: {
    FIRE: { KEY: 'anim_fire', PATH: '/assets/animations/Fire1.png', FRAME_CONFIG: { frameWidth: 192, frameHeight: 192 } },
    ICE: { KEY: 'anim_ice', PATH: '/assets/animations/Ice1.png', FRAME_CONFIG: { frameWidth: 192, frameHeight: 192 } },
    THUNDER: { KEY: 'anim_thunder', PATH: '/assets/animations/Thunder1.png', FRAME_CONFIG: { frameWidth: 192, frameHeight: 192 } },
    WIND: { KEY: 'anim_wind', PATH: '/assets/animations/Wind1.png', FRAME_CONFIG: { frameWidth: 192, frameHeight: 192 } },
    HEAL: { KEY: 'anim_heal', PATH: '/assets/animations/Heal1.png', FRAME_CONFIG: { frameWidth: 192, frameHeight: 192 } },
    SLASH: { KEY: 'anim_slash', PATH: '/assets/animations/Sword1.png', FRAME_CONFIG: { frameWidth: 192, frameHeight: 192 } },
  },
  BATTLEBACKS1: {
    GRASSLAND: { KEY: 'back1_grassland', PATH: '/assets/battlebacks1/Grassland.png' },
    LAVA: { KEY: 'back1_lava', PATH: '/assets/battlebacks1/Lava1.png' },
    SNOW: { KEY: 'back1_snow', PATH: '/assets/battlebacks1/Snowfield.png' },
    DESERT: { KEY: 'back1_desert', PATH: '/assets/battlebacks1/Desert.png' },
    RUINS: { KEY: 'back1_ruins', PATH: '/assets/battlebacks1/Ruins1.png' },
  },
  BATTLEBACKS2: {
    FOREST: { KEY: 'back2_forest', PATH: '/assets/battlebacks2/Forest1.png' },
    VOLCANO: { KEY: 'back2_volcano', PATH: '/assets/battlebacks2/Lava.png' },
    SNOW: { KEY: 'back2_snow', PATH: '/assets/battlebacks2/Snow.png' },
    DESERT: { KEY: 'back2_desert', PATH: '/assets/battlebacks2/Desert.png' },
    TEMPLE: { KEY: 'back2_temple', PATH: '/assets/battlebacks2/Temple.png' },
  },
  CHARACTERS: {
    PLAYER: { KEY: 'actor_player', PATH: '/assets/characters/Actor1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    NPC_PEOPLE1: { KEY: 'npc_people1', PATH: '/assets/characters/People1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    NPC_PEOPLE2: { KEY: 'npc_people2', PATH: '/assets/characters/People2.png', CHARACTER_INDEX: 1, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    NPC_ELDER: { KEY: 'npc_elder', PATH: '/assets/characters/People4.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
  },
  FACES: {
    ACTOR1: { KEY: 'face_actor1', PATH: '/assets/faces/Actor1.png', FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 } },
    PEOPLE1: { KEY: 'face_people1', PATH: '/assets/faces/People1.png', FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 } },
    PEOPLE4: { KEY: 'face_elder', PATH: '/assets/faces/People4.png', FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 } },
    EVIL: { KEY: 'face_evil', PATH: '/assets/faces/Evil.png', FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 } },
  },
  PARALLAXES: {
    SKY: { KEY: 'parallax_sky', PATH: '/assets/parallaxes/BlueSky.png' },
    MOUNTAINS: { KEY: 'parallax_mountains', PATH: '/assets/parallaxes/Mountains1.png' },
    OCEAN: { KEY: 'parallax_ocean', PATH: '/assets/parallaxes/Ocean1.png' },
  },
  TILESETS: {
    OUTSIDE: { KEY: 'tileset_outside', PATH: '/assets/tilesets/Outside_A1.png' },
    INSIDE: { KEY: 'tileset_inside', PATH: '/assets/tilesets/Inside_A1.png' },
  },
  SPRITES: {
    MONSTER_FALLBACK: { KEY: 'monster_fallback', PATH: '/assets/characters/Monster1.png', FRAME_CONFIG: { frameWidth: 48, frameHeight: 48 } }
  }
};
