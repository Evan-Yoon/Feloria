/**
 * quests.js - Quest data and progression logic.
 */
export const QUEST_DATA = {
  first_steps: {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Get your first companion and learn the basics of exploring Feloria.',
    objectives: [
      { id: 'talk_mira', text: 'Talk to Elder Mira', completed: false },
      { id: 'choose_starter', text: 'Choose a Starter', completed: false },
      { id: 'enter_forest', text: 'Enter Greenpaw Forest', completed: false },
      { id: 'trigger_encounter', text: 'Trigger a Wild Encounter', completed: false },
      { id: 'capture_cat', text: 'Capture a Wild Cat', completed: false },
      { id: 'return_mira', text: 'Return to Elder Mira', completed: false }
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
