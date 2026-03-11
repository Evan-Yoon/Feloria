import Phaser from 'phaser';

/**
 * UIScene
 * An overlay scene dedicated to rendering UI elements that should be
 * completely immune to the WorldScene camera's zoom and jitter.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Hidden by default
    this.mapNameText = this.add.text(10, 10, '', {
      fontFamily: '"Press Start 2P", Courier, monospace',
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 0,
        stroke: true,
        fill: true,
      },
    }).setOrigin(0, 0);

    // Listen to events from the WorldScene
    const worldScene = this.scene.manager.getScene('WorldScene');
    
    worldScene.events.on('displayMapName', (mapName) => {
        this.mapNameText.setText(mapName);
        this.mapNameText.setVisible(true);
    });

    worldScene.events.on('hideMapName', () => {
        this.mapNameText.setVisible(false);
    });

    worldScene.events.on('shutdown', () => {
        this.mapNameText.setVisible(false);
    });
  }

  update() {
      // Ensure text drops if the world scene gets paused heavily
      const worldScene = this.scene.manager.getScene('WorldScene');
      if (!worldScene || !this.scene.isActive('WorldScene')) {
          this.mapNameText.setVisible(false);
      } else {
          this.mapNameText.setVisible(true);
      }
  }
}
