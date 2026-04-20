# data/

Static game data — creatures, skills, items, NPCs, encounters, trainers.

## Conventions
- All data exported as plain JS arrays or objects (no classes)
- `creatures.js` — master list; each entry has `id`, `name`, `types`, `baseStats`, `learnset`, `evolvesTo`
- `skills.js` — skill definitions with `power`, `accuracy`, `type`, `category` (physical/special/status)
- `typeChart.js` — 2D effectiveness multiplier table; source of truth for type matchups
- `items.js` — item definitions with `effect` function refs or string keys
- `encounters.js` — per-area encounter tables referencing creature IDs
- `trainers.js` — trainer definitions with party compositions
- `npcs.js` — NPC dialogue and behavior data
- Cutscene/title background images are in `public/assets/images/startscene/` (registered in `ASSETS.CUTSCENE_IMAGES`)

## Adding New Creatures
1. Add entry to `creatures.js` with unique numeric `id`
2. Add encounter table entries in `encounters.js` if wild-catchable
3. Add evolution entry if applicable
4. Codex auto-populates from `creatures.js`
