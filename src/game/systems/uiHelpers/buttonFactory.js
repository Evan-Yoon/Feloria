/**
 * buttonFactory
 * Creates reusable rounded-rect Graphics buttons for Phaser scenes.
 * Returned objects can be added to a scene or container directly.
 *
 * Usage:
 *   const { graphics, label, hitArea } = buttonFactory.create(scene, x, y, text, width, height, { ... });
 *   container.add([graphics, label, hitArea]);
 */
export const buttonFactory = {

  /**
   * Creates a rounded-rect button with hover state.
   *
   * @param {Phaser.Scene} scene
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {string} text - Button label
   * @param {number} width
   * @param {number} height
   * @param {object} options
   * @param {Function} options.onClick
   * @param {number}   [options.baseColor=0x2c3e50]
   * @param {number}   [options.hoverColor=0x34495e]
   * @param {number}   [options.borderColor=0xecf0f1]
   * @param {number}   [options.radius=12]
   * @param {string}   [options.fontSize="22px"]
   * @param {string}   [options.textColor="#ffffff"]
   * @param {string}   [options.hoverTextColor="#f1c40f"]
   * @returns {{ graphics: Phaser.GameObjects.Graphics, label: Phaser.GameObjects.Text, hitArea: Phaser.GameObjects.Rectangle }}
   */
  create(scene, x, y, text, width, height, options = {}) {
    const {
      onClick,
      baseColor = 0x2c3e50,
      hoverColor = 0x34495e,
      borderColor = 0xecf0f1,
      radius = 12,
      fontSize = "22px",
      textColor = "#ffffff",
      hoverTextColor = "#f1c40f",
    } = options;

    const lx = x - width / 2;
    const ly = y - height / 2;

    const graphics = scene.add.graphics();
    buttonFactory._drawButton(graphics, lx, ly, width, height, radius, baseColor, 0.7, borderColor, 0.8);

    const label = scene.add.text(x, y, text, {
      font: `bold ${fontSize} Arial`,
      fill: textColor,
    }).setOrigin(0.5);

    const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on("pointerdown", onClick);
    hitArea.on("pointerover", () => {
      graphics.clear();
      buttonFactory._drawButton(graphics, lx, ly, width, height, radius, hoverColor, 0.9, 0xffffff, 1.0);
      label.setStyle({ fill: hoverTextColor });
    });
    hitArea.on("pointerout", () => {
      graphics.clear();
      buttonFactory._drawButton(graphics, lx, ly, width, height, radius, baseColor, 0.7, borderColor, 0.8);
      label.setStyle({ fill: textColor });
    });

    return { graphics, label, hitArea };
  },

  /** @private */
  _drawButton(g, lx, ly, w, h, r, fillColor, fillAlpha, strokeColor, strokeAlpha) {
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(lx, ly, w, h, r);
    g.lineStyle(2, strokeColor, strokeAlpha);
    g.strokeRoundedRect(lx, ly, w, h, r);
  },
};
