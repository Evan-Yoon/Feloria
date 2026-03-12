import Phaser from "phaser";
import { ASSETS } from "../config/assetPaths.js";

/**
 * DialogScene
 * An overlay scene that displays dialogue text boxes.
 */
export class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: "DialogScene" });
  }

  init(data) {
    this.dialogue = data.dialogue;
    // Filter out special tags like [SHOP_PROMPT] from display
    this.displayPages = this.dialogue.pages.filter((p) => !p.startsWith("["));
    this.currentPage = 0;
    this.faceKey = this.dialogue.faceKey || null;
    this.faceIndex = this.dialogue.faceIndex || 0;
    this.onComplete = data.onComplete;
  }

  create() {
    const { width, height } = this.cameras.main;
    const padding = 20;
    const boxHeight = 240; // Increased to fit 144x144 face + name comfortably

    // UI Box (Gray with white border)
    const box = this.add.container(padding, height - boxHeight - padding);

    const bg = this.add
      .rectangle(0, 0, width - padding * 2, boxHeight, 0x000000, 0.9)
      .setOrigin(0)
      .setStrokeStyle(4, 0xffffff);
    box.add(bg);

    // Speaker Name Box (Small header style)
    const nameText = this.dialogue.name || "???";
    this.speakerName = this.add.text(20, 15, nameText, {
      font: 'bold 24px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#f1c40f",
    });

    // Portrait (Below Name)
    const facePadding = 20;
    const portraitY = 55; // Below name

    console.log(`DialogScene: faceKey=${this.faceKey}, exists=${this.textures.exists(this.faceKey)}`);
    if (this.faceKey && this.textures.exists(this.faceKey)) {

      // --- 수정된 부분: 원본 이미지(__BASE)를 불러와 수학적으로 정확히 자르기 ---
      // 외부에서 스프라이트 시트 규격이 어떻게 잘못 설정되었든 무시하고 무조건 원본을 가져옵니다.
      this.faceSprite = this.add.image(0, 0, this.faceKey, '__BASE');

      const cols = 4;
      const rows = 2;
      const fullWidth = this.faceSprite.width;   // 원본 전체 가로 크기 (예: 576)
      const fullHeight = this.faceSprite.height; // 원본 전체 세로 크기 (예: 288)

      const faceW = fullWidth / cols;  // 얼굴 1개 가로 넓이 (정확히 1/4)
      const faceH = fullHeight / rows; // 얼굴 1개 세로 넓이 (정확히 1/2)

      // 인덱스를 바탕으로 몇 번째 열/행인지 구합니다.
      const col = this.faceIndex % cols;
      const row = Math.floor(this.faceIndex / cols);

      // 잘라낼 시작 좌표
      const cropX = col * faceW;
      const cropY = row * faceH;

      // 1. 필요한 얼굴 한 칸(144x144)만 보이도록 크롭 마스크를 씌웁니다.
      this.faceSprite.setCrop(cropX, cropY, faceW, faceH);

      // 2. 크롭된 얼굴이 화면의 엉뚱한 곳에 그려지지 않도록 기준점(Origin)을 당겨줍니다.
      this.faceSprite.setOrigin(cropX / fullWidth, cropY / fullHeight);

      // 3. 최종적으로 UI 컨테이너 안의 목표 위치에 배치합니다.
      this.faceSprite.setPosition(facePadding, portraitY);
      // -------------------------------------------------------------

      box.add(this.faceSprite);
    } else {
      console.warn(`DialogScene: Portrait texture '${this.faceKey}' not found!`);
    }

    // Content Text (Adjusted for 144x144 portrait)
    const textX = this.faceSprite ? facePadding + 144 + 25 : 30;
    const textY = 60;
    const textWidth = width - (padding * 2) - textX - 40;

    this.contentText = this.add.text(textX, textY, "", {
      font: 'bold 32px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      fill: "#ffffff",
      wordWrap: { width: textWidth },
      lineSpacing: 10,
    });

    // Continue Hint
    this.hintText = this.add
      .text(width - padding * 3, boxHeight - 25, "Space를 눌러 계속", {
        font: "italic 16px Arial",
        fill: "#bdc3c7",
      })
      .setOrigin(1, 1);

    box.add([this.speakerName, this.contentText, this.hintText]);

    // Show first page
    this.displayPage();

    // Input to progress
    this.input.keyboard.on("keydown-SPACE", () => this.nextPage());
    this.input.keyboard.on("keydown-ENTER", () => this.nextPage());
  }

  displayPage() {
    const rawText = this.displayPages[this.currentPage];
    const playerName = this.registry.get("playerName") || "여행자";
    const formattedText = rawText.replace(/{playerName}/g, playerName);
    this.contentText.setText(formattedText);
  }

  nextPage() {
    this.currentPage++;
    if (this.currentPage < this.displayPages.length) {
      this.displayPage();
    } else {
      this.finish();
    }
  }

  finish() {
    if (this.onComplete) this.onComplete();
    this.scene.stop();
  }
}