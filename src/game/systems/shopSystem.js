import { ITEMS } from "../data/items.js";

export const shopSystem = {
  getShopInventory: () => {
    return [ITEMS.potion, ITEMS.capture_crystal];
  },

  /**
   * Attempts to buy an item.
   * Returns { success: boolean, message: string }
   */
  buyItem: (scene, itemId, quantity = 1) => {
    const registry = scene.registry;
    const item = Object.values(ITEMS).find((i) => i.id === itemId);
    if (!item) return { success: false, message: "아이템을 찾을 수 없습니다." };

    const cost = item.price * quantity;
    let currentGold = registry.get("playerGold") || 0;

    if (currentGold < cost) {
      return { success: false, message: "골드가 부족합니다." };
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

    // Emit notification to UIScene via WorldScene's events if available 
    // or directly if UIScene is what we want.
    // Usually these notifications are handled by the main game scene's emitter.
    const worldScene = scene.scene.get('WorldScene');
    if (worldScene) {
      worldScene.events.emit('notifyItem', { 
        message: `${item.name} x${quantity} 획득!`,
        color: 0x27ae60 
      });

      // Play Item Get ME
      import('./audioManager.js').then(module => {
        module.audioManager.playME('me_item_get', { duckBGM: true });
      });
    }

    return { success: true, message: `${item.name}을(를) 구매했습니다!` };
  },
};
