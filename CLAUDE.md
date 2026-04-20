# Feloria

## Stack
- **Runtime:** Vite + Phaser 3 (JavaScript, ES modules)
- **Deploy:** Vercel (`vercel.json`)
- **Genre:** Monster-taming RPG (creature battles, quests, world exploration)

## Rules
- Pure vanilla JS — no TypeScript, no extra frameworks
- Phaser 3 scene lifecycle: `preload → create → update`
- All game data (creatures, skills, items, NPCs) lives in `src/game/data/`
- Asset paths defined in `src/game/config/assetPaths.js` — never hardcode paths inline
- Korean text utilities in `src/game/systems/koreanUtils.js` for any displayed strings
- Save/load via `src/game/systems/saveSystem.js` — never write to localStorage directly

## Agent Memory System

### Before Working
- Read this file for global context, then read the target directory's CLAUDE.md before changes
- If this file has a ## Context Routing section, use it to find the right subdirectory CLAUDE.md
- Check .memory/decisions.md before architectural changes
- Check .memory/patterns.md before implementing common functionality
- Check if audit is due: if 14+ days or 10+ sessions since last audit in .memory/audit-log.md, suggest running one

### During Work
- Create CLAUDE.md in any new directory you create

### After Work
- Update relevant CLAUDE.md if conventions changed
- Log decisions to .memory/decisions.md (ADR format)
- Log patterns to .memory/patterns.md
- Uncertain inferences → .memory/inbox.md (never canonical files)

### Safety
- Never record secrets, API keys, or user data
- Never overwrite decisions — mark as [superseded]
- Never promote from inbox without user confirmation

## Context Routing
→ scenes: src/game/scenes/CLAUDE.md
→ systems: src/game/systems/CLAUDE.md
→ data: src/game/data/CLAUDE.md
→ config: src/game/config/CLAUDE.md
