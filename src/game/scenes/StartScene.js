import Phaser from "phaser";
import { saveSystem } from "../systems/saveSystem.js";

/**
 * StartScene
 * The main menu of the game.
 */
export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Play Title BGM
    import("../systems/audioManager.js").then((module) => {
      const am = module.audioManager;
      if (am.game) {
        am.playBGM("bgm_title");
      } else {
        // Retry shortly if not ready
        this.time.delayedCall(100, () => am.playBGM("bgm_title"));
      }
    });

    // Background Image
    const background = this.add.image(width / 2, height / 2, "bg_title_screen");
    const scale = Math.max(
      width / background.width,
      height / background.height,
    );
    background.setScale(scale);

    // Dimming overlay for readability (initially transparent)
    this.overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.4)
      .setOrigin(0)
      .setAlpha(0);

    // Initial Press Start Text
    this.pressStartText = this.add
      .text(width / 2, height * 0.7, "화면을 클릭하여 시작", {
        font: 'bold 36px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        fill: "#ffffff",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5);

    // Add a pulsing effect to the press start text
    this.tweens.add({
      targets: this.pressStartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      loop: -1,
    });

    // Menu Container (initially hidden)
    this.menuContainer = this.add.container(0, 0).setAlpha(0).setVisible(false);

    // Menu Options (inside container)
    const newGameBtn = this.createMenuItem(
      width / 2,
      height * 0.6,
      "새 게임",
      () => {
        this.scene.start("CutsceneScene", {
          messages: [
            "펠로리아 대륙.",
            "아주 오래전, 세상을 파멸로 몰고 갈 뻔한 거대한 마력이 존재했다.",
            "사람들은 그 두려운 힘의 원천을 '고대 고양이'라 불렀고...",
            "...오랜 희생 끝에 그들을 깊은 숲, 모스라이트 신전에 봉인했다.",
            "하지만 수백 년이 지난 지금, 숲의 평화를 지키던 결계가 흔들리기 시작했다.",
            "누군가 숲의 수호자를 타락시켜, 그 끔찍한 봉인을 풀려 하고 있다.",
            "진실이 거짓의 그림자에 가려진 채... 이제 한 소년(소녀)의 모험이 시작된다.",
          ],
          images: [
            "bg_continent",
            "bg_ancient_cats",
            "bg_ancient_cats",
            "bg_ancient_cats",
            "bg_twisted_forest",
            "bg_shadow",
            "bg_shadow",
          ],
          nextScene: "NameScene",
        });
      },
    );

    // Check if Save Data Exists
    const saves = saveSystem.getAllSaves();
    const hasSave = saves.some((s) => s.exists);

    const continueBtn = this.createMenuItem(
      width / 2,
      height * 0.7,
      "이어하기",
      () => {
        if (hasSave) {
          this.scene.pause();
          this.scene.launch("SaveLoadScene", { mode: "load" });
        } else {
          this.cameras.main.shake(100, 0.005);
        }
      },
    );

    if (!hasSave) {
      continueBtn.setAlpha(0.5);
      continueBtn.removeInteractive();
    }

    const settingsBtn = this.createMenuItem(
      width / 2,
      height * 0.8,
      "설정",
      () => {
        this.showSettingsMenu();
      },
    );

    this.menuContainer.add([newGameBtn, continueBtn, settingsBtn]);

    // Click or Press Space/Enter to show menu
    const showMenu = () => {
      this.pressStartText.setVisible(false);
      this.menuContainer.setVisible(true);

      // Darken screen and show menu
      this.tweens.add({
        targets: [this.menuContainer, this.overlay],
        alpha: { from: 0, to: (t) => (t === this.menuContainer ? 1 : 0.4) },
        duration: 500,
      });
    };

    this.input.once("pointerdown", showMenu);
    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.pressStartText.visible) {
        showMenu();
      } else {
        // If menu is already visible but fading, skip fade
        this.tweens.killTweensOf([this.menuContainer, this.overlay]);
        this.menuContainer.setAlpha(1);
        this.overlay.setAlpha(0.4);
      }
    });
    this.input.keyboard.once("keydown-ENTER", showMenu);

    // Instructions
    this.instructions = this.add
      .text(width / 2, height - 50, "마우스를 사용하여 선택", {
        font: "16px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5)
      .setAlpha(0); // Also hide instructions initially

    this.menuContainer.add(this.instructions);
  }

  createMenuItem(x, y, text, callback) {
    const item = this.add
      .text(x, y, text, {
        font: "bold 32px Arial",
        fill: "#ffffff",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 0, fill: true },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    item.on("pointerover", () => {
      item.setStyle({ fill: "#e74c3c" });
      import("../systems/audioManager.js").then((module) => {
        module.audioManager.playSE("se_cursor");
      });
    });
    item.on("pointerout", () => item.setStyle({ fill: "#ffffff" }));
    item.on("pointerdown", callback);

    return item;
  }

  showSettingsMenu() {
    const { width, height } = this.cameras.main;

    // Hide main menu
    this.menuContainer.setVisible(false);

    // Settings Container
    this.settingsContainer = this.add.container(0, 0);

    const bg = this.add
      .rectangle(width / 2, height / 2, 600, 500, 0x000000, 0.85)
      .setStrokeStyle(4, 0xf1c40f);

    const title = this.add
      .text(width / 2, height / 2 - 200, "환경 설정", {
        font: "bold 36px Arial",
        fill: "#f1c40f",
      })
      .setOrigin(0.5);

    this.settingsContainer.add([bg, title]);

    // Volume Options
    const options = [
      { key: "master", label: "전체 볼륨" },
      { key: "bgm", label: "BGM" },
      { key: "bgs", label: "BGS" },
      { key: "me", label: "ME" },
      { key: "se", label: "SE" },
    ];

    import("../systems/audioManager.js").then((module) => {
      const am = module.audioManager;

      options.forEach((opt, i) => {
        const yPos = height / 2 - 100 + i * 60;

        const label = this.add
          .text(width / 2 - 250, yPos, opt.label, {
            font: "24px Arial",
            fill: "#ffffff",
          })
          .setOrigin(0, 0.5);

        const valText = this.add
          .text(
            width / 2 + 200,
            yPos,
            `${Math.round(am.volumes[opt.key] * 100)}%`,
            {
              font: "24px Arial",
              fill: "#ffffff",
            },
          )
          .setOrigin(1, 0.5);

        // Simple +/- Buttons
        const btnMinus = this.add
          .text(width / 2 + 50, yPos, "-", {
            font: "bold 32px Arial",
            fill: "#f1c40f",
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        const btnPlus = this.add
          .text(width / 2 + 100, yPos, "+", {
            font: "bold 32px Arial",
            fill: "#f1c40f",
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        btnMinus.on("pointerdown", () => {
          am.setVolume(opt.key, am.volumes[opt.key] - 0.1);
          valText.setText(`${Math.round(am.volumes[opt.key] * 100)}%`);
          am.playSE("se_cursor");
        });

        btnPlus.on("pointerdown", () => {
          am.setVolume(opt.key, am.volumes[opt.key] + 0.1);
          valText.setText(`${Math.round(am.volumes[opt.key] * 100)}%`);
          am.playSE("se_cursor");
        });

        this.settingsContainer.add([label, valText, btnMinus, btnPlus]);
      });
    });

    // Back Button
    const backBtn = this.add
      .text(width / 2, height / 2 + 200, "돌아가기", {
        font: "bold 28px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on("pointerover", () => backBtn.setStyle({ fill: "#e74c3c" }));
    backBtn.on("pointerout", () => backBtn.setStyle({ fill: "#ffffff" }));
    backBtn.on("pointerdown", () => {
      this.settingsContainer.destroy();
      this.menuContainer.setVisible(true);
      import("../systems/audioManager.js").then((module) => {
        module.audioManager.playSE("se_cancel");
      });
    });

    this.settingsContainer.add(backBtn);
  }
}
