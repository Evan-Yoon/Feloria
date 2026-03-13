/**
 * quests.js - Quest data and progression logic.
 */
import { saveSystem } from "./saveSystem.js";

export const QUEST_DATA = {
  first_steps: {
    id: "first_steps",
    title: "첫 걸음",
    description:
      "첫 번째 동료를 얻고 펠로리아를 탐험하는 기본 방법을 배웁니다.",
    objectives: [
      { id: "talk_mira", text: "촌장 현석과 대화하기", completed: false },
      {
        id: "choose_starter",
        text: "스타팅 포켓몬 선택하기",
        completed: false,
      },
      { id: "enter_forest", text: "그린포우 숲 입장하기", completed: false },
      {
        id: "trigger_encounter",
        text: "야생 몬스터와 조우하기",
        completed: false,
      },
      { id: "capture_cat", text: "야생 고양이 포획하기", completed: false },
      { id: "return_mira", text: "촌장 현석에게 돌아가기", completed: false },
    ],
    completed: false,
  },
  quest_toby_supply: {
    id: "quest_toby_supply",
    title: "토비의 불안",
    description:
      "상인 토비는 숲의 마력이 오염되고 있다고 걱정합니다. 신비한 약초를 구해다 주세요.",
    objectives: [
      { id: "talk_toby", text: "상인 토비와 대화하기", completed: false },
      {
        id: "collect_herbs",
        text: "그린포우 숲에서 신비한 약초 3개 채집하기 (0/3)",
        completed: false,
        count: 0,
        max: 3,
      },
      { id: "return_toby", text: "토비에게 약초 전달하기", completed: false },
    ],
    completed: false,
  },
  quest_lina_lost_cat: {
    id: "quest_lina_lost_cat",
    title: "리나의 잃어버린 고양이",
    description: "숲의 포효에 놀라 도망친 리나의 고양이를 찾아야 합니다.",
    objectives: [
      { id: "talk_lina", text: "주민 리나와 대화하기", completed: false },
      {
        id: "find_cat",
        text: "모스라이트 제단 근처에서 고양이 찾기",
        completed: false,
      },
      {
        id: "return_lina",
        text: "리나에게 고양이 소식 알리기",
        completed: false,
      },
    ],
    completed: false,
  },
  quest_sera_blockade: {
    id: "quest_sera_blockade",
    title: "세라의 경고",
    description: "촌장님의 지시로 모스라이트 길의 동태를 살핍니다.",
    objectives: [
      { id: "talk_chief", text: "촌장과 대화하기", completed: false },
      {
        id: "defeat_sera",
        text: "모스라이트 길에서 수호자의 제자 세라 처치하기",
        completed: false,
      },
    ],
    completed: false,
  },
  quest_luke_despair: {
    id: "quest_luke_despair",
    title: "루크의 절망",
    description: "고대 숲 입구를 막고 있는 루크를 설득하거나 돌파해야 합니다.",
    objectives: [
      {
        id: "reach_ancient_forest",
        text: "고대 숲 입구로 이동하기",
        completed: false,
      },
      {
        id: "defeat_luke",
        text: "수호자 견습 루크 처치하기",
        completed: false,
      },
    ],
    completed: false,
  },
  quest_chiefs_relic: {
    id: "quest_chiefs_relic",
    title: "거짓된 정화 장치",
    description: "신전을 정화하기 위해 촌장님으로부터 특별한 유물을 받습니다.",
    objectives: [
      { id: "report_chief", text: "촌장에게 상황 보고하기", completed: false },
      { id: "receive_relic", text: "정화의 유물 획득하기", completed: false },
    ],
    completed: false,
  },
  forest_awakening: {
    id: "forest_awakening",
    title: "숲의 각성",
    description: "깊은 숲 속에서 고대의 그림자가 요동칩니다. 신전을 찾으세요.",
    objectives: [
      { id: "explore_path", text: "모스라이트 길 탐험하기", completed: false },
      {
        id: "enter_ancient_forest",
        text: "고대 숲 입장하기",
        completed: false,
      },
      { id: "defeat_rowan", text: "수호자 로완 처치하기", completed: false },
    ],
    completed: false,
  },
};

export const questSystem = {
  /**
   * Completes a specific objective in a quest.
   * Updates the Phaser registry.
   */
  completeObjective: (registry, questId, objectiveId) => {
    const activeQuests =
      registry.get("activeQuests") || JSON.parse(JSON.stringify(QUEST_DATA));

    const quest = activeQuests[questId];
    if (!quest) return false;

    const objective = quest.objectives.find((o) => o.id === objectiveId);
    if (objective && !objective.completed) {
      objective.completed = true;
      console.log(
        `Quest Updated: ${quest.title} - ${objective.text} (Complete)`,
      );

      // Check if quest is fully completed
      if (quest.objectives.every((o) => o.completed)) {
        quest.completed = true;
        console.log(`Quest Completed: ${quest.title}`);
      }

      registry.set("activeQuests", activeQuests);

      // Notify UI
      // In Phaser 3, registry.parent is the Game instance. Game.scene is the SceneManager.
      const game = registry.parent;
      if (game && game.scene && typeof game.scene.get === "function") {
        const uiScene = game.scene.get("UIScene");
        if (uiScene) uiScene.events.emit("updateQuests");
      }

      // Autosave quest progress
      const mapId = registry.get("world_mapId") || "starwhisk_village";
      const tx = registry.get("world_spawnX") || 10;
      const ty = registry.get("world_spawnY") || 10;
      saveSystem.saveData(registry, mapId, tx, ty);

      return true;
    }
    return false;
  },

  /**
   * Gets the current state of a quest.
   */
  getQuest: (registry, questId) => {
    const activeQuests =
      registry.get("activeQuests") || JSON.parse(JSON.stringify(QUEST_DATA));
    // Initialize if not present
    if (!registry.has("activeQuests")) {
      registry.set("activeQuests", activeQuests);
    }
    return activeQuests[questId];
  },
};
