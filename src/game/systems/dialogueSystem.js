/**
 * dialogueSystem.js - Manages multi-page dialogue logic and data.
 */
export const dialogueData = {
  mira: {
    name: "촌장 미라",
    pages: [
      "최근 펠로리아 대륙의 기운이 심상치 않구나.",
      "{playerName}, 지금은 마을 북쪽으로 가는 것만 구현되어 있단다.",
      "고양이들의 체력을 회복시켜 줄까?",
      "보유한 냥냥이들의 체력을 모두 회복합니다.",
      "[HEAL_PROMPT]",
    ],
  },
  shopkeeper: {
    name: "마을 상점 상인",
    pages: [
      "어서오세요! 무엇을 도와드릴까요?",
      "(돈은 필드의 고양이를 사냥하거나 트레이너와의 대결을 통해 얻을 수 있습니다.)",
      "[SHOP_PROMPT]",
    ],
  },
  explorer: {
    name: "숲 탐험가",
    pages: [
      "야생 고양이들은 주로 긴 풀숲에 숨어있단다.",
      "숲 깊숙이 들어갈 때는 항상 조심하렴.",
    ],
  },
};

export const dialogueSystem = {
  getDialogue: (speakerId) => {
    return dialogueData[speakerId] || { name: "???", pages: ["..."] };
  },
};
