import Phaser from 'phaser';
import { gameConfig } from './game/config/gameConfig.js';

/**
 * Main entry point for the Feloria RPG.
 * Initializes the Phaser game with the centralized configuration.
 */
// Last update: 2026-03-10
document.addEventListener('DOMContentLoaded', () => {
  // Simple error overlay for debugging
  window.onerror = (msg, url, lineNo, columnNo, error) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.color = 'red';
    div.style.backgroundColor = 'white';
    div.style.zIndex = '10000';
    div.innerHTML = `Error: ${msg} at ${lineNo}:${columnNo}`;
    document.body.appendChild(div);
    return false;
  };

  const game = new Phaser.Game(gameConfig);
  window.game = game;
});
