# systems/

Game logic systems — imported by scenes, not Phaser-scene classes themselves.

## Conventions
- Systems are plain JS modules (no Phaser scene inheritance)
- Stateless helpers preferred; stateful systems export an instance or class
- `koreanUtils.js` — all user-facing strings go through this for Korean text handling
- `saveSystem.js` — sole interface to localStorage; never access localStorage elsewhere

## Systems Reference
| File | Purpose |
|---|---|
| battleSystem.js | Turn resolution, damage calc, status effects |
| audioManager.js | BGM/SFX play/stop with volume control |
| encounterSystem.js | Random encounter rate, wild creature selection |
| evolutionSystem.js | Evolution condition checks and trigger |
| legendarySystem.js | Legendary creature unlock conditions |
| questSystem.js | Quest state tracking, objective completion |
| saveSystem.js | Serialize/deserialize game state to localStorage |
| shopSystem.js | Shop inventory and purchase logic |
| codexSystem.js | Codex unlock tracking |
| cutsceneSystem.js | Cutscene sequence playback |
| mapLoader.js | Tiled map loading and layer setup |
| pixelArtGenerator.js | Pixel art generation + `createPlaceholders(scene)` for all placeholder textures |
| skillEffectSystem.js | Visual/audio effects for skill use |
| koreanUtils.js | Korean text rendering utilities |
| npcInteractionSystem.js | NPC interaction dispatch, quest status logic, herb/cat pickup — all methods take `scene` as first arg |
| worldStorySystem.js | Story cutscene sequences (climax, post-climax, legendary, lost cat) — all methods take `scene` as first arg |
