# config/

Game configuration and asset path registry.

## Conventions
- `gameConfig.js` — Phaser game config (renderer, physics, scene list, scale)
- `assetPaths.js` — all asset paths as named constants; import here, never hardcode paths
- `animationConfig.js` — Phaser animation key definitions
- `skillAnimationMapping.js` — maps skill IDs to animation keys

## Rules
- Add new assets to `assetPaths.js` before referencing them in scenes/systems
- Animation keys must be registered in `animationConfig.js` before use
- Skill visual effects must have an entry in `skillAnimationMapping.js`
