/**
 * encounters.js - Map-specific encounter tables.
 */
export const ENCOUNTER_TABLES = {
  starwhisk_village: {
    pool: [],
    levelRange: [1, 1]
  },
  greenpaw_forest: {
    // 3 unique wild cats for Greenpaw Forest
    pool: ['SNAGPUSS', 'FERNCLAW', 'THISTLEFUR'],
    levelRange: [2, 5]
  },
  ancient_forest: {
    pool: ['THORNKIT', 'MOSSLYNX', 'VINEFANG', 'THORNMANE'],
    levelRange: [8, 12]
  }
};
