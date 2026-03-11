import { CREATURES } from "./creatures.js";

export const TRAINERS = {
  kyle: {
    id: "kyle",
    name: "초보 트레이너 카일",
    rewards: {
      gold: 50,
      expMultiplier: 1.5,
    },
    party: [{ creatureId: "LEAFKIT", level: 4 }],
  },
  sera: {
    id: "sera",
    name: "트레이너 세라",
    rewards: {
      gold: 100,
      expMultiplier: 1.5,
    },
    party: [
      { creatureId: "EMBERPAW", level: 5 },
      { creatureId: "SNAGPUSS", level: 6 },
    ],
  },
  luke: {
    id: "luke",
    name: "숲 수호자 견습 루크",
    rewards: {
      gold: 150,
      expMultiplier: 1.5,
    },
    party: [
      { creatureId: "BRAMBLECAT", level: 10 },
      { creatureId: "AQUATAIL", level: 9 },
    ],
  },
  guardian_rowan: {
    id: "guardian_rowan",
    name: "신전 수호자 로완",
    rewards: {
        gold: 500,
        expMultiplier: 2.5,
        item: "FOREST_BADGE"
    },
    party: [
        { creatureId: "MOSSLYNX", level: 12 },
        { creatureId: "THORNMANE", level: 14 }
    ],
  },
};
