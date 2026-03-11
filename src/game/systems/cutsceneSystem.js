/**
 * cutsceneSystem.js
 * A lightweight system to handle scripted events inside WorldScene or BattleScene,
 * keeping the logic out of the core update loop.
 */

export const cutsceneSystem = {
  /**
   * Disables player input in a scene.
   * Assumes the scene has an `isDialogueActive` or `isMoving` flag we can toggle.
   */
  lockInput(scene) {
    scene.isDialogueActive = true;
    if (scene.cursors) scene.cursors.left.reset();
    if (scene.cursors) scene.cursors.right.reset();
    if (scene.cursors) scene.cursors.up.reset();
    if (scene.cursors) scene.cursors.down.reset();
    
    if (scene.player) scene.player.anims?.stop();
    if (scene.player) scene.player.setVelocity?.(0, 0);
  },

  /**
   * Restores player input in a scene.
   */
  unlockInput(scene) {
    // Only unlock if we aren't legitimately still in dialogue
    scene.time.delayedCall(100, () => {
        scene.isDialogueActive = false;
    });
  },

  /**
   * Pans the camera to a specific XY coordinate smoothly over a duration.
   * Promisified for async/await usage.
   */
  panCameraTo(scene, targetX, targetY, duration = 1000) {
    return new Promise((resolve) => {
      scene.cameras.main.stopFollow();
      scene.tweens.add({
        targets: scene.cameras.main,
        scrollX: targetX - scene.cameras.main.width / 2,
        scrollY: targetY - scene.cameras.main.height / 2,
        duration: duration,
        ease: 'Sine.easeInOut',
        onComplete: resolve
      });
    });
  },

  /**
   * Restores camera follow to the player smoothly.
   */
  restoreCameraToPlayer(scene, duration = 1000) {
    return new Promise((resolve) => {
      if (!scene.player) {
          resolve();
          return;
      }
      
      const px = scene.player.x;
      const py = scene.player.y;
      
      scene.tweens.add({
        targets: scene.cameras.main,
        scrollX: px - scene.cameras.main.width / 2,
        scrollY: py - scene.cameras.main.height / 2,
        duration: duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          scene.cameras.main.startFollow(scene.player, true);
          resolve();
        }
      });
    });
  },

  /**
   * Shakes the camera.
   */
  shakeCamera(scene, duration = 500, intensity = 0.01) {
    return new Promise((resolve) => {
      scene.cameras.main.shake(duration, intensity);
      scene.time.delayedCall(duration, resolve);
    });
  },

  /**
   * Launches DialogScene and waits for it to close.
   */
  playDialogue(scene, name, pages) {
    return new Promise((resolve) => {
      scene.scene.launch("DialogScene", {
        dialogue: { name, pages },
        onComplete: resolve
      });
    });
  },

  /**
   * Waits for standard time.
   */
  delay(scene, ms) {
    return new Promise((resolve) => {
      scene.time.delayedCall(ms, resolve);
    });
  }
};
