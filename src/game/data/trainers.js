import { CREATURES } from "./creatures.js";

export const TRAINers = {
  youngster_tim: {
    id: "youngster_tim",
    name: "Youngster Tim",
    dialogueBefore: "{playerName}! My Forest cat is top tier! Let's battle!",
    dialogueAfter: "Whoa, your cat is way stronger!",
    rewards: {
      gold: 50,
      expMultiplier: 1.5, // Trainers give more EXP
    },
    party: [{ creatureId: "LEAFKIT", level: 4 }],
  },
  hiker_bob: {
    id: "hiker_bob",
    name: "Hiker Bob",
    dialogueBefore:
      "The path gets dangerous from here. Show me what you've got, {playerName}!",
    dialogueAfter: "You're ready. Stay safe out there.",
    rewards: {
      gold: 100,
      expMultiplier: 1.5,
    },
    party: [
      { creatureId: "EMBERPAW", level: 5 },
      { creatureId: "SNAGPUSS", level: 5 },
    ],
  },
};
