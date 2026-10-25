# Phaser Dungeon Crawler

## What is it?
An old-school turn-based dungeon crawler built in JavaScript with Phaser 4.2.1. All graphics are drawn with Phaser's geometry shapes, with no sprites or external assets. My first complete JavaScript project, written by hand with Socratic coaching from Claude (hints and questions, not code).

Status: Complete (July 2026). Wrapped up to move on to other projects.

[Play it here](https://eric-t-carroll.github.io/phaser-rpg/)

---

## How do I run the game?
1. Install [Node.js](https://nodejs.org/) if you don't already have it.
2. Run `git clone https://github.com/eric-t-carroll/phaser-rpg.git` in the folder where you want the project files.
3. Run `cd phaser-rpg`, then `npm install` to install dependencies.
4. Run `npm run dev` to start the Vite dev server.
5. Open a browser and navigate to http://localhost:5173/.

---

## How do I play?
- Use the arrow keys to move.
- Move into enemy aggro circles to engage.
- Move into enemies to damage them.
- Kill all enemies to win.

---

## Features
- Turn-based combat
- Aggro range with animated detection
- Shapes shrink based on health values, with a minimum floor so the shape never gets hard to see
- Two enemy types: melee Barbarian (red squares) & spellcaster Wizard (blue diamonds)
- Wizard spell animation
- Render-depth layering, so aggro rings, entities and spell effects always draw in the correct order.
- Win and lose states

---

## Ideas for later versions
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
- NPCs patrol.
- When not in combat - should the player move more freely, or potentially even just with a smaller pause delay (design decision to be confirmed)
- Entity cell highlight briefly flashes to white when the entity takes damage.
- Improve orb animation polish pass (fade in, pulse, choose best color)
- Highlight Wizard cast range with a circle

---

## What I learned
- Some bugs started to appear because I altered a function without properly checking everywhere it is called.
- I got a lot of good debugging experience using dev tools and variable logging.
- In hindsight, I probably could have made better use of async/await instead of creating the complex turn-based flag/queue system.

---

## Bugs fixed
- **NPC movement never visibly progressed.** `moveToward` was only called
  once per turn instead of every frame, so NPCs crept forward by a
  fraction of a pixel per turn instead of actually gliding to their
  target tile.
- **`attackPhase` never reset after a melee lunge completed.** Left the
  lunge-return logic running indefinitely in the background after the
  first kill, causing unrelated movement to occasionally "snap" toward the wrong position.
- **Player could have their turn before NPCs finished their turns.** 
  After adding `this.time.delayedCall` it opened up a window where checks 
  ensuring nobody was moving or attacking could be passed. NPCs were not 
  attacking or moving during the pause, allowing the player to take another 
  move. Fixed by adding a player turn flag to ensure player could not take 
  their turn while NPCs were taking theirs.
- **Aggro highlights did not render where they already previously were.** Caused
  by code that destroyed the highlight shape, but didn't destroy the highlight array.
  When checking if a highlight already existed, it was present even though it wasn't 
  being rendered. Fixed by redeclaring the highlight array every move, just before it 
  gets recreated.
- **Stack overflow in the sequential NPC turn system.** `advanceNpcTurn`
  incremented its turn index *after* calling `processNpcTurn`, so any
  recursive call (from a non-adjacent or spell-casting NPC) reprocessed
  the same NPC endlessly. Fixed by capturing and incrementing the index
  *before* the recursive call.
- **Player accidentally processed by NPC-only movement logic.** A missing
  `type === "npc"` check let the player's own movement get picked up by 
  the generic NPC movement loop.