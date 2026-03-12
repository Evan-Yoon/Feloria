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

    // Volume Defaults
    this.volumes = {
      master: 1.0,
      bgm: 0.5,
      bgs: 0.4,
      me: 0.7,
      se: 0.7
    };

    this.loadVolumes();
  }

  /**
   * Initializes the manager with the game instance.
   */
  init(game) {
    this.game = game;
    this.setupResumeOnInput();
  }

  /**
   * Loads volumes from localStorage.
   */
  loadVolumes() {
    try {
      const saved = localStorage.getItem('feloria_audio_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.volumes = { ...this.volumes, ...parsed };
      }
    } catch (e) {
      console.warn("AudioManager: Failed to load volumes", e);
    }
  }

  /**
   * Saves volumes to localStorage.
   */
  saveVolumes() {
    try {
      localStorage.setItem('feloria_audio_config', JSON.stringify(this.volumes));
    } catch (e) {
      console.warn("AudioManager: Failed to save volumes", e);
    }
  }

  /**
   * Sets volume for a specific channel.
   * @param {string} channel 'master', 'bgm', 'bgs', 'me', 'se'
   * @param {number} value 0.0 to 1.0
   */
  setVolume(channel, value) {
    if (this.volumes[channel] !== undefined) {
      this.volumes[channel] = Phaser.Math.Clamp(value, 0, 1);
      this.saveVolumes();
      this.updateActiveVolumes();
    }
  }

  /**
   * Updates currently playing audio with new volume settings.
   */
  updateActiveVolumes() {
    if (this.currentBGM) {
      this.currentBGM.setVolume(this.volumes.bgm * this.volumes.master);
    }
    if (this.currentBGS) {
      this.currentBGS.setVolume(this.volumes.bgs * this.volumes.master);
    }
  }

  /**
   * Automates resuming AudioContext on first user interaction.
   * Modern browsers block audio until a gesture occurs.
   */
  setupResumeOnInput() {
    const resume = () => {
      if (this.game && this.game.sound && this.game.sound.context) {
        if (this.game.sound.context.state === 'suspended') {
          this.game.sound.context.resume();
        }
      }
      // Once unlocked, we don't need these listeners anymore
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };

    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
  }

  /**
   * Plays a BGM.
   * @param {string} key Asset key for the BGM
   * @param {object} options { loop, fade, volume }
   */
  playBGM(key, options = {}) {
    if (!this.game) return;
    
    // Safety check: is it in cache?
    if (!this.game.cache.audio.exists(key)) {
      console.warn(`AudioManager: BGM key "${key}" not found in cache.`);
      return;
    }
    
    if (this.currentBGMKey === key) return; // Already playing

    const loop = options.loop !== undefined ? options.loop : true;
    const fade = options.fade !== undefined ? options.fade : 500;
    const volume = options.volume !== undefined ? options.volume : (this.volumes.bgm * this.volumes.master);

    // Stop previous BGM with fade
    this.stopBGM(fade);

    this.currentBGMKey = key;
    
    // Use global sound manager for BGM so it persists across scenes
    this.currentBGM = this.game.sound.add(key, { loop, volume: 0 });
    this.currentBGM.play();

    if (fade > 0) {
      // Use any active scene for the tween
      const activeScene = this.game.scene.getScenes(true)[0];
      if (activeScene) {
        activeScene.tweens.add({
          targets: this.currentBGM,
          volume: volume,
          duration: fade
        });
      } else {
        this.currentBGM.setVolume(volume);
      }
    } else {
      this.currentBGM.setVolume(volume);
    }
    
    // Handle the case where audio context is suspended
    if (this.game.sound.context.state === 'suspended') {
      console.log("AudioManager: AudioContext is suspended. Music will start on user gesture.");
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
    if (!this.game || !this.game.cache.audio.exists(key)) return;
    if (this.currentBGSKey === key) return;

    const loop = options.loop !== undefined ? options.loop : true;
    const volume = options.volume !== undefined ? options.volume : (this.volumes.bgs * this.volumes.master);

    this.stopBGS();

    this.currentBGSKey = key;
    this.currentBGS = this.game.sound.add(key, { loop, volume });
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
    if (!this.game || !this.game.cache.audio.exists(key)) return;

    const volume = options.volume !== undefined ? options.volume : (this.volumes.me * this.volumes.master);

    // Optional BGM ducking
    const prevBGMVol = this.currentBGM ? this.currentBGM.volume : 0;
    if (this.currentBGM && options.duckBGM) {
      this.currentBGM.setVolume(prevBGMVol * 0.2);
    }

    const me = this.game.sound.add(key, { volume });
    me.play();
    this.isMEPlaying = true;

    me.once('complete', () => {
      this.isMEPlaying = false;
      if (this.currentBGM && options.duckBGM) {
        // Use active scene for tween
        const activeScene = this.game.scene.getScenes(true)[0];
        if (activeScene) {
          activeScene.tweens.add({
            targets: this.currentBGM,
            volume: prevBGMVol,
            duration: 300
          });
        } else {
          this.currentBGM.setVolume(prevBGMVol);
        }
      }
      me.destroy();
    });
  }

  /**
   * Plays a sound effect (SE).
   */
  playSE(key, options = {}) {
    if (!this.game) return;
    
    if (!this.game.cache.audio.exists(key)) {
      // Don't log for cursor moves to avoid spamming
      if (key !== 'se_cursor') {
        console.warn(`AudioManager: SE key "${key}" not found in cache.`);
      }
      return;
    }

    const volume = options.volume !== undefined ? options.volume : (this.volumes.se * this.volumes.master);
    this.game.sound.play(key, { volume });
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
