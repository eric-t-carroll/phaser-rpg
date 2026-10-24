# Phaser-RPG

## What is it?
An old-school turn based dungeon crawler built in JavaScript with the Phaser 4.2.1 dependencies/API. All graphics are drawn with Phaser's geometry shapes, with no sprites or external assets. My first complete JavaScript project, written by hand with Socratic coaching from Claude (hints and questions, not code).

Status: Complete (July 2026). Wrapped up to move on to other projects.

---

### How do I run the game?
1. Install [Node.js](https://nodejs.org/) if you don't already have it.
2. Pull a local copy of this repo to your PC.
3. Open a terminal in that folder and run `npm install` to install dependencies.
4. Run `npm run dev` to start the Vite dev server.
5. Open a browser and navigate to http://localhost:5173/.

---

### How do I play?
- Use the arrow keys to move.
- Move into enemy aggro circles to engage.
- Move into enemies to damage them.
- Kill all enemies to win.

---

### Features
- Turn based combat
- Aggro range with animated detection
- Two enemy types: melee Barbarian (red squares) & spellcaster Wizard (blue diamonds)
- Wizard spell animation
- Win and lose states

---

### Ideas for later versions
- Aggro line-of-sight (NPCs should only engage if they can see the player - not through walls).
- When aggro'ed, NPCs shout to warn other NPCs within close range. Multiple grouped NPCs aggro at the same time.
- Add NPC shout to combat log.
- Opportunity attacks (free hit if you flee an adjacent melee NPC).
- Designed maps with actual rooms, not just an open bordered area.
- Combat log color-coding by attack type/outcome.
- AoE attacks.
- Weapons/gear affecting damage.
- Leveling and XP.
- Camera follow for maps larger than the screen (plus scouting/pan-to-NPC extensions).
- Fog of war.
- Save/load.
- Multiple maps or levels.
- NPCs patrol
- when not in combat - should the player move more freely, or potentially even just with a smaller pause delay (design decision to be confirmed)
- Entity cell highlight briefly flashes to white when the entity takes damage.
- Improve orb animation polish pass (fade in, pulse, choose best color)
- Highlight Wizard cast range with a circle