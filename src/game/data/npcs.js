/**
 * npcs.js
 * Centralized data structure for all NPCs in Feloria.
 * Defines roles, reactivity, and Korean dialogue based on the game state.
 */

export const NPCS = {
  // --- STARWHISK VILLAGE ---
  elder_hyunseok: {
    id: "Chief Hyunseok",
    name: "촌장 현석",
    role: "healer_quest",
    sprite: "people4",
    faceKey: "face_people4",
    faceIndex: 0,
    getDialogue: (registry) => {
      // Post-Seal Dialogue (Prison)
      if (registry.get("chapter1_done")) {
        return [
          "흥... 내가 이렇게 갇히게 될 줄이야.",
          "하지만 이미 전설의 고양이들이 깨어났다. 내 계획은 멈출 수 없어!",
          "대륙은 본래의 야성을 되찾을 것이다...",
        ];
      }

      const activeQuests = registry.get("activeQuests") || {};
      const firstSteps = activeQuests["first_steps"];

      // Quest progression checks
      if (!firstSteps || !firstSteps.objectives[1].completed) {
        // Starter not chosen yet
        return [
          "어서 오너라, {playerName}아.",
          "요즘 숲의 기운이 조금 이상하단다. 모험을 도와줄 고양이 한마리를 입양하거라...",
        ];
      }
      if (firstSteps && !firstSteps.completed) {
        return [
          "네 고양이를 잘 돌봐주거라.",
          "숲에서는 언제 어떤 일이 벌어질지 모른단다. 그게 누구의 계획이든 말이지.",
        ];
      }

      // Default / Healer Dialogue
      return [
        "피곤해 보이는구나. 이리 오렴.",
        "내가 네 파티를 아주 '건강하게' 유지해 주마.",
      ];
    },
  },
  boss_hyunseok_climax: {
    id: "boss_hyunseok_climax",
    name: "촌장 현석",
    role: "boss_trainer",
    sprite: "people4",
    faceKey: "face_people4",
    faceIndex: 0,
    getDialogue: (registry) => {
      return [
        "하하하! 정말 수고했다, {playerName}.",
        "말했지 않았느냐... 내가 너를 아주 특별하게 생각한다고.",
        "너 덕분에 신전의 결계가 완벽하게 무너졌어. 이제 고대 고양이들을 내 의지대로 다룰 수 있다!",
        "자, 이제 너는 쓸모가 없어졌구나. 사라져라!",
      ];
    },
  },
  boss_hyunseok_defeated: {
    id: "boss_hyunseok_defeated",
    name: "촌장 현석",
    sprite: "people4",
    faceKey: "face_people4",
    faceIndex: 1, 
    getDialogue: (registry) => {
      return [
        "큭... 하지만 이미 전설의 고양이들이 깨어났다. 내 계획은 멈출 수 없어!",
      ];
    },
  },
  shopkeeper: {
    id: "shopkeeper",
    name: "상인 토비",
    role: "shopkeeper",
    sprite: "people1",
    faceKey: "face_people1",
    faceIndex: 0,
    getDialogue: (registry) => {
      return [
        "어서 와! 필요한 물건이 있나?",
        "포션은 전투에서 정말 유용하지. 특히 깊은 숲에선 필수야!",
      ];
    },
  },
  villager1: {
    id: "villager1",
    name: "마을 주민 리나",
    role: "hint_npc",
    sprite: "people2",
    faceKey: "face_people1",
    faceIndex: 1,
    getDialogue: (registry) => {
      if (registry.get("chapter1_done")) {
        return [
          "하늘이 이상해! 멀리 산등성이에서 번쩍이는 걸 봤어!",
          "정말로 책에 나오는 전설의 고양이들이 깨어난 걸까?",
        ];
      }
      const collection = registry.get("playerCollection") || [];
      if (collection.length > 1) {
        // Has captured at least one cat (since starter is 1)
        return [
          "와! {playerName}! 벌써 고양이를 잡았구나!",
          "촌장님이 널 아주 특별하게 생각하시는 것 같더라.",
        ];
      }
      return [
        "숲에 들어가면 풀숲을 조심해.",
        "야생 고양이들이 갑자기 나타나거든. 요즘 들어 유독 더 사나워졌어.",
      ];
    },
  },
  eugene: {
    id: "eugene",
    name: "고양이 연구가 유진",
    role: "lore_npc",
    sprite: "people3",
    faceKey: "face_people1",
    faceIndex: 2,
    getDialogue: (registry) => {
      // Emergency Healer Role
      if (registry.get("chapter1_done")) {
        return [
          "세상에... 정말로 고대봉인이 무너졌단 말이냐.",
          "이건 단순한 우연이 아니야. 대륙 곳곳에서 전설적인 고양이들의 목소리가 들린다더구나.",
          "촌장님이 그런 끔찍한 계획을 꾸미고 계셨을 줄이야...",
          "당분간 마을의 치료소는 내가 맡도록 할게. 다치면 언제든 치료해줄 테니 찾아와!",
        ];
      }

      const caughtIds = registry.get("caughtCreatureIds") || [];
      if (caughtIds.length >= 3) {
        return [
          "도감을 채우고 있구나!",
          "언젠가 전설 속 '고대 고양이'도 만날 수 있을지 몰라.",
        ];
      }
      return [
        "이 세계에는 아주 다양한 고양이들이 살고 있어.",
        "어떤 고양이는 숲에서, 어떤 고양이는 물가에서 살아.",
      ];
    },
  },

  // --- GREENPAW FOREST ---
  darin: {
    id: "darin",
    name: "숲 탐험가 다린",
    role: "hint_npc",
    sprite: "people5",
    faceKey: "face_people2",
    faceIndex: 0,
    getDialogue: (registry) => {
      // Very simple reactive check: if their highest level cat is > 3
      const party = registry.get("playerParty") || [];
      const hasStrongCat = party.some((c) => c.level > 3);
      if (hasStrongCat) {
        return [
          "풀숲을 조심해 저기에서 야생 고양이들이 너를 노릴 수 있어.",
          "다음엔 더 강한 고양이도 만날 거야. 안쪽은 기운이 심상치 않거든.",
        ];
      }
      return [
        "이 숲은 생각보다 깊어.",
        "풀숲에서는 언제든 야생 고양이들이 널 노릴 수 있어.",
      ];
    },
  },
  trainer_kyle: {
    id: "trainer_kyle",
    name: "초보 트레이너 카일",
    role: "trainer",
    trainerId: "kyle",
    sprite: "people6",
    faceKey: "face_people2",
    faceIndex: 1,
    getDialogue: (registry) => {
      const defeated = registry.get("defeatedTrainers") || [];
      if (defeated.includes("kyle")) {
        return ["와… 내가 졌어.", "더 열심히 훈련해야겠어."];
      }
      return ["너도 트레이너야?", "내 고양이랑 한번 붙어보자!"];
    },
  },

  // --- MOSSLIGHT PATH ---
  noah: {
    id: "noah",
    name: "여행자 노아",
    role: "hint_npc",
    sprite: "people7",
    faceKey: "face_people3",
    faceIndex: 0,
    getDialogue: (registry) => {
      if (registry.get("chapter1_done")) {
        return [
          "방금 그 굉음 들었어? 고대 숲 안쪽에서부터 땅이 흔들렸어!",
          "너무 무서워서 더는 숲 안쪽으로 못 들어가겠단다.",
        ];
      }
      return [
        "이 길은 고대 숲으로 이어진단다.",
        "하지만 조심해. 숲을 지키려는 자들이 예민해져 있어.",
      ];
    },
  },
  trainer_sera: {
    id: "trainer_sera",
    name: "트레이너 세라",
    role: "trainer",
    trainerId: "sera",
    sprite: "people8",
    faceKey: "face_people2",
    faceIndex: 2,
    getDialogue: (registry) => {
      const defeated = registry.get("defeatedTrainers") || [];
      if (defeated.includes("sera")) {
        return ["대단하네…", "넌 정말 강한 트레이너야. 신전에 갈 자격이 있어."];
      }
      return ["이 길을 지나가려면 나를 이겨야 해!"];
    },
  },

  // --- ANCIENT FOREST ---
  evan: {
    id: "evan",
    name: "신비한 여행자 에반",
    role: "lore_npc",
    sprite: "actor2",
    faceKey: "face_actor2",
    faceIndex: 0,
    getDialogue: (registry) => {
      if (registry.get("chapter1_done")) {
        return [
          "결국 올 것이 오고야 말았군...",
          "봉인에서 거대한 숲의 정령이 풀려난 게 느껴지느냐?",
          "저 안쪽, 가장 어두운 덤불 속을 조심해라.",
        ];
      }
      return [
        "이 숲은 아주 오래된 곳이야.",
        "고대 고양이들이 잠들어 있다는 이야기가 있지.",
        "…그리고 누군가 신전의 봉인을 노리고 있는 것 같아.",
      ];
    },
  },
  trainer_luke: {
    id: "trainer_luke",
    name: "숲 수호자 견습 루크",
    role: "trainer",
    trainerId: "luke",
    sprite: "actor3",
    faceKey: "face_actor3",
    faceIndex: 0,
    getDialogue: (registry) => {
      const defeated = registry.get("defeatedTrainers") || [];
      if (defeated.includes("luke")) {
        return ["너라면 이 숲의 시련을 이겨낼 수 있을 거다. 로완 님을 도와줘."];
      }
      return ["더 이상은 못 간다! 신전을 보호해야 해!"];
    },
  },

  // --- MOSSLIGHT SHRINE ---
  ellie: {
    id: "ellie",
    name: "순례자 엘리",
    role: "hint_npc",
    sprite: "actor5",
    faceKey: "face_actor5",
    faceIndex: 0,
    getDialogue: (registry) => {
      return [
        "신전에 들어가기 전에 준비를 단단히 해.",
        "수호자님은 강한 힘으로 무언가를 억누르고 계셔.",
      ];
    },
  },
  trainer_guardian_rowan: {
    id: "trainer_guardian_rowan",
    name: "신전 수호자 로완",
    role: "boss_trainer",
    trainerId: "guardian_rowan",
    sprite: "evil",
    faceKey: "face_evil",
    faceIndex: 0,
    getDialogue: (registry) => {
      const defeated = registry.get("defeatedTrainers") || [];
      if (defeated.includes("guardian_rowan")) {
        return [
          "크윽...",
          "네가 무슨 짓을 했는지 아느냐?",
          "결계가... 깨져버렸어. 설마 이 모든 게 그 자의 계획이었단 말인가!",
        ];
      }
      return [
        "여기까지 온 걸 보니 꽤 실력이 있군.",
        "하지만 이 앞은 절대 지나갈 수 없다. 세계의 평화를 위해!",
      ];
    },
  },
};
