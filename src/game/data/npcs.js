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
    sprite: "people2",
    characterIndex: 0,
    faceKey: "face_people2",
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
      const tobyQuest = activeQuests["quest_toby_supply"];
      const linaQuest = activeQuests["quest_lina_lost_cat"];
      const seraQuest = activeQuests["quest_sera_blockade"];
      const lukeQuest = activeQuests["quest_luke_despair"];
      const relicQuest = activeQuests["quest_chiefs_relic"];

      // Story Progression
      if (relicQuest && relicQuest.completed) {
        return [
          "이제 준비가 된 것 같구나. 그 유물만 있으면 신전의 '오염'을 정화할 수 있을 게야.",
          "서두르거라. 로완이 더 큰 힘을 깨우기 전에...",
        ];
      }

      if (relicQuest && !relicQuest.completed) {
        if (relicQuest.objectives[0].completed) {
          return [
            "서둘러 유물을 가져가거라. 모스라이트 신전의 중심부에 설치해야 한단다."
          ];
        }
        return [
          "참으로 고생 많았다. 세라와 루크... 그 아이들이 그렇게까지 타락했을 줄이야.",
          "나도 마음이 아프구나... 하지만 마을을 지키기 위해선 어쩔 수 없는 선택이었단다.",
          "자, 여기 내가 소중히 간직해온 '정화의 유물'을 주마. 이걸 신전 중심부에 설치하거라.",
        ];
      }

      // After defeating Luke, before getting the relic (reporting phase)
      if (lukeQuest && !lukeQuest.completed && lukeQuest.objectives.find(o => o.id === "defeat_luke").completed) {
        return [
          "세라와 루크를 막아냈느냐? 숲의 평화를 위해 조금만 더 힘내주렴.",
        ];
      }

      if (seraQuest && !seraQuest.completed) {
        // Before defeating Sera
        if (!seraQuest.objectives.find(o => o.id === "defeat_sera").completed) {
          return [
            "세라가 길을 막고 있다니... 로완에게 완전히 세뇌된 모양이구나.",
            "미안하지만, 그녀를 쓰러뜨려서라도 길을 열어야 한단다. 이건 정당한 방어란다.",
          ];
        }
        // Very brief moment between defeating Sera and completing the quest
        return [
          "세라를 무사히 돌파했구나! 네가 무사해서 정말 다행이다.",
          "이걸로 모스라이트 길은 확보되었어. 수고 많았다, {playerName}."
        ];
      }

      // After completing Sera's quest, and currently doing Luke's quest (before defeating Luke)
      if (lukeQuest && !lukeQuest.completed && !lukeQuest.objectives.find(o => o.id === "defeat_luke").completed) {
        return [
          "하지만 아직 쉴 틈이 없단다. 고대 숲 입구를 루크라는 견습 수호자가 굳게 지키고 있다는구나.",
          "그 아이 역시 로완의 거짓에 속아넘어간 게 분명해... 마음 굳게 먹고 루크마저 돌파해야 한단다!"
        ];
      }

      // Check if previous quests done to trigger seraQuest
      if (tobyQuest?.completed && linaQuest?.completed && !seraQuest) {
        return [
          "고생했다, {playerName}. 하지만 로완의 제자들이 길을 막기 시작했다는구나. 그들을 설득해야 한단다.",
        ];
      }

      // Quest progression checks for first_steps
      if (!firstSteps || !firstSteps.objectives[1].completed) {
        return [
          "어서 오너라, {playerName}.",
          "요즘 숲의 기운이 조금 이상하단다. 모험을 도와줄 고양이 한마리를 입양하거라...",
        ];
      }

      if (firstSteps && !firstSteps.completed) {
        if (
          firstSteps.objectives.find((o) => o.id === "return_mira").completed
        ) {
          return [
            "장하구나, {playerName}! 고양이를 훌륭하게 포획해왔군.",
            "하지만 상인 토비가 요즘 걱정이 많은 것 같더구나. 그에게 가서 도와줄 일이 없는지 물어보겠니?",
          ];
        }
        return [
          "네 고양이를 잘 돌봐주거라.",
          "숲에서는 언제 어떤 일이 벌어질지 모른단다. 그게 누구의 계획이든 말이지.",
        ];
      }

      // Default
      return [
        "피곤해 보이는구나. 이리 오렴.",
        "내가 네 파티를 아주 건강하게 유지해 주마.",
      ];
    },
  },
  boss_hyunseok_climax: {
    id: "boss_hyunseok_climax",
    name: "촌장 현석",
    role: "boss_trainer",
    sprite: "people2",
    characterIndex: 0,
    faceKey: "face_people2",
    faceIndex: 0,
    getDialogue: (registry) => {
      return [
        "하하하! 정말 수고했다, {playerName}.",
        "말했지 않느냐... 내가 널 아주 특별하게 생각한다고.",
        "네가 정화의 유물을 제단에 직접 꽂아준 덕분에, 신전의 결계가 완벽하게 무너졌다!",
        "이제 이 숲에 잠든 고대 고양이들을 내 의지대로 다룰 수 있어...",
        "자, 이제 넌 쓸모가 없어졌구나. 사라져라!",
      ];
    },
  },
  boss_hyunseok_defeated: {
    id: "boss_hyunseok_defeated",
    name: "촌장 현석",
    sprite: "people2",
    characterIndex: 0,
    faceKey: "face_people2",
    faceIndex: 1,
    getDialogue: (registry) => {
      if (registry.get("chapter1_done")) {
        return [
          "흥... 지금은 창살 안에 갇힌 신세지만...",
          "깨어난 고대 고양이들이 펠로리아를 휩쓸 것이다.",
          "두고 보거라... 내 야망은 결코 여기서 끝나지 않는다!"
        ];
      }
      return [
        "큭... 하지만 이미 전설의 고양이들이 깨어났다. 내 계획은 멈출 수 없어!",
      ];
    },
  },
  shopkeeper: {
    id: "shopkeeper",
    name: "상인 토비",
    role: "shopkeeper",
    sprite: "people2",
    characterIndex: 3,
    faceKey: "face_people2",
    faceIndex: 3,
    getDialogue: (registry) => {
      const activeQuests = registry.get("activeQuests") || {};
      const tobyQuest = activeQuests["quest_toby_supply"];

      if (tobyQuest) {
        if (tobyQuest.completed) {
          return [
            "역시 촌장님의 말씀이 옳았어. {playerName}, 네가 가져온 약초 덕분에 기운이 좀 나네.",
            "로완은 왜 이런 좋은 걸 독점하려고 하는 건지... 정말 무서운 사람이야.",
          ];
        }
        if (tobyQuest.objectives[1].completed) {
          return [
            "오! 약초를 구해왔구나! 정말 고마워.",
            "역시 믿을 건 촌장님과 너뿐이야.",
          ];
        }
        return [
          "로완... 그 사람이 숲의 기운을 다 빨아가고 있어. 이대론 우리 가계도 끝이야.",
          "그린포우 숲에서 '신비한 약초' 3개만 구해다 줄 수 있을까? 촌장님이 너라면 도와줄 거라 하셨어.",
        ];
      }

      return [
        "어서 와! 필요한 물건이 있나?",
        "로완 때문에 숲이 죽어가니 물건 떼오기도 힘드네.",
      ];
    },
  },
  villager1: {
    id: "villager1",
    name: "마을 주민 리나",
    role: "hint_npc",
    sprite: "people1",
    characterIndex: 1,
    faceKey: "face_people1",
    faceIndex: 1,
    getDialogue: (registry) => {
      if (registry.get("chapter1_done")) {
        return [
          "하늘이 이상해! 멀리 산등성이에서 번쩍이는 걸 봤어!",
          "촌장님이 말씀하신 대로 로완이 결국 재앙을 불러온 걸까?",
        ];
      }

      const activeQuests = registry.get("activeQuests") || {};
      const linaQuest = activeQuests["quest_lina_lost_cat"];

      if (linaQuest) {
        if (linaQuest.completed) {
          return [
            "우리 고양이를 찾아줘서 정말 고마워. 떨고 있는 걸 보니 숲의 비명 소리가 정말 끔찍했나 봐.",
            "촌장님 말씀처럼... 로완이 정말 숲을 망치고 있는 게 분명해!",
          ];
        }
        if (linaQuest.objectives[1].completed) {
          return ["고양이를 발견했구나! 곧 돌아오겠지? 정말 다행이야."];
        }
        return [
          "흑흑... 우리 고양이가 어디론가 사라졌어.",
          "숲에서 들려온 기분 나쁜 소리에 놀라 도망친 것 같아. 분명 로완이 수작을 부리는 게야!",
          "제단 근처에서 우리 고양이를 좀 찾아봐 줄래?",
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
    sprite: "people1",
    characterIndex: 2,
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
    sprite: "people3",
    characterIndex: 0,
    faceKey: "face_people3",
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
    sprite: "people3",
    characterIndex: 1,
    faceKey: "face_people3",
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
    sprite: "people4",
    characterIndex: 7,
    faceKey: "face_people4",
    faceIndex: 7,
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
    sprite: "actor1",
    characterIndex: 3,
    faceKey: "face_actor1",
    faceIndex: 3,
    getDialogue: (registry) => {
      const activeQuests = registry.get("activeQuests") || {};
      const seraQuest = activeQuests["quest_sera_blockade"];
      const defeated = registry.get("defeatedTrainers") || [];

      if (defeated.includes("sera")) {
        return [
          "결국... 봉인을 풀려는 건가요?",
          "촌장님의 말이 진실이라 믿는 당신...",
          "지금이라도 늦지 않았기를 바랄 뿐이에요.",
        ];
      }

      if (seraQuest && !seraQuest.completed && !seraQuest.objectives.find(o => o.id === "defeat_sera").completed) {
        return [
          "더 이상은 안 돼요! 숲의 진실을 모르는 자는 돌아가세요!",
          "당신은 이용당하고 있는 거예요... 하지만 지금은 제 말이 들리지 않겠죠.",
          "숲과 동료들을 지키기 위해, 당신을 여기서 막겠습니다!",
        ];
      }

      return [
        "촌장님은 대체 무슨 생각을 하시는 건지 모르겠어요.",
        "우린 로완 님을 믿을 뿐이에요...",
      ];
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
      const activeQuests = registry.get("activeQuests") || {};
      const lukeQuest = activeQuests["quest_luke_despair"];
      const forestQuest = activeQuests["forest_awakening"];
      const defeated = registry.get("defeatedTrainers") || [];

      if (forestQuest && !forestQuest.completed) {
        return [
          "로완 스승님은 신전 안에 계셔... 너무 늦지 않았기를...",
          "조심해, {playerName}.",
        ];
      }

      if (defeated.includes("luke")) {
        return [
          "크윽... 내가 약해서... 숲을 지키지 못했어...",
          "제발... 촌장의 말에 속지 마. 로완 님은 우리 모두를 위해 싸우고 계신 거야!",
        ];
      }

      if (lukeQuest && !lukeQuest.completed && !lukeQuest.objectives.find(o => o.id === "defeat_luke").completed) {
        return [
          "멈춰! 촌장에게 속고 있는 거야! 제발 여기서 멈춰!",
          "세라 누나까지 쓰러뜨리고 오다니... 당신은 대체 무엇을 위해 싸우는 겁니까?",
          "더 이상 전진하게 둘 순 없어. 내 모든 걸 걸고 막겠다!",
        ];
      }

      return [
        "신전의 봉인을 지키는 것이 나의 사명이다!",
        "로완 님은 우리 모두를 위해 싸우고 계신 거야..."
      ];
    },
  },

  // --- MOSSLIGHT SHRINE ---
  ellie: {
    id: "ellie",
    name: "순례자 엘리",
    role: "boss_trainer",
    trainerId: "ellie",
    sprite: "actor5",
    characterIndex: 0,
    faceKey: "face_actor5",
    faceIndex: 0,
    getDialogue: (registry) => {
      const activeQuests = registry.get("activeQuests") || {};
      const forestQuest = activeQuests["forest_awakening"];

      if (forestQuest && !forestQuest.completed) {
        return [
          "여기는 네가 올 곳이 아니다. 당장 물러나거라!",
          "숲의 질서를 어지럽히는 자들은 결코 용서하지 않겠다.",
        ];
      }

      return ["수호자님은 강한 힘으로 무언가를 억누르고 계셔."];
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
      const activeQuests = registry.get("activeQuests") || {};
      const forestQuest = activeQuests["forest_awakening"];

      if (!forestQuest || !forestQuest.objectives[0].completed) {
        return [
          "여기는 네가 올 곳이 아니다. 당장 물러나거라!",
          "숲의 질서를 어지럽히는 자들은 결코 용서하지 않겠다.",
        ];
      }

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

  // --- CLIMAX NPCs ---
  boss_hyunseok_climax: {
    id: "boss_hyunseok_climax",
    name: "촌장 현석",
    role: "boss_trainer",
    trainerId: "boss_hyunseok",
    sprite: "people2",
    characterIndex: 5, // Custom index for bad guy look
    faceKey: "face_people2",
    faceIndex: 5,
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
    role: "lore_npc",
    sprite: "people2",
    characterIndex: 5,
    faceKey: "face_people2",
    faceIndex: 5,
    getDialogue: (registry) => {
      return [
        "크윽... 이 힘이... 내 통제를 벗어나...?",
        "신전의 봉인이 완전히 풀려버렸어! 전설의 고양이들이...!",
        "안 돼! 내가 지배해야 할 전설들이 흩어지고 있다!",
      ];
    },
  },
};
