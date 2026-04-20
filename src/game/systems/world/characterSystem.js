import { ASSETS } from "../../config/assetPaths.js";

/**
 * characterSystem
 * Character sprite creation, animation setup, and player spawn for WorldScene.
 * All methods receive the WorldScene instance as `scene` where Phaser state is needed.
 */
export const characterSystem = {

  /**
   * Returns per-direction frame arrays for a character block on an RPG Maker spritesheet.
   * Standard layout: 4×2 blocks of 3×4 frames each (12 cols, 8 rows total).
   */
  getCharacterFrames(charIndex) {
    const sheetCols = 12;
    const blocksPerRow = 4;
    const blockX = charIndex % blocksPerRow;
    const blockY = Math.floor(charIndex / blocksPerRow);

    const startX = blockX * 3;
    const startY = blockY * 4;

    return {
      down: [
        (startY + 0) * sheetCols + startX,
        (startY + 0) * sheetCols + startX + 1,
        (startY + 0) * sheetCols + startX + 2,
      ],
      left: [
        (startY + 1) * sheetCols + startX,
        (startY + 1) * sheetCols + startX + 1,
        (startY + 1) * sheetCols + startX + 2,
      ],
      right: [
        (startY + 2) * sheetCols + startX,
        (startY + 2) * sheetCols + startX + 1,
        (startY + 2) * sheetCols + startX + 2,
      ],
      up: [
        (startY + 3) * sheetCols + startX,
        (startY + 3) * sheetCols + startX + 1,
        (startY + 3) * sheetCols + startX + 2,
      ],
    };
  },

  /** Registers walk animations for each direction on a sprite. */
  createCharacterAnims(scene, sprite, prefix, frames) {
    const directions = ["down", "left", "right", "up"];
    directions.forEach((dir) => {
      const key = `${prefix}_walk_${dir}`;
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(sprite.texture.key, {
            frames: frames[dir],
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  },

  /** Spawns the player sprite at the correct tile position and registers animations. */
  createPlayer(scene) {
    const config = ASSETS.CHARACTERS.PLAYER;
    const spawn = scene.mapData.spawns.find((s) => s.type === "player");
    const isInitialSpawn = scene.mapId === "starwhisk_village" && !scene.registry.get("intro_done");

    const tx =
      scene.spawnX !== undefined
        ? scene.spawnX
        : isInitialSpawn
          ? 10
          : spawn
            ? spawn.x
            : 10;
    const ty =
      scene.spawnY !== undefined
        ? scene.spawnY
        : isInitialSpawn
          ? 9
          : spawn
            ? spawn.y
            : 10;

    const frames = characterSystem.getCharacterFrames(config.CHARACTER_INDEX);
    const startFrame = frames.down[1];

    scene.player = scene.add.sprite(tx * 32 + 16, (ty + 1) * 32, config.KEY, startFrame);
    scene.player.setOrigin(0.5, 1);
    scene.player.setDepth(10);
    scene.player.tileX = tx;
    scene.player.tileY = ty;
    scene.player.animFrames = frames;

    characterSystem.createCharacterAnims(scene, scene.player, "player", frames);
  },
};
