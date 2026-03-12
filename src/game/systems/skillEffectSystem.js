import { ASSETS } from "../config/assetPaths.js";
import { animationConfig } from "../config/animationConfig.js";
import { getAnimationKey } from "../config/skillAnimationMapping.js";

export const skillEffectSystem = {
  /**
   * Plays a visual effect on the target sprite based on the skill and type.
   * @param {Phaser.Scene} scene - The BattleScene instance
   * @param {Phaser.GameObjects.Sprite} targetSprite - The sprite receiving the attack
   * @param {string} skillId - The ID of the skill being used
   * @param {string} type - The type of the skill or creature (for fallback)
   */
  playEffect(scene, targetSprite, skillId, type) {
    if (!scene || !targetSprite) return;

    const animKeyName = getAnimationKey(skillId, type);
    // Find the asset key from ASSETS.ANIMATIONS
    const assetEntry = Object.entries(ASSETS.ANIMATIONS).find(([name]) => 
      name.toLowerCase() === animKeyName.toLowerCase()
    );

    if (!assetEntry) {
      console.warn(`skillEffectSystem: No asset found for animation key ${animKeyName}`);
      // Fallback to ATTACK1
      this.playAnimEffect(scene, targetSprite, "Attack1", ASSETS.ANIMATIONS.ATTACK1.KEY);
      return;
    }

    const [name, asset] = assetEntry;
    this.playAnimEffect(scene, targetSprite, animKeyName, asset.KEY);
  },

  /**
   * Plays a sprite-based animation using our configuration system.
   */
  playAnimEffect(scene, targetSprite, configKey, assetKey) {
    if (!scene.textures.exists(assetKey)) {
      console.warn(`skillEffectSystem: Texture ${assetKey} not found.`);
      return;
    }

    const config = animationConfig[configKey] || {
      frameRate: 15,
      scale: 2,
      originX: 0.5,
      originY: 0.5,
      offsetX: 0,
      offsetY: 0,
      anchorType: "center"
    };

    const animName = `${assetKey}_play`;
    if (!scene.anims.exists(animName)) {
      scene.anims.create({
        key: animName,
        frames: scene.anims.generateFrameNumbers(assetKey),
        frameRate: config.frameRate || 15,
        hideOnComplete: true
      });
    }

    let x = targetSprite.x;
    let y = targetSprite.y;

    // Handle Anchor Rules
    if (config.anchorType === "feet") {
      // Position at the bottom of the target sprite
      y = targetSprite.y + (targetSprite.displayHeight / 2);
    } else if (config.anchorType === "screen center") {
      // Position at the center of the screen
      x = scene.cameras.main.width / 2;
      y = scene.cameras.main.height / 2;
    }
    // "center" is default (targetSprite.x, targetSprite.y)

    // Apply Offsets
    x += (config.offsetX || 0);
    y += (config.offsetY || 0);

    const sprite = scene.add.sprite(x, y, assetKey)
      .setScale(config.scale || 1)
      .setOrigin(config.originX ?? 0.5, config.originY ?? 0.5)
      .setDepth(50);

    sprite.play(animName);
    sprite.on('animationcomplete', () => sprite.destroy());

    // Screen shake for certain effects if desired, or based on impact
    if (configKey.includes("Fire") || configKey.includes("Spear") || configKey.includes("Thunder")) {
      scene.cameras.main.shake(150, 0.01);
    }
  }
};
