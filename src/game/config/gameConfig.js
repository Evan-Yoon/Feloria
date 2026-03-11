import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { StartScene } from '../scenes/StartScene.js';
import { NameScene } from '../scenes/NameScene.js';
import { StarterSelectScene } from '../scenes/StarterSelectScene.js';
// We will import subsequent scenes here as they are developed
import { WorldScene } from '../scenes/WorldScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { DialogScene } from '../scenes/DialogScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { PartyScene } from '../scenes/PartyScene.js';
import { CodexScene } from '../scenes/CodexScene.js';
import { QuestScene } from '../scenes/QuestScene.js';
import { EvolutionScene } from '../scenes/EvolutionScene.js';
import { ShopScene } from '../scenes/ShopScene.js';
import { InventoryScene } from '../scenes/InventoryScene.js';
import { SaveLoadScene } from '../scenes/SaveLoadScene.js';
import { UIScene } from '../scenes/UIScene.js';

/**
 * Centralized Phaser game configuration.
 */
export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  pixelArt: true, // Important for the pixel RPG aesthetic
  roundPixels: true,
  backgroundColor: '#000000',
  scene: [
    BootScene,
    PreloadScene,
    StartScene,
    NameScene,
    StarterSelectScene,
    WorldScene,
    BattleScene,
    DialogScene,
    MenuScene,
    PartyScene,
    CodexScene,
    QuestScene,
    EvolutionScene,
    ShopScene,
    InventoryScene,
    SaveLoadScene,
    UIScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Top-down game, no gravity
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
