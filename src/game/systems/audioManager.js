import Phaser from "phaser";

/**
 * AudioManager
 * Centralized system to manage BGM, BGS, ME, and SE in Feloria.
 * Ensures only one BGM/BGS plays at a time and handles transitions.
 */
class AudioManager {
  constructor() {
    this.game = null;
    this.currentBGM = null;
    this.currentBGS = null;
    this.currentBGMKey = null;
    this.currentBGSKey = null;
    this.mapBGMKey = null;
    this.isMEPlaying = false;
    this.bgmVolume = 0.5;
    this.seVolume = 0.7;
    this.meVolume = 0.7;
    this.bgsVolume = 0.4;
  }

  /**
   * Initializes the manager with the game instance.
   */
  init(game) {
    this.game = game;
  }

  /**
   * Plays a BGM.
   * @param {string} key Asset key for the BGM
   * @param {object} options { loop, fade, volume }
   */
  playBGM(key, options = {}) {
    if (!this.game) return;
    if (this.currentBGMKey === key) return; // Already playing

    const loop = options.loop !== undefined ? options.loop : true;
    const fade = options.fade !== undefined ? options.fade : 500;
    const volume = options.volume !== undefined ? options.volume : this.bgmVolume;

    // Stop previous BGM with fade
    this.stopBGM(fade);

    this.currentBGMKey = key;
    const activeScene = this.game.scene.getScenes(true)[0];
    if (!activeScene) return;

    this.currentBGM = activeScene.sound.add(key, { loop, volume: 0 });
    this.currentBGM.play();

    if (fade > 0) {
      activeScene.tweens.add({
        targets: this.currentBGM,
        volume: volume,
        duration: fade
      });
    } else {
      this.currentBGM.setVolume(volume);
    }
  }

  /**
   * Stops the current BGM with an optional fade.
   */
  stopBGM(fade = 500) {
    if (!this.currentBGM) return;

    const bgm = this.currentBGM;
    const activeScene = this.game.scene.getScenes(true)[0];

    this.currentBGM = null;
    this.currentBGMKey = null;

    if (fade > 0 && activeScene) {
      activeScene.tweens.add({
        targets: bgm,
        volume: 0,
        duration: fade,
        onComplete: () => {
          bgm.stop();
          bgm.destroy();
        }
      });
    } else {
      bgm.stop();
      bgm.destroy();
    }
  }

  /**
   * Remembers the map BGM to resume it later.
   */
  setMapBGM(key) {
    this.mapBGMKey = key;
  }

  /**
   * Resumes the remembered map BGM.
   */
  resumeMapBGM(fade = 500) {
    if (this.mapBGMKey) {
      this.playBGM(this.mapBGMKey, { fade });
    }
  }

  /**
   * Plays a BGS (Ambient looping sound).
   */
  playBGS(key, options = {}) {
    if (!this.game) return;
    if (this.currentBGSKey === key) return;

    const loop = options.loop !== undefined ? options.loop : true;
    const volume = options.volume !== undefined ? options.volume : this.bgsVolume;

    this.stopBGS();

    this.currentBGSKey = key;
    const activeScene = this.game.scene.getScenes(true)[0];
    if (!activeScene) return;

    this.currentBGS = activeScene.sound.add(key, { loop, volume });
    this.currentBGS.play();
  }

  /**
   * Stops the current BGS.
   */
  stopBGS() {
    if (this.currentBGS) {
      this.currentBGS.stop();
      this.currentBGS.destroy();
      this.currentBGS = null;
      this.currentBGSKey = null;
    }
  }

  /**
   * Plays a short Music Effect (ME).
   * Temporarily ducks BGM if requested.
   */
  playME(key, options = {}) {
    if (!this.game) return;

    const volume = options.volume !== undefined ? options.volume : this.meVolume;
    const activeScene = this.game.scene.getScenes(true)[0];
    if (!activeScene) return;

    // Optional BGM ducking
    const prevBGMVol = this.currentBGM ? this.currentBGM.volume : 0;
    if (this.currentBGM && options.duckBGM) {
      this.currentBGM.setVolume(prevBGMVol * 0.2);
    }

    const me = activeScene.sound.add(key, { volume });
    me.play();
    this.isMEPlaying = true;

    me.once('complete', () => {
      this.isMEPlaying = false;
      if (this.currentBGM && options.duckBGM) {
        activeScene.tweens.add({
          targets: this.currentBGM,
          volume: prevBGMVol,
          duration: 300
        });
      }
      me.destroy();
    });
  }

  /**
   * Plays a sound effect (SE).
   */
  playSE(key, options = {}) {
    if (!this.game) return;

    const volume = options.volume !== undefined ? options.volume : this.seVolume;
    const activeScene = this.game.scene.getScenes(true)[0];
    if (!activeScene) return;

    activeScene.sound.play(key, { volume });
  }

  /**
   * Specialized method to play SE for a skill based on its type.
   */
  playSkillSE(type) {
    const typeMap = {
      "물": "se_skill_mystic", // Wait, water... let me check my keys
      "불": "se_skill_fire",
      "숲": "se_skill_wind",
      "신비": "se_skill_mystic",
      "전기": "se_skill_thunder",
      "어둠": "se_skill_shadow",
      "바위": "se_skill_rock",
      "빛": "se_skill_light",
      "노말": "se_attack_basic"
    };
    
    // Reverse lookup or use normalized names
    const skillKey = typeMap[type] || "se_attack_basic";
    this.playSE(skillKey);
  }
}

export const audioManager = new AudioManager();
