/**
 * skills.js - Database of all combat skills available.
 * 
 * power: multiplier against base attack (e.g. 1.2 = 120% attack damage)
 * effectType: dictates the visual particle/animation played in BattleScene
 */

export const SKILLS = {
  // NORMAL
  scratch: { id: 'scratch', name: '할퀴기', type: 'Normal', power: 0.8, effectType: 'slash' },
  bite: { id: 'bite', name: '물기', type: 'Normal', power: 1.0, effectType: 'slash' },
  quick_strike: { id: 'quick_strike', name: '전광석화', type: 'Normal', power: 1.2, effectType: 'slash' },
  pounce: { id: 'pounce', name: '덮치기', type: 'Normal', power: 1.4, effectType: 'impact' },
  flurry: { id: 'flurry', name: '마구할퀴기', type: 'Normal', power: 1.6, effectType: 'slash' },
  
  // GRASS / FOREST
  vine_swipe: { id: 'vine_swipe', name: '덩굴 채찍', type: 'Grass', power: 1.0, effectType: 'forest' },
  leaf_dart: { id: 'leaf_dart', name: '나뭇잎 표창', type: 'Grass', power: 1.2, effectType: 'forest' },
  forest_guard: { id: 'forest_guard', name: '숲의 방패', type: 'Grass', power: 0.8, effectType: 'forest' }, // mostly damage for now
  thorn_whip: { id: 'thorn_whip', name: '가시 채찍', type: 'Grass', power: 1.5, effectType: 'forest' },
  nature_roar: { id: 'nature_roar', name: '자연의 포효', type: 'Grass', power: 1.8, effectType: 'impact' },
  root_snare: { id: 'root_snare', name: '뿌리 묶기', type: 'Grass', power: 1.3, effectType: 'forest' },
  
  // FIRE
  ember_bite: { id: 'ember_bite', name: '불씨 물기', type: 'Fire', power: 1.1, effectType: 'fire' },
  flame_dash: { id: 'flame_dash', name: '화염 질주', type: 'Fire', power: 1.3, effectType: 'fire' },
  heat_claw: { id: 'heat_claw', name: '열상 발톱', type: 'Fire', power: 1.4, effectType: 'fire' },
  inferno_slash: { id: 'inferno_slash', name: '지옥염 베기', type: 'Fire', power: 1.7, effectType: 'slash' },
  blazing_pounce: { id: 'blazing_pounce', name: '화염 덮치기', type: 'Fire', power: 1.6, effectType: 'fire' },
  firestorm: { id: 'firestorm', name: '불보라', type: 'Fire', power: 2.0, effectType: 'fire' },
  
  // WATER
  water_slash: { id: 'water_slash', name: '물소용돌이', type: 'Water', power: 1.1, effectType: 'water' },
  mist_burst: { id: 'mist_burst', name: '안개 폭발', type: 'Water', power: 1.2, effectType: 'water' },
  tidal_wave: { id: 'tidal_wave', name: '파도 타기', type: 'Water', power: 1.5, effectType: 'water' },
  aqua_fang: { id: 'aqua_fang', name: '수류의 송곳니', type: 'Water', power: 1.6, effectType: 'water' },
  tidal_crash: { id: 'tidal_crash', name: '해일 강타', type: 'Water', power: 1.8, effectType: 'impact' },
  ocean_wrath: { id: 'ocean_wrath', name: '대양의 분노', type: 'Water', power: 2.1, effectType: 'water' },
  
  // ELECTRIC / STORM
  static_fur: { id: 'static_fur', name: '정전기 털', type: 'Electric', power: 1.1, effectType: 'spark' },
  spark_strike: { id: 'spark_strike', name: '스파크 공격', type: 'Electric', power: 1.3, effectType: 'spark' },
  thunder_paw: { id: 'thunder_paw', name: '번개 발바닥', type: 'Electric', power: 1.7, effectType: 'spark' },
  storm_call: { id: 'storm_call', name: '폭풍 부르기', type: 'Storm', power: 2.2, effectType: 'spark' },
  
  // ICE
  frost_nibble: { id: 'frost_nibble', name: '서리 물기', type: 'Ice', power: 1.1, effectType: 'ice' },
  ice_shard: { id: 'ice_shard', name: '얼음 뭉치', type: 'Ice', power: 1.4, effectType: 'ice' },
  blizzard_claw: { id: 'blizzard_claw', name: '눈보라 발톱', type: 'Ice', power: 1.8, effectType: 'ice' },
  absolute_zero: { id: 'absolute_zero', name: '절대 영도', type: 'Ice', power: 2.3, effectType: 'ice' },

  // ROCK / GROUND
  pebble_toss: { id: 'pebble_toss', name: '돌던지기', type: 'Rock', power: 1.0, effectType: 'rock' },
  rock_smash: { id: 'rock_smash', name: '바위 깨기', type: 'Rock', power: 1.5, effectType: 'rock' },
  earthquake: { id: 'earthquake', name: '지진', type: 'Rock', power: 2.0, effectType: 'impact' },
  
  // SHADOW / SPIRIT
  shadow_sneak: { id: 'shadow_sneak', name: '야습', type: 'Shadow', power: 1.2, effectType: 'shadow' },
  dark_pulse: { id: 'dark_pulse', name: '악의 파동', type: 'Shadow', power: 1.6, effectType: 'shadow' },
  phantom_claw: { id: 'phantom_claw', name: '유령 발톱', type: 'Spirit', power: 1.7, effectType: 'shadow' },
  soul_reap: { id: 'soul_reap', name: '영혼 거두기', type: 'Spirit', power: 2.1, effectType: 'shadow' },

  // MYSTIC / LIGHT
  mana_burst: { id: 'mana_burst', name: '마나 폭발', type: 'Mystic', power: 1.3, effectType: 'mystic' },
  star_fall: { id: 'star_fall', name: '별똥별', type: 'Mystic', power: 1.7, effectType: 'mystic' },
  solar_beam: { id: 'solar_beam', name: '태양 광선', type: 'Light', power: 2.0, effectType: 'mystic' },
  holy_smite: { id: 'holy_smite', name: '신성한 일격', type: 'Light', power: 2.2, effectType: 'mystic' },
  cosmic_roar: { id: 'cosmic_roar', name: '우주의 포효', type: 'Mystic', power: 2.4, effectType: 'mystic' }
};
