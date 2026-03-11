import { ASSETS } from "../config/assetPaths.js";

export const skillEffectSystem = {
  /**
   * Plays a visual effect on the target sprite based on the effectType.
   * @param {Phaser.Scene} scene - The BattleScene instance
   * @param {Phaser.GameObjects.Sprite} targetSprite - The sprite receiving the attack
   * @param {string} effectType - The visual category (slash, fire, water, etc.)
   */
  playEffect(scene, targetSprite, effectType) {
    if (!scene || !targetSprite) return;

    const tx = targetSprite.x;
    const ty = targetSprite.y;

    switch (effectType) {
      case 'slash':
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.ATTACK1.KEY);
        this.playSlash(scene, tx, ty);
        break;
      case 'fire':
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.FIRE1.KEY);
        this.playFire(scene, tx, ty);
        break;
      case 'ice':
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.ICE1.KEY);
        this.playIce(scene, tx, ty);
        break;
      case 'spark':
      case 'thunder':
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.LIGHT1.KEY);
        this.playSpark(scene, tx, ty);
        break;
      case 'wind':
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.ATTACK12.KEY); // Windy look
        break;
      case 'heal':
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.HEAL1.KEY);
        break;
      default:
        this.playAnimEffect(scene, tx, ty, ASSETS.ANIMATIONS.ATTACK1.KEY);
        this.playImpact(scene, tx, ty);
        break;
    }
  },

  /**
   * Plays a sprite-based animation from our asset pack.
   */
  playAnimEffect(scene, x, y, animKey) {
    if (!scene.textures.exists(animKey)) return;

    const animName = `${animKey}_play`;
    if (!scene.anims.exists(animName)) {
      scene.anims.create({
        key: animName,
        frames: scene.anims.generateFrameNumbers(animKey),
        frameRate: 15,
        hideOnComplete: true
      });
    }

    const sprite = scene.add.sprite(x, y, animKey).setScale(2).setDepth(50);
    sprite.play(animName);
    sprite.on('animationcomplete', () => sprite.destroy());
  },

  playSlash(scene, x, y) {
    const slash = scene.add.line(x - 20, y - 20, 0, 0, 40, 40, 0xffffff)
      .setOrigin(0)
      .setLineWidth(4);
    
    scene.tweens.add({
      targets: slash,
      x: x + 20,
      y: y + 20,
      alpha: 0,
      duration: 200,
      onComplete: () => slash.destroy()
    });
  },

  playImpact(scene, x, y) {
    const ring = scene.add.circle(x, y, 10, 0xffffff)
      .setStrokeStyle(4, 0xaaaaaa);

    scene.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });
    scene.cameras.main.shake(150, 0.01);
  },

  playFire(scene, x, y) {
    for (let i = 0; i < 8; i++) {
      const ember = scene.add.circle(x, y, Math.random() * 6 + 2, 0xff4500);
      scene.tweens.add({
        targets: ember,
        x: x + (Math.random() - 0.5) * 80,
        y: y - Math.random() * 80,
        alpha: 0,
        scale: 0.5,
        duration: 400 + Math.random() * 200,
        ease: 'Sine.easeOut',
        onComplete: () => ember.destroy()
      });
    }
  },

  playWater(scene, x, y) {
    for (let i = 0; i < 10; i++) {
        const drop = scene.add.circle(x, y, 4, 0x3498db);
        scene.tweens.add({
          targets: drop,
          x: x + (Math.random() - 0.5) * 100,
          y: y + (Math.random() - 0.2) * 60,
          alpha: 0,
          duration: 300 + Math.random() * 300,
          ease: 'Cubic.easeOut',
          onComplete: () => drop.destroy()
        });
      }
  },

  playForest(scene, x, y) {
    for (let i = 0; i < 6; i++) {
        const leaf = scene.add.rectangle(x, y - 40, 6, 10, 0x2ecc71);
        scene.tweens.add({
          targets: leaf,
          x: x + (Math.random() - 0.5) * 60,
          y: y + 40 + Math.random() * 20,
          angle: Math.random() * 360,
          alpha: 0,
          duration: 600,
          ease: 'Sine.easeInOut',
          onComplete: () => leaf.destroy()
        });
      }
  },

  playSpark(scene, x, y) {
    const flash = scene.add.circle(x, y, 40, 0xf1c40f, 0.6);
    scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.5,
        duration: 150,
        onComplete: () => flash.destroy()
    });
    scene.cameras.main.shake(100, 0.01);
  },

  playIce(scene, x, y) {
    for (let i = 0; i < 5; i++) {
        const shard = scene.add.polygon(x, y, [[0,-10], [5,0], [0,10], [-5,0]], 0xaae8ff);
        scene.tweens.add({
            targets: shard,
            x: x + (Math.random() - 0.5) * 80,
            y: y + (Math.random() - 0.5) * 80,
            angle: 180,
            alpha: 0,
            duration: 400,
            onComplete: () => shard.destroy()
        });
    }
  },

  playRock(scene, x, y) {
    for (let i = 0; i < 4; i++) {
        const rock = scene.add.rectangle(x, y - 20, 12, 12, 0x7f8c8d);
        scene.tweens.add({
            targets: rock,
            y: y + 30,
            angle: Math.random() * 90,
            alpha: 0,
            duration: 300,
            ease: 'Bounce.easeOut',
            onComplete: () => rock.destroy()
        });
    }
    scene.cameras.main.shake(150, 0.02);
  },

  playShadow(scene, x, y) {
    const aura = scene.add.circle(x, y, 10, 0x8e44ad);
    scene.tweens.add({
        targets: aura,
        scale: 5,
        alpha: 0,
        duration: 500,
        onComplete: () => aura.destroy()
    });
  },

  playMystic(scene, x, y) {
    for (let i = 0; i < 8; i++) {
        const star = scene.add.star(x, y, 4, 3, 8, 0xf39c12);
        scene.tweens.add({
            targets: star,
            x: x + (Math.random() - 0.5) * 100,
            y: y - 20 - Math.random() * 80,
            angle: 180,
            alpha: 0,
            scale: 0.5,
            duration: 600,
            ease: 'Sine.easeOut',
            onComplete: () => star.destroy()
        });
    }
  }
};
