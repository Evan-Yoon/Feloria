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
   * Creates one tilemap with multiple layers and processes spawns/warps.
   * Returns an object containing the map, layers, and spawn data.
   */
  createMap: (scene, mapId) => {
    const mapData = scene.cache.json.get(`${mapId}-data`);
    if (!mapData) {
      console.error(`Map data not found for: ${mapId}`);
      return null;
    }

    // 1. Create the base Tilemap
    const map = scene.make.tilemap({
      tileWidth: mapData.tilewidth,
      tileHeight: mapData.tileheight,
      width: mapData.width,
      height: mapData.height
    });

    // 2. Add the tileset image (generated in PreloadScene)
    const tileset = map.addTilesetImage('overworld-tiles', 'overworld-tiles', 32, 32, 0, 0);

    // 3. Create all Layers from JSON data
    const layers = {};

    mapData.layers.forEach((layerData, index) => {
      const layerName = layerData.name;
      // createBlankLayer(name, tileset, x, y, width, height)
      const layer = map.createBlankLayer(layerName, tileset);

      // Populate layer with tile data
      if (layerData.data && layerData.data.length > 0) {
        for (let y = 0; y < mapData.height; y++) {
          for (let x = 0; x < mapData.width; x++) {
            const tileIndex = layerData.data[y * mapData.width + x];
            // In Phaser, 0 often means empty in a CSV/Array map, 
            // but we'll only put a tile if tileIndex > 0
            if (tileIndex > 0) {
              map.putTileAt(tileIndex, x, y, false, layer);
            }
          }
        }
      }

      // Visibility rules
      if (layerName === 'collisionLayer' || layerName === 'encounterLayer') {
        layer.setVisible(false);
      } else {
        layer.setVisible(true);
      }

      // Set depth based on order
      layer.setDepth(index);

      layers[layerName] = layer;
    });

    return {
      map,
      layers,
      name: mapData.name || mapId,
      spawns: mapData.spawns || [],
      warps: mapData.warps || [],
      widthInPixels: mapData.width * mapData.tilewidth,
      heightInPixels: mapData.height * mapData.tileheight
    };
  }
};
