/**
 * codex.js - Codex data manager for seen and caught creatures.
 */
export const codexSystem = {
  /**
   * Marks a creature as seen in the registry.
   */
  markSeen: (registry, creatureId) => {
    const seen = registry.get('seenCreatureIds') || [];
    if (!seen.includes(creatureId)) {
      seen.push(creatureId);
      registry.set('seenCreatureIds', seen);
      console.log(`Codex Updated: Seen ${creatureId}`);
    }
  },

  /**
   * Marks a creature as caught in the registry.
   */
  markCaught: (registry, creatureId) => {
    const caught = registry.get('caughtCreatureIds') || [];
    if (!caught.includes(creatureId)) {
      caught.push(creatureId);
      registry.set('caughtCreatureIds', caught);
      console.log(`Codex Updated: Caught ${creatureId}`);
    }
    // Automatically marks as seen as well
    codexSystem.markSeen(registry, creatureId);
  },

  /**
   * Checks if a creature has been seen.
   */
  hasSeen: (registry, creatureId) => {
    const seen = registry.get('seenCreatureIds') || [];
    return seen.includes(creatureId);
  },

  /**
   * Checks if a creature has been caught.
   */
  hasCaught: (registry, creatureId) => {
    const caught = registry.get('caughtCreatureIds') || [];
    return caught.includes(creatureId);
  }
};
