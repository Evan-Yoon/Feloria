/**
 * quests.js - Quest data and progression logic.
 */
import { saveSystem } from './saveSystem.js';

export const QUEST_DATA = {
  first_steps: {
    id: 'first_steps',
    title: '첫 걸음',
    description: '첫 번째 동료를 얻고 펠로리아를 탐험하는 기본 방법을 배웁니다.',
    objectives: [
      { id: 'talk_mira', text: '촌장 현석과 대화하기', completed: false },
      { id: 'choose_starter', text: '스타팅 포켓몬 선택하기', completed: false },
      { id: 'enter_forest', text: '그린포우 숲 입장하기', completed: false },
      { id: 'trigger_encounter', text: '야생 몬스터와 조우하기', completed: false },
      { id: 'capture_cat', text: '야생 고양이 포획하기', completed: false },
      { id: 'return_mira', text: '촌장 현석에게 돌아가기', completed: false }
    ],
    completed: false
  },
  forest_awakening: {
    id: 'forest_awakening',
    title: '숲의 각성',
    description: '깊은 숲 속에서 고대의 그림자가 요동칩니다. 신전을 찾으세요.',
    objectives: [
      { id: 'explore_path', text: '모스라이트 길 탐험하기', completed: false },
      { id: 'enter_ancient_forest', text: '고대 숲 입장하기', completed: false },
      { id: 'defeat_rowan', text: '수호자 로완 처치하기', completed: false }
    ],
    completed: false
  }
};

export const questSystem = {
  /**
   * Completes a specific objective in a quest.
   * Updates the Phaser registry.
   */
  completeObjective: (registry, questId, objectiveId) => {
    const activeQuests = registry.get('activeQuests') || JSON.parse(JSON.stringify(QUEST_DATA));
    
    const quest = activeQuests[questId];
    if (!quest) return false;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (objective && !objective.completed) {
      objective.completed = true;
      console.log(`Quest Updated: ${quest.title} - ${objective.text} (Complete)`);
      
      // Check if quest is fully completed
      if (quest.objectives.every(o => o.completed)) {
        quest.completed = true;
        console.log(`Quest Completed: ${quest.title}`);
      }

      registry.set('activeQuests', activeQuests);

      // Notify UI
      const uiScene = registry.parent.scene.get('UIScene');
      if (uiScene) uiScene.events.emit('updateQuests');

      // Autosave quest progress
      const mapId = registry.get('world_mapId') || 'starwhisk_village';
      const tx = registry.get('world_spawnX') || 10;
      const ty = registry.get('world_spawnY') || 10;
      saveSystem.saveData(registry, mapId, tx, ty);

      return true;
    }
    return false;
  },

  /**
   * Gets the current state of a quest.
   */
  getQuest: (registry, questId) => {
    const activeQuests = registry.get('activeQuests') || JSON.parse(JSON.stringify(QUEST_DATA));
    // Initialize if not present
    if (!registry.has('activeQuests')) {
        registry.set('activeQuests', activeQuests);
    }
    return activeQuests[questId];
  }
};
