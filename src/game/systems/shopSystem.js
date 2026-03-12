import { ITEMS } from "../data/items.js";

export const shopSystem = {
  getShopInventory: () => {
    return [ITEMS.potion, ITEMS.capture_crystal];
  },

  /**
   * Attempts to buy an item.
   * Returns { success: boolean, message: string }
   */
  buyItem: (registry, itemId, quantity = 1) => {
    const item = Object.values(ITEMS).find((i) => i.id === itemId);
    if (!item) return { success: false, message: "Item not found." };

    const cost = item.price * quantity;
    let currentGold = registry.get("playerGold") || 0;

    if (currentGold < cost) {
      return { success: false, message: "Not enough gold." };
    }

    // Deduct gold
    registry.set("playerGold", currentGold - cost);

    // Add to inventory directly
    const inventory = registry.get("playerInventory") || {};
    if (!inventory[itemId]) {
      inventory[itemId] = 0;
    }
    inventory[itemId] += quantity;
    registry.set("playerInventory", inventory);

    // Emit notification to UIScene
    const scene = registry.systems.scene.getScene('WorldScene');
    if (scene) {
      scene.events.emit('notifyItem', { 
        message: `${item.name} x${quantity} 획득!`,
        color: 0x27ae60 
      });

      // Play Item Get ME
      import('./audioManager.js').then(module => {
        module.audioManager.playME('me_item_get', { duckBGM: true });
      });
    }

    return { success: true, message: `Bought ${quantity}x ${item.name}!` };
  },
};
