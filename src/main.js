import Phaser from 'phaser';
import { gameConfig } from './game/config/gameConfig.js';

/**
 * Main entry point for the Feloria RPG.
 * Initializes the Phaser game with the centralized configuration.
 */
document.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(gameConfig);
  
  // Expose game to window for debugging if needed (can be removed for production)
  window.game = game;
});
