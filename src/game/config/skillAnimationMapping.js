/**
 * Mapping system for skills to animations.
 * Priority: 
 * 1. Specific skill mapping
 * 2. Skill type mapping (fallback)
 * 3. Generic fallback animation
 */

export const skillAnimationMap = {
  // --- Starter Skills ---
  vine_swipe: "Wind1",
  leaf_dart: "Wind2",
  forest_guard: "State6",
  ember_bite: "Fire1",
  flame_dash: "Fire3",
  heat_claw: "Fire2",
  water_slash: "Ice1",
  mist_burst: "Ice3",
  tidal_wave: "Ice5",
  scratch: "Sword1",
  bite: "Attack1",
  quick_strike: "Sword2",

  // --- Intermediate Skills ---
  thorn_whip: "Wind3",
  root_snare: "Earth2",
  nature_roar: "Blow2",
  inferno_slash: "Fire4",
  blazing_pounce: "Fire3",
  firestorm: "Fire2",
  aqua_fang: "Water1",
  tidal_crash: "Water2",
  ocean_wrath: "Water3",
  pebble_toss: "Spear2",
  rock_smash: "Spear1",
  shadow_sneak: "Darkness1",
  dark_pulse: "Darkness2",
  phantom_claw: "Darkness3",
  ice_shard: "Ice2",
  frost_breath: "Ice4",
  blizzard_claw: "Ice3",
  spark_strike: "Thunder1",
  thunder_paw: "Thunder2",
  storm_call: "Thunder4",

  // --- Advanced & Special Skills ---
  soul_reap: "Special3",
  spectral_strike: "Special4",
  mana_burst: "Special7",
  star_fall: "Special9",
  cosmic_roar: "Special10",
  solar_beam: "Light3",
  holy_smite: "Light1",
  supernova: "Meteor",
  genesis_light: "Special17",
  world_tree_root: "Special11",
  abyssal_devour: "Darkness2",
  void_strike: "Darkness1",
  absolute_zero: "Ice5",
  permafrost: "Ice5",
  hurricane_strike: "Wind3",
  typhoon_fury: "Wind3",
  tsunami_burst: "Water3",
  earth_shatter: "Earth3",
  mountain_shield: "State5",
  tectonic_slam: "Earth3",
  light_beam: "Light4",
  radiant_burst: "Light2",
  divine_glow: "Light5",
  aether_blast: "Special8",
  astral_judgment: "Special13",
  dream_eater: "Special15"
};

export const typeAnimationMap = {
  "풀": "Wind1",
  "불": "Fire2",
  "물": "Ice2",
  "바위": "Spear3",
  "그림자": "Darkness1",
  "얼음": "Ice4",
  "폭풍": "Thunder1",
  "영혼": "Special6",
  "신비": "Special8",
  "빛": "Light1",
  "노말": "Sword1",
  "전기": "Thunder2",
  // English fallbacks
  "forest": "Wind1",
  "fire": "Fire2",
  "water": "Ice2",
  "rock": "Spear3",
  "shadow": "Darkness1",
  "ice": "Ice4",
  "storm": "Thunder1",
  "spirit": "Special6",
  "mystic": "Special8",
  "light": "Light1",
  "normal": "Sword1",
  "spark": "Thunder2"
};

/**
 * Resolves the animation key for a given skill and its type.
 * @param {string} skillId - The ID of the skill.
 * @param {string} type - The type of the skill or creature.
 * @returns {string} The animation key (e.g., "Fire1").
 */
export function getAnimationKey(skillId, type) {
  // 1. Specific skill mapping
  if (skillId && skillAnimationMap[skillId]) {
    return skillAnimationMap[skillId];
  }

  // 2. Type based fallback
  if (type && typeAnimationMap[type]) {
    return typeAnimationMap[type];
  }

  // 3. Generic fallback
  return "Attack1";
}
