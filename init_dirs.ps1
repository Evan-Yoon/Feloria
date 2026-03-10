$dirs = @(
    "src/game/scenes",
    "src/game/systems",
    "src/game/data/maps",
    "src/game/data/cats",
    "src/game/data/skills",
    "src/game/data/items",
    "src/game/data/quests",
    "src/game/data/encounters",
    "src/game/data/dialogues",
    "src/game/data/codex",
    "src/game/config",
    "public/assets/tilesets",
    "public/assets/sprites/player",
    "public/assets/sprites/cats",
    "public/assets/sprites/npcs",
    "public/assets/ui/icons",
    "public/assets/ui/frames"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}
