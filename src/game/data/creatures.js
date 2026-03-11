/**
 * creatures.js
 * Master list of all available cat-based monsters in Feloria.
 * STRICT RULE: All creatures must be feline-based.
 */

export const CREATURES = {
  // --- STARTER CREATURES ---
  LEAFKIT: {
    id: 'LEAFKIT',
    name: 'Leafkit',
    type: 'Forest',
    description: 'A playful green kitten. It smells like fresh pine.',
    baseHp: 20,
    baseAttack: 5,
    baseDefense: 4,
    catchRate: 1.0, 
    evolution: { target: 'BRAMBLECAT', level: 10 }
  },
  BRAMBLECAT: {
    id: 'BRAMBLECAT',
    name: 'Bramblecat',
    type: 'Forest',
    description: 'Its fur has hardened into thick protective vines.',
    baseHp: 45,
    baseAttack: 12,
    baseDefense: 10,
    catchRate: 0.5,
    evolution: null
  },
  EMBERPAW: {
    id: 'EMBERPAW',
    name: 'Emberpaw',
    type: 'Fire',
    description: 'A fiery kitten. Its paws are warm to the touch.',
    baseHp: 18,
    baseAttack: 7,
    baseDefense: 3,
    catchRate: 1.0,
    evolution: { target: 'CINDERCLAW', level: 10 }
  },
  CINDERCLAW: {
    id: 'CINDERCLAW',
    name: 'Cinderclaw',
    type: 'Fire',
    description: 'Fierce and hot-headed. Its claws leave scorch marks.',
    baseHp: 40,
    baseAttack: 16,
    baseDefense: 8,
    catchRate: 0.5,
    evolution: null
  },
  MISTTAIL: {
    id: 'MISTTAIL',
    name: 'Misttail',
    type: 'Water',
    description: 'A slick, agile kitten that loves to swim.',
    baseHp: 22,
    baseAttack: 4,
    baseDefense: 6,
    catchRate: 1.0,
    evolution: { target: 'DEWTAIL', level: 10 }
  },
  DEWTAIL: {
    id: 'DEWTAIL',
    name: 'Dewtail',
    type: 'Water',
    description: 'A swift swimmer. It can summon light rains when upset.',
    baseHp: 50,
    baseAttack: 10,
    baseDefense: 14,
    catchRate: 0.5,
    evolution: null
  },

  // --- FOREST CREATURES ---
  SNAGPUSS: {
    id: 'SNAGPUSS',
    name: 'Snagpuss',
    type: 'Grass',
    description: 'A curious thorn-furred kitten that hides in tall grass.',
    baseHp: 15, baseAttack: 4, baseDefense: 5, catchRate: 0.8,
    evolution: { target: 'THISTLEFUR', level: 12 }
  },
  THISTLEFUR: {
    id: 'THISTLEFUR',
    name: 'Thistlefur',
    type: 'Grass',
    description: 'Covered in prickly burrs, making it hard to attack directly.',
    baseHp: 38, baseAttack: 11, baseDefense: 13, catchRate: 0.4, evolution: null
  },
  MOSSLYNX: {
    id: 'MOSSLYNX',
    name: 'Mosslynx',
    type: 'Forest',
    description: 'A quiet moss-covered wildcat that blends into the forest floor.',
    baseHp: 18, baseAttack: 6, baseDefense: 4, catchRate: 0.7,
    evolution: { target: 'MOSSFANG', level: 14 }
  },
  MOSSFANG: {
    id: 'MOSSFANG',
    name: 'Mossfang',
    type: 'Forest',
    description: 'Its fangs constantly drip with a mild natural sedative.',
    baseHp: 42, baseAttack: 15, baseDefense: 10, catchRate: 0.3, evolution: null
  },
  FERNCLAW: {
    id: 'FERNCLAW',
    name: 'Fernclaw',
    type: 'Grass',
    description: 'Its claws grow like sharp leaves used to defend its territory.',
    baseHp: 16, baseAttack: 7, baseDefense: 3, catchRate: 0.7,
    evolution: { target: 'VINEFANG', level: 13 }
  },
  VINEFANG: {
    id: 'VINEFANG',
    name: 'Vinefang',
    type: 'Grass',
    description: 'It restrains prey with vines extending from its tail.',
    baseHp: 40, baseAttack: 16, baseDefense: 8, catchRate: 0.3, evolution: null
  },
  BARKPELT: {
    id: 'BARKPELT',
    name: 'Barkpelt',
    type: 'Forest',
    description: 'Its fur resembles tree bark and protects it from predators.',
    baseHp: 22, baseAttack: 3, baseDefense: 8, catchRate: 0.8,
    evolution: { target: 'IRONBARK', level: 15 }
  },
  IRONBARK: {
    id: 'IRONBARK',
    name: 'Ironbark',
    type: 'Forest',
    description: 'Its hide is practically impenetrable to ordinary strikes.',
    baseHp: 55, baseAttack: 8, baseDefense: 20, catchRate: 0.3, evolution: null
  },
  THISTLEKIT: {
    id: 'THISTLEKIT',
    name: 'Thistlekit',
    type: 'Grass',
    description: 'A tiny feline that rolls into thorny bushes to hide.',
    baseHp: 12, baseAttack: 5, baseDefense: 2, catchRate: 0.9,
    evolution: { target: 'THORNPROWLER', level: 11 }
  },
  THORNPROWLER: {
    id: 'THORNPROWLER',
    name: 'Thornprowler',
    type: 'Grass',
    description: 'Hunts aggressively by ambushing from dense undergrowth.',
    baseHp: 32, baseAttack: 14, baseDefense: 7, catchRate: 0.4, evolution: null
  },

  // --- FIRE CREATURES ---
  SPARKPAW: {
    id: 'SPARKPAW',
    name: 'Sparkpaw',
    type: 'Fire',
    description: 'A playful kitten that leaves sparks wherever it runs.',
    baseHp: 15, baseAttack: 6, baseDefense: 3, catchRate: 0.8,
    evolution: { target: 'BLAZECLAW', level: 14 }
  },
  BLAZECLAW: {
    id: 'BLAZECLAW',
    name: 'Blazeclaw',
    type: 'Fire',
    description: 'Every step it takes scorches the earth beneath it.',
    baseHp: 38, baseAttack: 16, baseDefense: 9, catchRate: 0.3, evolution: null
  },
  CINDERCAT: {
    id: 'CINDERCAT',
    name: 'Cindercat',
    type: 'Fire',
    description: 'Its fur glows faintly like embers in the dark.',
    baseHp: 18, baseAttack: 5, baseDefense: 5, catchRate: 0.7,
    evolution: { target: 'INFERMANE', level: 16 }
  },
  INFERMANE: {
    id: 'INFERMANE',
    name: 'Infermane',
    type: 'Fire',
    description: 'Its majestic mane is made entirely of continuously burning flames.',
    baseHp: 45, baseAttack: 14, baseDefense: 12, catchRate: 0.2, evolution: null
  },
  ASHLYNX: {
    id: 'ASHLYNX',
    name: 'Ashlynx',
    type: 'Fire',
    description: 'It thrives in places where fire has recently passed.',
    baseHp: 17, baseAttack: 7, baseDefense: 4, catchRate: 0.7,
    evolution: { target: 'PYROLYNX', level: 15 }
  },
  PYROLYNX: {
    id: 'PYROLYNX',
    name: 'Pyrolynx',
    type: 'Fire',
    description: 'It controls the temperature of the air around it.',
    baseHp: 42, baseAttack: 18, baseDefense: 8, catchRate: 0.3, evolution: null
  },

  // --- WATER CREATURES ---
  RIPPLEPAW: {
    id: 'RIPPLEPAW',
    name: 'Ripplepaw',
    type: 'Water',
    description: 'A kitten that chases ripples across shallow streams.',
    baseHp: 16, baseAttack: 5, baseDefense: 5, catchRate: 0.8,
    evolution: { target: 'TIDALCLAW', level: 13 }
  },
  TIDALCLAW: {
    id: 'TIDALCLAW',
    name: 'Tidalclaw',
    type: 'Water',
    description: 'Its claws carry the weight of a crashing ocean wave.',
    baseHp: 40, baseAttack: 13, baseDefense: 13, catchRate: 0.4, evolution: null
  },
  STREAMTAIL: {
    id: 'STREAMTAIL',
    name: 'Streamtail',
    type: 'Water',
    description: 'Its long tail helps it swim against strong currents.',
    baseHp: 18, baseAttack: 6, baseDefense: 4, catchRate: 0.7,
    evolution: { target: 'FLOODLYNX', level: 15 }
  },
  FLOODLYNX: {
    id: 'FLOODLYNX',
    name: 'Floodlynx',
    type: 'Water',
    description: 'When it roars, local water sources crest into sudden floods.',
    baseHp: 46, baseAttack: 15, baseDefense: 10, catchRate: 0.3, evolution: null
  },
  DEWKIT: {
    id: 'DEWKIT',
    name: 'Dewkit',
    type: 'Water',
    description: 'A shy cat whose fur always feels slightly damp.',
    baseHp: 14, baseAttack: 4, baseDefense: 6, catchRate: 0.9,
    evolution: { target: 'MISTLYNX', level: 12 }
  },
  MISTLYNX: {
    id: 'MISTLYNX',
    name: 'Mistlynx',
    type: 'Water',
    description: 'It can vanish entirely inside heavy fog.',
    baseHp: 38, baseAttack: 10, baseDefense: 15, catchRate: 0.4, evolution: null
  },

  // --- ROCK CREATURES ---
  PEBBLEPAW: {
    id: 'PEBBLEPAW',
    name: 'Pebblepaw',
    type: 'Rock',
    description: 'A stubborn kitten that collects shiny stones.',
    baseHp: 19, baseAttack: 5, baseDefense: 7, catchRate: 0.8,
    evolution: { target: 'STONECLAW', level: 14 }
  },
  STONECLAW: {
    id: 'STONECLAW',
    name: 'Stoneclaw',
    type: 'Rock',
    description: 'Its claws are tough enough to sheer solid marble.',
    baseHp: 45, baseAttack: 14, baseDefense: 16, catchRate: 0.3, evolution: null
  },
  GRANITECAT: {
    id: 'GRANITECAT',
    name: 'Granitecat',
    type: 'Rock',
    description: 'Its fur hardens like stone when threatened.',
    baseHp: 20, baseAttack: 4, baseDefense: 9, catchRate: 0.7,
    evolution: { target: 'TITANPELT', level: 16 }
  },
  TITANPELT: {
    id: 'TITANPELT',
    name: 'Titanpelt',
    type: 'Rock',
    description: 'Practically immovable. It sleeps in the center of rockslides.',
    baseHp: 55, baseAttack: 10, baseDefense: 22, catchRate: 0.2, evolution: null
  },
  BOULDERLYNX: {
    id: 'BOULDERLYNX',
    name: 'Boulderlynx',
    type: 'Rock',
    description: 'Massive feline known for pushing rocks onto rivals.',
    baseHp: 48, baseAttack: 16, baseDefense: 14, catchRate: 0.3,
    evolution: { target: 'CLIFFMAW', level: 25 }
  },
  CLIFFMAW: {
    id: 'CLIFFMAW',
    name: 'Cliffmaw',
    type: 'Rock',
    description: 'Apex mountain predator with a bite that shatters stalagmites.',
    baseHp: 70, baseAttack: 22, baseDefense: 18, catchRate: 0.1, evolution: null
  },

  // --- SHADOW CREATURES ---
  NIGHTKIT: {
    id: 'NIGHTKIT',
    name: 'Nightkit',
    type: 'Shadow',
    description: 'A quiet shadow kitten that moves silently.',
    baseHp: 14, baseAttack: 6, baseDefense: 3, catchRate: 0.8,
    evolution: { target: 'NIGHTPELT', level: 15 }
  },
  NIGHTPELT: {
    id: 'NIGHTPELT',
    name: 'Nightpelt',
    type: 'Shadow',
    description: 'Uses the cover of true darkness to ambush its prey.',
    baseHp: 38, baseAttack: 16, baseDefense: 8, catchRate: 0.3, evolution: null
  },
  DUSKPAW: {
    id: 'DUSKPAW',
    name: 'Duskpaw',
    type: 'Shadow',
    description: 'Appears only at dusk when shadows stretch long.',
    baseHp: 16, baseAttack: 6, baseDefense: 4, catchRate: 0.7,
    evolution: { target: 'UMBRAFANG', level: 16 }
  },
  UMBRAFANG: {
    id: 'UMBRAFANG',
    name: 'Umbrafang',
    type: 'Shadow',
    description: 'Its bite is said to sever light from the target.',
    baseHp: 42, baseAttack: 17, baseDefense: 10, catchRate: 0.3, evolution: null
  },
  SHADECLAW: {
    id: 'SHADECLAW',
    name: 'Shadeclaw',
    type: 'Shadow',
    description: 'Its body seems to flicker in and out of darkness.',
    baseHp: 15, baseAttack: 8, baseDefense: 3, catchRate: 0.6,
    evolution: { target: 'VOIDLYNX', level: 18 }
  },
  VOIDLYNX: {
    id: 'VOIDLYNX',
    name: 'Voidlynx',
    type: 'Shadow',
    description: 'A terrifying predator that hunts completely unseen.',
    baseHp: 45, baseAttack: 20, baseDefense: 7, catchRate: 0.2, evolution: null
  },

  // --- ICE CREATURES ---
  FROSTKIT: {
    id: 'FROSTKIT',
    name: 'Frostkit',
    type: 'Ice',
    description: 'A playful kitten that slides across frozen lakes.',
    baseHp: 16, baseAttack: 5, baseDefense: 5, catchRate: 0.8,
    evolution: { target: 'GLACIERPAW', level: 15 }
  },
  GLACIERPAW: {
    id: 'GLACIERPAW',
    name: 'Glacierpaw',
    type: 'Ice',
    description: 'Its heavy paws leave frozen footprints even in summer.',
    baseHp: 42, baseAttack: 14, baseDefense: 13, catchRate: 0.3, evolution: null
  },
  SNOWPELT: {
    id: 'SNOWPELT',
    name: 'Snowpelt',
    type: 'Ice',
    description: 'Its fur blends perfectly with falling snow.',
    baseHp: 18, baseAttack: 4, baseDefense: 6, catchRate: 0.7,
    evolution: { target: 'BLIZZARDFANG', level: 17 }
  },
  BLIZZARDFANG: {
    id: 'BLIZZARDFANG',
    name: 'Blizzardfang',
    type: 'Ice',
    description: 'Able to whip up blinding blizzards with a swish of its tail.',
    baseHp: 48, baseAttack: 12, baseDefense: 16, catchRate: 0.2, evolution: null
  },

  // --- STORM CREATURES ---
  STORMKIT: {
    id: 'STORMKIT',
    name: 'Stormkit',
    type: 'Storm',
    description: 'Its fur crackles softly with static electricity.',
    baseHp: 15, baseAttack: 7, baseDefense: 3, catchRate: 0.7,
    evolution: { target: 'THUNDERLYNX', level: 16 }
  },
  THUNDERLYNX: {
    id: 'THUNDERLYNX',
    name: 'Thunderlynx',
    type: 'Storm',
    description: 'A roaring cat whose howl sounds like thunder.',
    baseHp: 40, baseAttack: 18, baseDefense: 8, catchRate: 0.3, evolution: null
  },
  GALECLAW: {
    id: 'GALECLAW',
    name: 'Galeclaw',
    type: 'Storm',
    description: 'Known for leaping incredible distances on the wind.',
    baseHp: 14, baseAttack: 8, baseDefense: 3, catchRate: 0.6,
    evolution: { target: 'TEMPESTFANG', level: 18 }
  },
  TEMPESTFANG: {
    id: 'TEMPESTFANG',
    name: 'Tempestfang',
    type: 'Storm',
    description: 'It strikes with the unpredictable velocity of a hurricane.',
    baseHp: 38, baseAttack: 21, baseDefense: 7, catchRate: 0.2, evolution: null
  },

  // --- SPIRIT CREATURES ---
  WHISPERKIT: {
    id: 'WHISPERKIT',
    name: 'Whisperkit',
    type: 'Spirit',
    description: 'Said to be the spirit of a long forgotten feline.',
    baseHp: 14, baseAttack: 4, baseDefense: 7, catchRate: 0.7,
    evolution: { target: 'SOULPELT', level: 19 }
  },
  SOULPELT: {
    id: 'SOULPELT',
    name: 'Soulpelt',
    type: 'Spirit',
    description: 'A guardian of graveyards that guides lost souls home.',
    baseHp: 38, baseAttack: 11, baseDefense: 18, catchRate: 0.3, evolution: null
  },
  PHANTOMLYNX: {
    id: 'PHANTOMLYNX',
    name: 'Phantomlynx',
    type: 'Spirit',
    description: 'Its footsteps make no sound.',
    baseHp: 16, baseAttack: 7, baseDefense: 4, catchRate: 0.5,
    evolution: { target: 'SPECTRALCLAW', level: 21 }
  },
  SPECTRALCLAW: {
    id: 'SPECTRALCLAW',
    name: 'Spectralclaw',
    type: 'Spirit',
    description: 'It can pass through solid objects to catch its prey.',
    baseHp: 44, baseAttack: 19, baseDefense: 10, catchRate: 0.2, evolution: null
  },

  // --- MYSTIC CREATURES ---
  RUNECLAW: {
    id: 'RUNECLAW',
    name: 'Runeclaw',
    type: 'Mystic',
    description: 'Strange glowing runes appear in its fur.',
    baseHp: 18, baseAttack: 6, baseDefense: 5, catchRate: 0.6,
    evolution: { target: 'ARCANEFANG', level: 20 }
  },
  ARCANEFANG: {
    id: 'ARCANEFANG',
    name: 'Arcanefang',
    type: 'Mystic',
    description: 'Capable of bending minor reality with its arcane growls.',
    baseHp: 45, baseAttack: 15, baseDefense: 12, catchRate: 0.2, evolution: null
  },
  STARLIGHTKIT: {
    id: 'STARLIGHTKIT',
    name: 'Starlightkit',
    type: 'Mystic',
    description: 'Its eyes shine like distant stars.',
    baseHp: 16, baseAttack: 5, baseDefense: 6, catchRate: 0.7,
    evolution: { target: 'CELESTIPELT', level: 22 }
  },
  CELESTIPELT: {
    id: 'CELESTIPELT',
    name: 'Celestipelt',
    type: 'Mystic',
    description: 'It is said it descends from the Milky Way on clear nights.',
    baseHp: 42, baseAttack: 13, baseDefense: 16, catchRate: 0.2, evolution: null
  },

  // --- RARE CREATURES ---
  AURORACAT: {
    id: 'AURORACAT',
    name: 'Auroracat',
    type: 'Ice/Mystic',
    description: 'Its ribbons of fur resemble the northern lights.',
    baseHp: 60, baseAttack: 16, baseDefense: 18, catchRate: 0.05, evolution: null
  },
  EMBERLYNX: {
    id: 'EMBERLYNX',
    name: 'Emberlynx',
    type: 'Fire/Storm',
    description: 'A terrifying beast combining wildflame and lightning.',
    baseHp: 55, baseAttack: 22, baseDefense: 12, catchRate: 0.05, evolution: null
  },
  VERDANTCLAW: {
    id: 'VERDANTCLAW',
    name: 'Verdantclaw',
    type: 'Forest/Spirit',
    description: 'Protector of the deepest grottos. Ancient and powerful.',
    baseHp: 70, baseAttack: 14, baseDefense: 22, catchRate: 0.05, evolution: null
  },

  // --- LEGENDARY FELINES ---
  SOLARION: {
    id: 'SOLARION',
    name: 'Solarion',
    type: 'Fire/Mystic',
    description: 'A legendary feline said to embody the sun itself. Blindingly radiant.',
    baseHp: 100, baseAttack: 30, baseDefense: 20, catchRate: 0.01, evolution: null
  },
  LUNARIS: {
    id: 'LUNARIS',
    name: 'Lunaris',
    type: 'Spirit/Shadow',
    description: 'A mythical cat that commands the tides and shadows of the moon.',
    baseHp: 90, baseAttack: 25, baseDefense: 30, catchRate: 0.01, evolution: null
  }
};
