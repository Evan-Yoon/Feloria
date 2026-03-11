/**
 * dialogueSystem.js - Manages multi-page dialogue logic and data.
 */
export const dialogueData = {
  mira: {
    name: "Elder Mira",
    pages: [
      "Feloria has grown restless lately.",
      "{playerName}, 지금은 마을 북쪽으로 가는 것만 구현되어 있단다.",
      "Would you like me to heal your companions?",
      "보유한 냥냥이들의 체력을 모두 회복합니다.",
      "[HEAL_PROMPT]",
    ],
  },
  shopkeeper: {
    name: "Village Shopkeeper",
    pages: [
      "Welcome to my humble shop!",
      "(돈은 필드의 고양이를 사냥하거나 트레이너와의 대결을 통해 얻을 수 있습니다.)",
      "[SHOP_PROMPT]",
    ],
  },
  explorer: {
    name: "Forest Explorer",
    pages: [
      "Wild cats hide in the tall grass.",
      "Be careful when you step too far into the forest.",
    ],
  },
};

export const dialogueSystem = {
  getDialogue: (speakerId) => {
    return dialogueData[speakerId] || { name: "???", pages: ["..."] };
  },
};
