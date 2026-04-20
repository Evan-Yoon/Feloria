# scenes/

Phaser 3 scene classes for all game states.

## Conventions
- Each scene extends `Phaser.Scene` with a unique `key` string
- Scene transitions via `this.scene.start(key, data)` or `this.scene.launch(key)` for overlays
- UI overlays (`UIScene`, `DialogScene`) are launched on top, not started
- `WorldScene` is the main overworld; `BattleScene` handles turn-based combat
- `StarterSelectScene` runs once on new game to pick a starter creature

## Scenes Reference
| Scene | Purpose |
|---|---|
| BootScene | Initial boot, sets global scale/config |
| PreloadScene | Asset loading with progress bar |
| StartScene | Title/main menu |
| WorldScene | Overworld exploration, NPC interaction, encounters |
| BattleScene | Turn-based creature combat |
| StarterSelectScene | Starter creature selection (new game) |
| UIScene | Persistent HUD overlay |
| DialogScene | Dialogue box overlay |
| MenuScene | In-game pause menu |
| PartyScene | Party management |
| InventoryScene | Item inventory |
| CodexScene | Creature codex/encyclopedia |
| ShopScene | Item shop |
| QuestScene | Quest log |
| SaveLoadScene | Save/load slots |
| EvolutionScene | Evolution animation |
| CutsceneScene | Story cutscenes |
| GameOverScene | Game over screen |
| NameScene | Player name entry |
