/**
 * dialogueSystem.js - Manages multi-page dialogue logic and data.
 */
export const dialogueData = {
  mira: {
    name: "Elder Mira",
    pages: [
      "Feloria has grown restless lately.",
      "Would you like me to heal your companions?",
      "[HEAL_PROMPT]" // Special dialogue flag for WorldScene to catch
    ]
  },
  shopkeeper: {
    name: "Village Shopkeeper",
    pages: [
      "Welcome to my humble shop!",
      "[SHOP_PROMPT]" // Special flag
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
