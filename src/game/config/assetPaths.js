/**
 * Centralized asset key and path organization.
 * Use this file to define all asset keys and their corresponding file paths.
 * This ensures consistency across different scenes and makes it easy to update assets.
 */

export const ASSETS = {
  ANIMATIONS: {

    ATTACK1: { KEY: 'anim_attack1', PATH: '/assets/animations/Attack1.png', grid: { cols: 3, rows: 1 }, blendAdd: false },
    ATTACK2: { KEY: 'anim_attack2', PATH: '/assets/animations/Attack2.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    ATTACK3: { KEY: 'anim_attack3', PATH: '/assets/animations/Attack3.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    ATTACK4: { KEY: 'anim_attack4', PATH: '/assets/animations/Attack4.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    ATTACK5: { KEY: 'anim_attack5', PATH: '/assets/animations/Attack5.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    ATTACK6: { KEY: 'anim_attack6', PATH: '/assets/animations/Attack6.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    ATTACK7: { KEY: 'anim_attack7', PATH: '/assets/animations/Attack7.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    ATTACK8: { KEY: 'anim_attack8', PATH: '/assets/animations/Attack8.png', grid: { cols: 5, rows: 3 }, blendAdd: false },
    ATTACK9: { KEY: 'anim_attack9', PATH: '/assets/animations/Attack9.png', grid: { cols: 5, rows: 3 }, blendAdd: false },
    ATTACK10: { KEY: 'anim_attack10', PATH: '/assets/animations/Attack10.png', grid: { cols: 5, rows: 3 }, blendAdd: false },
    ATTACK11: { KEY: 'anim_attack11', PATH: '/assets/animations/Attack11.png', grid: { cols: 1, rows: 1 }, blendAdd: false },
    ATTACK12: { KEY: 'anim_attack12', PATH: '/assets/animations/Attack12.png', grid: { cols: 5, rows: 3 }, blendAdd: false },

    BLOW1: { KEY: 'anim_blow1', PATH: '/assets/animations/Blow1.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    BLOW2: { KEY: 'anim_blow2', PATH: '/assets/animations/Blow2.png', grid: { cols: 5, rows: 6 }, blendAdd: false },
    BLOW3: { KEY: 'anim_blow3', PATH: '/assets/animations/Blow3.png', grid: { cols: 5, rows: 2 }, blendAdd: false },

    DARKNESS1: { KEY: 'anim_darkness1', PATH: '/assets/animations/Darkness1.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    DARKNESS2: { KEY: 'anim_darkness2', PATH: '/assets/animations/Darkness2.png', grid: { cols: 5, rows: 6 }, blendAdd: false },
    DARKNESS3: { KEY: 'anim_darkness3', PATH: '/assets/animations/Darkness3.png', grid: { cols: 1, rows: 1 }, blendAdd: false },

    DEATH1: { KEY: 'anim_death1', PATH: '/assets/animations/Death1.png', grid: { cols: 1, rows: 1 }, blendAdd: false },

    EARTH1: { KEY: 'anim_earth1', PATH: '/assets/animations/Earth1.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    EARTH2: { KEY: 'anim_earth2', PATH: '/assets/animations/Earth2.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    EARTH3: { KEY: 'anim_earth3', PATH: '/assets/animations/Earth3.png', grid: { cols: 5, rows: 6 }, blendAdd: false },

    FIRE1: { KEY: 'anim_fire1', PATH: '/assets/animations/Fire1.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    FIRE2: { KEY: 'anim_fire2', PATH: '/assets/animations/Fire2.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    FIRE3: { KEY: 'anim_fire3', PATH: '/assets/animations/Fire3.png', grid: { cols: 5, rows: 5 }, blendAdd: false },

    HEAL1: { KEY: 'anim_heal1', PATH: '/assets/animations/Heal1.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    HEAL2: { KEY: 'anim_heal2', PATH: '/assets/animations/Heal2.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    HEAL3: { KEY: 'anim_heal3', PATH: '/assets/animations/Heal3.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    HEAL4: { KEY: 'anim_heal4', PATH: '/assets/animations/Heal4.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    HEAL5: { KEY: 'anim_heal5', PATH: '/assets/animations/Heal5.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    HEAL6: { KEY: 'anim_heal6', PATH: '/assets/animations/Heal6.png', grid: { cols: 5, rows: 6 }, blendAdd: false },

    ICE1: { KEY: 'anim_ice1', PATH: '/assets/animations/Ice1.png', grid: { cols: 4, rows: 1 }, blendAdd: false },
    ICE2: { KEY: 'anim_ice2', PATH: '/assets/animations/Ice2.png', grid: { cols: 4, rows: 1 }, blendAdd: false },
    ICE3: { KEY: 'anim_ice3', PATH: '/assets/animations/Ice3.png', grid: { cols: 4, rows: 1 }, blendAdd: false },

    LIGHT1: { KEY: 'anim_light1', PATH: '/assets/animations/Light1.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    LIGHT2: { KEY: 'anim_light2', PATH: '/assets/animations/Light2.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    LIGHT3: { KEY: 'anim_light3', PATH: '/assets/animations/Light3.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    LIGHT4: { KEY: 'anim_light4', PATH: '/assets/animations/Light4.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    LIGHT5: { KEY: 'anim_light5', PATH: '/assets/animations/Light5.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    LIGHT6: { KEY: 'anim_light6', PATH: '/assets/animations/Light6.png', grid: { cols: 5, rows: 2 }, blendAdd: false },
    LIGHT7: { KEY: 'anim_light7', PATH: '/assets/animations/Light7.png', grid: { cols: 5, rows: 6 }, blendAdd: false },

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
    PLAYER: { KEY: 'actor1', PATH: '/assets/characters/Actor1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    ACTOR1: { KEY: 'actor1', PATH: '/assets/characters/Actor1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    ACTOR2: { KEY: 'actor2', PATH: '/assets/characters/Actor2.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    ACTOR3: { KEY: 'actor3', PATH: '/assets/characters/Actor3.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    ACTOR4: { KEY: 'actor4', PATH: '/assets/characters/Actor4.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    ACTOR5: { KEY: 'actor5', PATH: '/assets/characters/Actor5.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    ANIMAL: { KEY: 'animal', PATH: '/assets/characters/Animal.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    BEHAVIOR1: { KEY: 'behavior1', PATH: '/assets/characters/Behavior1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    BEHAVIOR2: { KEY: 'behavior2', PATH: '/assets/characters/Behavior2.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    BEHAVIOR3: { KEY: 'behavior3', PATH: '/assets/characters/Behavior3.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    BEHAVIOR4: { KEY: 'behavior4', PATH: '/assets/characters/Behavior4.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    DAMAGE1: { KEY: 'damage1', PATH: '/assets/characters/Damage1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    DAMAGE2: { KEY: 'damage2', PATH: '/assets/characters/Damage2.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    DAMAGE3: { KEY: 'damage3', PATH: '/assets/characters/Damage3.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    DAMAGE4: { KEY: 'damage4', PATH: '/assets/characters/Damage4.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    EVIL: { KEY: 'evil', PATH: '/assets/characters/Evil.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    INSANE1: { KEY: 'insane1', PATH: '/assets/characters/Insane1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    INSANE2: { KEY: 'insane2', PATH: '/assets/characters/Insane2.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    MONSTER1: { KEY: 'monster1', PATH: '/assets/characters/Monster1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    MONSTER2: { KEY: 'monster2', PATH: '/assets/characters/Monster2.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    MONSTER3: { KEY: 'monster3', PATH: '/assets/characters/Monster3.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE1: { KEY: 'people1', PATH: '/assets/characters/People1.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE2: { KEY: 'people2', PATH: '/assets/characters/People2.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE3: { KEY: 'people3', PATH: '/assets/characters/People3.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE4: { KEY: 'people4', PATH: '/assets/characters/People4.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE5: { KEY: 'people5', PATH: '/assets/characters/People5.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE6: { KEY: 'people6', PATH: '/assets/characters/People6.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE7: { KEY: 'people7', PATH: '/assets/characters/People7.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    PEOPLE8: { KEY: 'people8', PATH: '/assets/characters/People8.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    RIDING: { KEY: 'riding', PATH: '/assets/characters/Riding.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    SPIRITUAL: { KEY: 'spiritual', PATH: '/assets/characters/Spiritual.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } },
    VEHICLE: { KEY: 'vehicle', PATH: '/assets/characters/Vehicle.png', CHARACTER_INDEX: 0, FRAME_CONFIG: { frameWidth: 32, frameHeight: 32 } }
  },
  FACES: {
    ACTOR1: {
      KEY: 'face_actor1',
      PATH: '/assets/faces/Actor1.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    ACTOR2: {
      KEY: 'face_actor2',
      PATH: '/assets/faces/Actor2.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    ACTOR3: {
      KEY: 'face_actor3',
      PATH: '/assets/faces/Actor3.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    ACTOR4: {
      KEY: 'face_actor4',
      PATH: '/assets/faces/Actor4.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    ACTOR5: {
      KEY: 'face_actor5',
      PATH: '/assets/faces/Actor5.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    PEOPLE1: {
      KEY: 'face_people1',
      PATH: '/assets/faces/People1.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    PEOPLE2: {
      KEY: 'face_people2',
      PATH: '/assets/faces/People2.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    PEOPLE3: {
      KEY: 'face_people3',
      PATH: '/assets/faces/People3.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    PEOPLE4: {
      KEY: 'face_people4',
      PATH: '/assets/faces/People4.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    MONSTER: {
      KEY: 'face_monster',
      PATH: '/assets/faces/Monster1.png', // Corrected from Monster.png
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    },

    EVIL: {
      KEY: 'face_evil',
      PATH: '/assets/faces/Evil.png',
      FRAME_CONFIG: { frameWidth: 144, frameHeight: 144 }
    }
  },
  PARALLAXES: {

    // 하늘
    BLUESKY: {
      KEY: 'parallax_bluesky',
      PATH: '/assets/parallaxes/BlueSky.png'
    },

    // 구름
    CLOUDS: {
      KEY: 'parallax_clouds',
      PATH: '/assets/parallaxes/Clouds.png'
    },

    // 산
    MOUNTAINS1: {
      KEY: 'parallax_mountains1',
      PATH: '/assets/parallaxes/Mountains1.png'
    },

    MOUNTAINS2: {
      KEY: 'parallax_mountains2',
      PATH: '/assets/parallaxes/Mountains2.png'
    },

    // 바다
    OCEAN1: {
      KEY: 'parallax_ocean1',
      PATH: '/assets/parallaxes/Ocean1.png'
    },

    OCEAN2: {
      KEY: 'parallax_ocean2',
      PATH: '/assets/parallaxes/Ocean2.png'
    },

    // 숲
    FOREST1: {
      KEY: 'parallax_forest1',
      PATH: '/assets/parallaxes/Forest1.png'
    },

    FOREST2: {
      KEY: 'parallax_forest2',
      PATH: '/assets/parallaxes/Forest2.png'
    },

    // 사막
    DESERT: {
      KEY: 'parallax_desert',
      PATH: '/assets/parallaxes/Desert.png'
    },

    // 우주
    SPACE: {
      KEY: 'parallax_space',
      PATH: '/assets/parallaxes/Space.png'
    }

  },
  ICONS: {
    POTION: { KEY: 'icon_00_01', PATH: '/assets/icons/icon_00_01.png' },
    CRYSTAL: { KEY: 'icon_00_02', PATH: '/assets/icons/icon_00_02.png' },
    SWORD: { KEY: 'icon_00_03', PATH: '/assets/icons/icon_00_03.png' },
    SHIELD: { KEY: 'icon_00_04', PATH: '/assets/icons/icon_00_04.png' }
  },
  TILESETS: {
    OUTSIDE: { KEY: 'tileset_outside', PATH: '/assets/tilesets/Outside_A1.png' },
    INSIDE: { KEY: 'tileset_inside', PATH: '/assets/tilesets/Inside_A1.png' },
  },
  SPRITES: {
    MONSTER_FALLBACK: { KEY: 'monster_fallback', PATH: '/assets/characters/Monster1.png', FRAME_CONFIG: { frameWidth: 48, frameHeight: 48 } }
  }
};
