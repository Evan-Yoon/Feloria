/**
 * encounters.js - Map-specific encounter tables.
 */
export const ENCOUNTER_TABLES = {
  starwhisk_village: {
    pool: ['SNAGPUSS', 'THISTLEKIT', 'MOSSLYNX', 'FERNCLAW'],
    levelRange: [1, 3]
  },
  greenpaw_forest: {
    pool: ['SNAGPUSS', 'THISTLEKIT', 'MOSSLYNX', 'FERNCLAW', 'THORNKIT', 'BARKPELT', 'RIPPLEPAW'],
    levelRange: [2, 6]
  },
  mosslight_path: {
    pool: ['THORNMANE', 'VINEFANG', 'SPARKPAW', 'ASHLYNX', 'PEBBLEPAW', 'NIGHTKIT'],
    levelRange: [6, 10]
  },
  ancient_forest: {
    pool: ['THORNPROWLER', 'NIGHTPELT', 'MISTLYNX', 'FROSTKIT', 'STORMKIT'],
    levelRange: [9, 14]
  }
};
