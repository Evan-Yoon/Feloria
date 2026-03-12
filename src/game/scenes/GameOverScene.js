import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Text
    this.add.text(width / 2, height / 2 - 50, "GAME OVER", {
      font: 'bold 64px "Press Start 2P", Courier',
      fill: "#e74c3c",
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, "진실을 마주하기에는 아직 부족했던 모양이다...", {
      font: '24px "Malgun Gothic", Arial',
      fill: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 100, "- 엔터를 눌러 마을로 돌아가기 -", {
      font: '20px Arial',
      fill: "#bdc3c7",
    }).setOrigin(0.5);

    // Input to restart at village
    this.input.keyboard.once("keydown-ENTER", () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        // Reset player to village (and maybe heal?)
        const party = this.registry.get("playerParty") || [];
        party.forEach(p => p.currentHp = p.maxHp);
        this.registry.set("playerParty", party);

        this.scene.start("WorldScene", {
          mapId: "starwhisk_village",
          spawnX: 10,
          spawnY: 10
        });
      });
    });
    
    this.input.keyboard.once("keydown-SPACE", () => {
      this.input.keyboard.emit('keydown-ENTER');
    });
  }
}
