/**
 * mapLoader.js - Responsible for loading and parsing JSON map data.
 * Converts our custom JSON format into Phaser Tilemaps and layers.
 */
export const mapLoader = {
  /**
   * Loads the map JSON and assets needed.
   * Note: Assets should ideally be preloaded in PreloadScene.
   */
  preloadMap: (scene, mapId) => {
    scene.load.json(`${mapId}-data`, `/src/game/data/maps/${mapId}.json`);
  },

  /**
   * Creates the tilemap, layers, and processes spawns/warps.
   * Returns an object containing the map, layers, and spawn data.
   */
  createMap: (scene, mapId) => {
    const mapData = scene.cache.json.get(`${mapId}-data`);
    if (!mapData) {
      console.error(`Map data not found for: ${mapId}`);
      return null;
    }

    // Create the Tilemap
    const map = scene.make.tilemap({
      data: mapData.layers.find(l => l.name === 'groundLayer').data,
      tileWidth: mapData.tilewidth,
      tileHeight: mapData.tileheight,
      width: mapData.width,
      height: mapData.height
    });

    // Add the tileset image (generated in PreloadScene)
    const tileset = map.addTilesetImage('overworld-tiles', 'overworld-tiles', 32, 32, 0, 0);

    // Create Layers
    const layers = {};
    
    // 1. Ground Layer
    layers.ground = map.createLayer(0, tileset, 0, 0);

    // 2. Additional Layers (if they exist in the JSON)
    mapData.layers.forEach(layerData => {
      if (layerData.name === 'groundLayer') return; // Already handled

      // Create a temporary tilemap for this layer data
      const tempMap = scene.make.tilemap({
        data: layerData.data,
        tileWidth: mapData.tilewidth,
        tileHeight: mapData.tileheight,
        width: mapData.width,
        height: mapData.height
      });
      
      const layer = tempMap.createLayer(0, tileset, 0, 0);
      
      if (layerData.name === 'collisionLayer' || layerData.name === 'encounterLayer') {
          layer.setVisible(false); // Hierarchy requirements: do not render collision/encounter visually
      }
      
      layers[layerData.name] = layer;
    });

    return {
      map,
      layers,
      spawns: mapData.spawns || [],
      warps: mapData.warps || [],
      widthInPixels: mapData.width * mapData.tilewidth,
      heightInPixels: mapData.height * mapData.tileheight
    };
  }
};
