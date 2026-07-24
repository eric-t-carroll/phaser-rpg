# Phaser-RPG

## What is it?
Creating a turn based dungeon crawler in Phaser, with an old school flavour and basic geometry for graphics. First go at creating something in Javascript.

## How do I run the game?
1. Install [Node.js](https://nodejs.org/) if you don't already have it.
2. Pull a local copy of this repo to your PC.
3. Open the project folder in VS Code.
4. Open a terminal in that folder and run `npm install` to install dependencies.
5. Run `npm run dev` to start the Vite dev server.
6. Open a browser and navigate to http://localhost:5173/.

## Features Built So Far
- Grid-based movement with smooth tile-to-tile animation.
- Wall collision and map boundaries.
- Class-based Phaser scene architecture (`DungeonScene`, `GameOverScene`).
- Unified entity system (player + NPCs share a common data structure).
- Multiple NPC types (melee Barbarian, spellcaster Wizard) with distinct shapes.
- Melee lunge-and-retreat attack animation, shared between player and NPCs.
- Damage system with randomized ranges and critical hits.
- Health-based visual shrinking for all entities.
- Sequential turn-based combat (player acts, then each NPC acts in order).
- NPC AI: chase the player when not adjacent, attack when in range.
- Combat log (styled as a retro terminal readout).
- Death handling with a dedicated Game Over scene and restart flow.

## Planned / In Progress
- Turn pacing (delays between actions for readability).
- Aggro range and line-of-sight (NPCs should only engage if they can see/reach the player).
- Opportunity attacks (free hit if you flee an adjacent melee NPC).
- Designed maps with actual rooms, not just an open bordered area.
- Combat log color-coding by attack type/outcome.
- AoE attacks.
- Weapons/gear affecting damage.
- Leveling and XP.
- Camera follow for maps larger than the screen (plus scouting/pan-to-NPC extensions).
- Fog of war.
- Title screen / main menu.
- Save/load.
- Multiple maps or levels.

## Explicitly Decided Against (for now)
- Diagonal movement — sticking with 4-directional to preserve the tactical, old-school feel.

## Longer-Term / Stretch Goals
- Telegraphed enemy abilities and interrupts (WoW Classic-inspired tactical combat).