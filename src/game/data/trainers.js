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
      { creatureId: "DEWTAIL", level: 9 },
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
  boss_hyunseok: {
    id: "boss_hyunseok",
    name: "촌장 현석",
    rewards: {
        gold: 1000,
        expMultiplier: 3.0,
    },
    party: [
        { creatureId: "INFERMANE", level: 18 },
        { creatureId: "FLOODLYNX", level: 19 },
        { creatureId: "VOIDLYNX", level: 20 }
    ],
  },
  ellie: {
    id: "ellie",
    name: "순례자 엘리",
    rewards: {
      gold: 300,
      expMultiplier: 2.0,
    },
    party: [
      { creatureId: "MISTTAIL", level: 11 },
      { creatureId: "PEBBLEPAW", level: 11 },
    ],
  },
};
