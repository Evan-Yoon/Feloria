/**
 * legendarySystem.js
 * Tracks the state of the 10 Legendary Cats after the Chapter 1 seal is broken.
 */

export const legendarySystem = {
    // List of all legendary IDs
    LEGENDARIES: [
        'SOLARION', 'GLACIARA', 'TEMPESTCLAW', 'VERDANTLYNX', 
        'UMBRAFANG', 'AQUARION', 'TERRACLAW', 'LUMINA', 
        'AETHERION', 'NOCTYRA'
    ],

    /**
     * Checks if a specific legendary should be spawned on a map.
     * @param {Phaser.Data.DataManager} registry 
     * @param {string} legendaryId 
     * @returns boolean
     */
    canSpawnLegendary(registry, legendaryId) {
        // Must have broken the seal
        if (!registry.get("chapter1_done")) return false;

        // Must not have already defeated/captured this legendary
        const cleared = registry.get("legendaries_cleared") || [];
        if (cleared.includes(legendaryId)) return false;

        return true;
    },

    /**
     * Marks a legendary as permanently cleared (defeated or captured).
     * @param {Phaser.Data.DataManager} registry 
     * @param {string} legendaryId 
     */
    markLegendaryCleared(registry, legendaryId) {
        let cleared = registry.get("legendaries_cleared") || [];
        if (!cleared.includes(legendaryId)) {
            cleared.push(legendaryId);
            registry.set("legendaries_cleared", cleared);
        }
    },

    /**
     * Applies map-wide effects (weather, tint) based on the Broken Seal state 
     * and the presence of any active legendaries.
     * @param {Phaser.Scene} scene 
     */
    applyWorldEffects(scene) {
        if (!scene.registry.get("chapter1_done")) return;

        // The seal is broken. The world is slightly darker or stormy everywhere
        // Depending on the map, we might add a global tint or particles.
        
        // For Mosslight or Ancient Forest, add a faint eerie glow or rain
        if (scene.mapId === 'mosslight_shrine' || scene.mapId === 'ancient_forest') {
            scene.cameras.main.setTint(0xcceeff); // Slightly cool, mystic tint
        }

        // Example: If Verdantlynx is alive in Ancient Forest, add floating leaves
        if (scene.mapId === 'ancient_forest' && this.canSpawnLegendary(scene.registry, 'VERDANTLYNX')) {
            this.createFallingLeaves(scene);
        }
    },

    /**
     * Particle effect for Verdantlynx's domain.
     * @param {Phaser.Scene} scene 
     */
    createFallingLeaves(scene) {
        const particles = scene.add.particles(0, 0, 'player', {
            x: { min: 0, max: scene.mapData.map.width * 32 },
            y: -20,
            lifespan: 10000,
            speedY: { min: 10, max: 30 },
            speedX: { min: -20, max: 20 },
            scale: { min: 0.1, max: 0.2 },
            alpha: { start: 0.6, end: 0 },
            quantity: 1,
            frequency: 300,
            tint: [0x2ecc71, 0x27ae60, 0x1abc9c]
        });
        particles.setDepth(20);
    }
};
