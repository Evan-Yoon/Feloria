/**
 * typeChart.js - Effectiveness multipliers between types.
 * Based on CORE DESIGN requirements.
 */

export const TYPE_CHART = {
  fire: {
    grass: 2.0,
    forest: 2.0,
    ice: 2.0,
    water: 0.5,
    rock: 0.5,
    fire: 0.5,
  },
  water: {
    fire: 2.0,
    rock: 2.0,
    storm: 0.5,
    grass: 0.5,
  },
  grass: {
    water: 2.0,
    rock: 2.0,
    fire: 0.5,
    ice: 0.5,
  },
  rock: {
    fire: 2.0,
    storm: 2.0,
    water: 0.5,
  },
  ice: {
    forest: 2.0,
    grass: 2.0,
    fire: 0.5,
  },
  storm: {
    water: 2.0,
    forest: 0.5,
  },
  shadow: {
    light: 2.0,
    spirit: 2.0,
  },
  light: {
    shadow: 2.0,
    spirit: 1.5,
  },
  spirit: {
    mystic: 2.0,
  },
  mystic: {
    storm: 1.5,
  },
};

/**
 * Maps Korean types in skills.js to English keys in TYPE_CHART
 */
export const TYPE_MAPPING = {
  "풀": "grass",
  "불": "fire",
  "물": "water",
  "노말": "normal",
  "바위": "rock",
  "영혼": "spirit",
  "그림자": "shadow",
  "얼음": "ice",
  "전기": "storm",
  "폭풍": "storm",
  "신비": "mystic",
  "빛": "light",
  "forest": "forest",
  "grass": "grass",
  "fire": "fire",
  "water": "water",
  "rock": "rock",
  "shadow": "shadow",
  "ice": "ice",
  "storm": "storm",
  "spirit": "spirit",
  "mystic": "mystic",
  "light": "light",
  "normal": "normal"
};
