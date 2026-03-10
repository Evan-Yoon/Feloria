/**
 * dialogueSystem.js - Manages multi-page dialogue logic and data.
 */
export const dialogueData = {
  mira: {
    name: "Elder Mira",
    pages: [
      "Feloria has grown restless lately.",
      "Take care of your companion."
    ]
  },
  shopkeeper: {
    name: "Village Shopkeeper",
    pages: [
      "Potions help during battles.",
      "Yarn Balls may help recruit wild cats."
    ]
  },
  explorer: {
    name: "Forest Explorer",
    pages: [
      "Wild cats hide in the tall grass.",
      "Be careful when you step too far into the forest."
    ]
  }
};

export const dialogueSystem = {
  getDialogue: (speakerId) => {
    return dialogueData[speakerId] || { name: "???", pages: ["..."] };
  }
};
