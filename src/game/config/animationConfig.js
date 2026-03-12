/**
 * Configuration for skill animations.
 * Maps animation keys to their playback and positioning data.
 */
export const animationConfig = {
  // --- ATTACK ---
  Attack1: { frameWidth: 192, frameHeight: 192, frameCount: 3, frameRate: 12, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack3: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack4: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack5: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack6: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack7: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack8: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack9: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack10: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack11: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Attack12: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- BLOW ---
  Blow1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.85, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Blow2: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.0, originX: 0.5, originY: 1.0, offsetX: 0, offsetY: 0, anchorType: "feet" },
  Blow3: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.85, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- DARKNESS ---
  Darkness1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Darkness2: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.0, originX: 0.5, originY: 0.6, offsetX: 0, offsetY: 0, anchorType: "center" },
  Darkness3: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "screen center" },

  // --- DEATH ---
  Death1: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- EARTH ---
  Earth1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 14, scale: 0.9, originX: 0.5, originY: 0.9, offsetX: 0, offsetY: 0, anchorType: "feet" },
  Earth2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 14, scale: 0.9, originX: 0.5, originY: 0.9, offsetX: 0, offsetY: 0, anchorType: "feet" },
  Earth3: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 16, scale: 1.1, originX: 0.5, originY: 0.9, offsetX: 0, offsetY: 0, anchorType: "feet" },

  // --- FIRE ---
  Fire1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 16, scale: 0.8, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 20, anchorType: "feet" },
  Fire2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 16, scale: 0.8, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 20, anchorType: "feet" },
  Fire3: { frameWidth: 192, frameHeight: 192, frameCount: 25, frameRate: 18, scale: 0.9, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 20, anchorType: "feet" },
  Fire4: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.0, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 20, anchorType: "feet" },

  // --- GUN ---
  Gun1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 24, scale: 0.7, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Gun2: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 24, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- HEAL ---
  Heal1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Heal2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Heal3: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Heal4: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Heal5: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Heal6: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.1, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- ICE ---
  Ice1: { frameWidth: 192, frameHeight: 192, frameCount: 4, frameRate: 12, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Ice2: { frameWidth: 192, frameHeight: 192, frameCount: 4, frameRate: 12, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Ice3: { frameWidth: 192, frameHeight: 192, frameCount: 4, frameRate: 12, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Ice4: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.9, offsetX: 0, offsetY: 0, anchorType: "feet" },
  Ice5: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 16, scale: 1.1, originX: 0.5, originY: 0.9, offsetX: 0, offsetY: 0, anchorType: "feet" },

  // --- LIGHT ---
  Light1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Light2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Light3: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Light4: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Light5: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Light6: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Light7: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "screen center" },

  // --- METEOR ---
  Meteor: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 18, scale: 1.5, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: -100, anchorType: "screen center" },

  // --- SPEAR ---
  Spear1: { frameWidth: 192, frameHeight: 192, frameCount: 3, frameRate: 15, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Spear2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 18, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Spear3: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- SPECIAL ---
  Special1: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special2: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special3: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special4: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special5: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special6: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special7: { frameWidth: 192, frameHeight: 192, frameCount: 3, frameRate: 12, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special8: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special9: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 15, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special10: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 18, scale: 1.5, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "screen center" },
  Special11: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special12: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special13: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special14: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special15: { frameWidth: 192, frameHeight: 192, frameCount: 25, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special16: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Special17: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.5, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "screen center" },

  // --- STATE ---
  State1: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  State2: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  State3: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  State4: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  State5: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  State6: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- SWORD ---
  Sword1: { frameWidth: 192, frameHeight: 192, frameCount: 3, frameRate: 15, scale: 0.7, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword2: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 18, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword3: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 18, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword4: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 18, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword5: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword6: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 18, scale: 0.9, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword7: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.1, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword8: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.1, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword9: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 18, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Sword10: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 22, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- THUNDER ---
  Thunder1: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 18, scale: 0.85, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Thunder2: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 18, scale: 0.85, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Thunder3: { frameWidth: 192, frameHeight: 192, frameCount: 10, frameRate: 18, scale: 0.85, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Thunder4: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 20, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },

  // --- WATER ---
  Water1: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 15, scale: 0.9, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 0, anchorType: "center" },
  Water2: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 16, scale: 1.0, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 0, anchorType: "feet" },
  Water3: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 18, scale: 1.2, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 0, anchorType: "feet" },

  // --- WIND ---
  Wind1: { frameWidth: 192, frameHeight: 192, frameCount: 15, frameRate: 16, scale: 0.8, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Wind2: { frameWidth: 192, frameHeight: 192, frameCount: 20, frameRate: 18, scale: 1.0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" },
  Wind3: { frameWidth: 192, frameHeight: 192, frameCount: 30, frameRate: 20, scale: 1.2, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, anchorType: "center" }
};
