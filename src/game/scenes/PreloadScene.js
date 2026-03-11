import Phaser from 'phaser';
import { ASSETS } from '../config/assetPaths.js';
import { CREATURES } from '../data/creatures.js';
import { pixelArtGenerator } from '../systems/pixelArtGenerator.js';
import bgContinent from '../data/graphics/startscene/펠로리아 대륙.png';
import bgAncientCats from '../data/graphics/startscene/고대 고양이.png';
import bgTwistedForest from '../data/graphics/startscene/뒤틀린 숲.png';
import bgShadow from '../data/graphics/startscene/흑막.png';
import bgTitleScreen from '../data/graphics/startscene/Feloria_title_screen.png';

/**
 * PreloadScene
 * Responsible for loading all game assets.
 * Displays a loading bar to the user.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    console.log('PreloadScene: Loading assets...');

    // Create loading UI
    this.createLoadingUI();

    // 1. Generic Image Assets (Faces, Battlebacks, Parallaxes, Tilesets)
    const imageCats = ['BATTLEBACKS1', 'BATTLEBACKS2', 'PARALLAXES', 'TILESETS'];
    imageCats.forEach(cat => {
      Object.values(ASSETS[cat]).forEach(asset => {
        this.load.image(asset.KEY, asset.PATH);
      });
    });


    // 2. Spritesheets (Characters, Animations, Faces, Monster Fallbacks)
    const sheetCats = ['CHARACTERS', 'ANIMATIONS', 'FACES', 'SPRITES'];
    sheetCats.forEach(cat => {
      Object.values(ASSETS[cat]).forEach(asset => {
        if (asset.FRAME_CONFIG) {
          this.load.spritesheet(asset.KEY, asset.PATH, asset.FRAME_CONFIG);
        } else {
          this.load.image(asset.KEY, asset.PATH);
        }
      });
    });

    // Error handling: if an asset fails to load, it won't crash the scene
    this.load.on('loaderror', (file) => {
      console.warn(`Failed to load asset: ${file.key} at ${file.src}`);
    });

    // Load Start Scene Cutscene Backgrounds (Legacy/Fallback)
    this.load.image('bg_continent', bgContinent);
    this.load.image('bg_ancient_cats', bgAncientCats);
    this.load.image('bg_twisted_forest', bgTwistedForest);
    this.load.image('bg_shadow', bgShadow);
    this.load.image('bg_title_screen', bgTitleScreen);
  }

  create() {
    console.log('PreloadScene: Assets loaded, creating placeholder textures...');

    // Create placeholder textures at runtime so the game is playable without external files
    this.createPlaceholderTextures();

    // Transition to StartScene
    this.scene.start('StartScene');
  }

  createLoadingUI() {
    const { width, height } = this.cameras.main;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading Feloria...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  /**
   * Generates simple placeholder textures for development using pixelArtGenerator.
   * This provides a massive visual upgrade over plain rectangles!
   */
  createPlaceholderTextures() {
    // ----------------------------------------------------------------
    // 1. TILESET (Empty, Grass, Dirt, Water, Wall, TallGrass, Tree)
    // ----------------------------------------------------------------
    const tEmpty = Array(16).fill('................');
    const tGrass = [
      'EEEEEEEEEEEEEEEE', 'EEGEEEEEEEEEEEEE', 'EEEEEEEGEEEEEEEE', 'EEEEEEEEEEEEEEEE',
      'EEEEEEEEEEEEGEEE', 'EGEEEEEEEEEEEEEE', 'EEEEEEEEEEEEEEEE', 'EEEEEEGEEEEEEEEE',
      'EEEEEEEEEEEEEEEE', 'EEEEEEEEEEEGEEEE', 'EEGEEEEEEEEEEEEE', 'EEEEEEEEEEEEEEEE',
      'EEEEEEEGEEEEEEEE', 'EEEEEEEEEEEEEEEE', 'EEEEEEEEEEEEGEEE', 'EEEEEEEEEEEEEEEE'
    ];
    const tDirt = [
      'vvvvvvvvvvvvvvvv', 'vvWvvvvvvvvvvvvv', 'vvvvvvvwvvvvvvvv', 'vvvvvvvvvvvvWvvv',
      'vvvvwvvvvvvvvvvv', 'vvvvvvvvvvWvvvvv', 'vvvvvvvvwvvvvvvv', 'vvWvvvvvvvvvvvvv',
      'vvvvvvvvvvvvvvvv', 'vvvvvWvvvvvvvvwv', 'vvvvvvvvvvvvvvvv', 'vvwvvvvvvWvvvvvv',
      'vvvvvvvvvvvvvvvv', 'vvWvvvvvvvvvvwvv', 'vvvvvvvvvvvvvvvv', 'vvvvvvvvwvvvvvvv'
    ];
    const tWater = [
      'bbbbbbbbbbbbbbbb', 'bbbbbsbbbbbbbbbb', 'bbbbbbbbbbbbbbbs', 'bbbbbbbbbbbbbbbb',
      'bbsbbbbbbbbbbbbb', 'bbbbbbbbbsbbbbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbsbbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbsbbbbbbbbbb', 'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbs', 'bbsbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbsbbbbbb'
    ];
    const tWall = [
      '2222222222222222', '3333333133333331', '3333333133333331', '3333333133333331',
      '1111111111111111', '3331333333313333', '3331333333313333', '3331333333313333',
      '1111111111111111', '3333333133333331', '3333333133333331', '3333333133333331',
      '1111111111111111', '3331333333313333', '3331333333313333', '3331333333313333'
    ];
    const tTallGrass = [
      'EEEEEEEEEEEEEEEE', 'EEEGGGEEEEEGGGEE', 'EEGGgGGEEEEGGgGE', 'EGgGGGEEEEEGGgGE',
      'GGGGGGGEEEGGGGGG', 'GgGGgGGEEEGgGGgG', 'GGGGGGGGEEGGGGGG', 'EEGGGGGEEEEGGGGG',
      'EGGgGGEEEEEGGgGE', 'GGGGGGGEEEGGGGGG', 'GgGGgGGEEEGgGGgG', 'GGGGGGGGEEGGGGGG',
      'EEEGGGEEEEEGGGEE', 'EEGGGGGEEEEGGGGG', 'EGGgGGEEEEEGGgGE', 'EEEEEEEEEEEEEEEE'
    ];
    const tTree = [
      '......GGGG......', '....GGGGGGGG....', '...GGGGGGGGGG...', '..GGGGGGGGGGGG..',
      '..GGGGGGGGGGGG..', '.GGGGGGGGGGGGGG.', '.GGGGGGGGGGGGGG.', '.GGGGGGGGGGGGGG.',
      '.GGGGGGGGGGGGGG.', '..GGGGGGGGGGGG..', '...GGGGGGGGGG...', '.....wwwwww.....',
      '.....wWwwWw.....', '.....wwWwww.....', '.....wwwwww.....', '......wwww......'
    ];

    pixelArtGenerator.createTileset(this, 'overworld-tiles', [tEmpty, tGrass, tDirt, tWater, tWall, tTallGrass, tTree], 2);

    // ----------------------------------------------------------------
    // 2. PLAYER SPRITE (Human Explorer: Down, Up, Left, Right)
    // ----------------------------------------------------------------
    const pDown = [
      '.....HHHHHH.....', '....HHHHHHHH....', '....HHffffHH....', '....Hff00ffH....',
      '....HffffffH....', '.....ffffff.....', '....bbbbbbbb....', '...bbbbbbbbbb...',
      '...bbbbbbbbbb...', '...bbbbbbbbbb...', '....KKKKKKKK....', '....KKKKKKKK....',
      '....KK....KK....', '....KK....KK....', '....00....00....', '....00....00....'
    ];
    const pUp = [
      '.....HHHHHH.....', '....HHHHHHHH....', '....HHHHHHHH....', '....HHHHHHHH....',
      '....HHHHHHHH....', '.....HHHHHH.....', '....bbbbbbbb....', '...bbbbbbbbbb...',
      '...bbbbbbbbbb...', '...bbbbbbbbbb...', '....KKKKKKKK....', '....KKKKKKKK....',
      '....KK....KK....', '....KK....KK....', '....00....00....', '....00....00....'
    ];
    const pLeft = [
      '.....HHHHH......', '....HHHHHHH.....', '....HffffHH.....', '....Hff0fHH.....',
      '....HffffHH.....', '.....fffff......', '....bbbbbbb.....', '...bbbbbbbbb....',
      '...bbbbbbbbb....', '...bbbbbbbbb....', '....KKKKKKK.....', '....KKKKKKK.....',
      '....KK...KK.....', '....KK...KK.....', '....00...00.....', '....00...00.....'
    ];
    const pRight = [
      '......HHHHH.....', '.....HHHHHHH....', '.....HHffffH....', '.....HHf0ffH....',
      '.....HHffffH....', '......fffff.....', '.....bbbbbbb....', '....bbbbbbbbb...',
      '....bbbbbbbbb...', '....bbbbbbbbb...', '.....KKKKKKK....', '.....KKKKKKK....',
      '.....KK...KK....', '.....KK...KK....', '.....00...00....', '.....00...00....'
    ];
    pixelArtGenerator.createSpritesheet(this, 'player', [pDown, pUp, pLeft, pRight], 16, 16, 2);

    // ----------------------------------------------------------------
    // 3. NPC SPRITES (Human Villagers)
    // ----------------------------------------------------------------
    // Elder Mira (Gray Hair, Purple Robe)
    const miraFrame = [
      '.....444444.....', '....44444444....', '....44ffff44....', '....44f00f44....',
      '....44ffff44....', '.....ffffff.....', '....UUUUUUUU....', '...UUUUUUUUUU...',
      '...UUUUUUUUUU...', '...UUUUUUUUUU...', '...UUUUUUUUUU...', '...UUUUUUUUUU...',
      '...UUUUUUUUUU...', '...UUUUUUUUUU...', '....00....00....', '....00....00....'
    ];
    pixelArtGenerator.createTexture(this, 'npc_mira', miraFrame, 2);

    // Common NPC / Shopkeeper (Brown Hair, Green Shirt)
    const npcFrame = [
      '.....HHHHHH.....', '....HHHHHHHH....', '....HHffffHH....', '....Hff00ffH....',
      '....HffffffH....', '.....ffffff.....', '....GGGGGGGG....', '...GGGGGGGGGG...',
      '...GGGGGGGGGG...', '...GGGGGGGGGG...', '....KKKKKKKK....', '....KKKKKKKK....',
      '....KK....KK....', '....KK....KK....', '....00....00....', '....00....00....'
    ];
    pixelArtGenerator.createTexture(this, 'npc', npcFrame, 2);

    // Trainer NPC (Red Cap, Red Vest)
    const trainerFrame = [
      '.....RRRRRR.....', '....RRRRRRRR....', '....RRffffRR....', '....Rf00ffRH....',
      '....RffffffH....', '.....ffffff.....', '....rrrrrrrr....', '...rrrrrrrrrr...',
      '...rrrr00rrrr...', '...rrrr00rrrr...', '....KKKKKKKK....', '....KKKKKKKK....',
      '....KK....KK....', '....KK....KK....', '....00....00....', '....00....00....'
    ];
    pixelArtGenerator.createTexture(this, 'npc_trainer', trainerFrame, 2);

    // ----------------------------------------------------------------
    // 4. CREATURE SPRITES
    // ----------------------------------------------------------------
    // Map existing types to basic letters for the generator palette
    const typeLetters = {
      'Forest': 'G', 'Grass': 'g', 'Fire': 'R', 'Water': 'B', 'Rock': '2',
      'Shadow': '1', 'Ice': 's', 'Storm': 'Y', 'Spirit': 'D', 'Mystic': 'B',
      'Ice/Mystic': 'c', 'Fire/Storm': 'p', 'Forest/Spirit': 'l', 'Spirit/Shadow': '1'
    };

    Object.keys(CREATURES).forEach(key => {
        const cat = CREATURES[key];
        const clr = typeLetters[cat.type] || '4'; // Default to white
        
        // Dynamically build a detailed frame using the mapped color character
        const cFrame = [
          `....${clr}......${clr}....`, `...${clr}${clr}${clr}....${clr}${clr}${clr}...`,
          `...${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}...`, `..${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}..`,
          `..${clr}${clr}${clr}44${clr}${clr}44${clr}${clr}${clr}..`, `..${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}..`,
          `..${clr}${clr}${clr}${clr}1111${clr}${clr}${clr}${clr}..`, `...${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}...`,
          `....${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}....`, `...${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}...`,
          `..${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}..`, `..${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}${clr}..`,
          `..${clr}${clr}...${clr}${clr}...${clr}${clr}..`, `..${clr}${clr}...${clr}${clr}...${clr}${clr}..`,
          `..${clr}${clr}...${clr}${clr}...${clr}${clr}..`, `...........${clr}${clr}${clr}..`
        ];
        
        // We use pixelSize 4 for creatures so they are 64x64 on screen natively before scaling
        pixelArtGenerator.createTexture(this, key.toLowerCase(), cFrame, 4);
    });

    const uiFrameGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    uiFrameGraphics.fillStyle(0x000000, 0.9).fillRect(0, 0, 64, 64);
    uiFrameGraphics.lineStyle(2, 0xffffff, 1).strokeRect(0, 0, 64, 64);
    uiFrameGraphics.generateTexture('ui-frame', 64, 64);
  }


}
