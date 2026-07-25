# Phaser-RPG

## What is it?
Creating a turn based dungeon crawler in Phaser, with an old school flavour and basic geometry for graphics. First go at creating something in Javascript.

### How do I run the game?
1. Install [Node.js](https://nodejs.org/) if you don't already have it.
2. Pull a local copy of this repo to your PC.
3. Open the project folder in VS Code.
4. Open a terminal in that folder and run `npm install` to install dependencies.
5. Run `npm run dev` to start the Vite dev server.
6. Open a browser and navigate to http://localhost:5173/.

-------

## Features

### Built So Far
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

### Planned / In Progress
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

### Longer-Term / Stretch Goals
- Telegraphed enemy abilities and interrupts (WoW Classic-inspired tactical combat).

### Explicitly Decided Against (for now)
- Diagonal movement — sticking with 4-directional to preserve the tactical, old-school feel.

-------

## Known Issues

### Outstanding
- **Lunge target doesn't scale with target size.** The melee lunge's attack
  destination (`attackDest`) is calculated once, at trigger time, based on
  the target's *original* size. As a target's shape shrinks from damage,
  the lunge animation can end up connecting with what looks like empty
  space rather than the shrunk target. Needs `attackDest` to be recalculated
  relative to the target's current size/health ratio.
- **NPC movement AI is intentionally simple.** NPCs try their preferred axis,
  then the other axis, then give up for that turn if both are blocked — no
  smarter pathing or fallback. Flagged for revisiting if it looks/feels bad
  in practice with more complex maps.

### Fixed
- **Plain-object Phaser scenes don't support custom methods.** Custom
  methods (like an early `startMove`) silently failed to attach when the
  scene was defined as a plain object rather than a class. Fixed by
  converting to `class DungeonScene extends Phaser.Scene`.
- **Direct `.height`/`.y` assignment on Shapes didn't reliably update
  rendering.** The player health-bar shrink effect looked correct in
  logged values but rendered incorrectly. Fixed by using `.setSize()` /
  `.setPosition()` instead of direct property assignment.
- **Polygon (diamond NPC) origin/positioning quirk.** `add.polygon` didn't
  center reliably the way `add.rectangle`/`add.circle` do. Fixed with a
  `setDisplayOrigin` adjustment, keeping the shape's logical `x`/`y`
  separate from its visual offset.
- **Wall-generation loop accumulation bug.** An early version of
  `createWall` compounded its own position offset each iteration instead
  of calculating fresh from the original start point each time.
- **Infinite glide after a player-state refactor.** Moving `axis`/`direction`
  onto `this.player` accidentally dropped the per-cycle reset, leaving
  stale values that caused movement to continue indefinitely without a
  fresh keypress.
- **Stack overflow in the sequential NPC turn system.** `advanceNpcTurn`
  incremented its turn index *after* calling `processNpcTurn`, so any
  recursive call (from a non-adjacent or spell-casting NPC) reprocessed
  the same NPC endlessly. Fixed by capturing and incrementing the index
  *before* the recursive call.
- **NPC movement never visibly progressed.** `moveToward` was only called
  once per turn instead of every frame, so NPCs crept forward by a
  fraction of a pixel per turn instead of actually gliding to their
  target tile.
- **Player accidentally processed by NPC-only movement logic.** A missing
  `type === "npc"` guard let the player's own movement get picked up by
  the generic NPC movement loop, silently breaking the turn sequence
  (surfaced as `advanceNpcTurn` firing on the player's arrival instead of
  an NPC's).
- **`attackPhase` never reset after a melee lunge completed.** Left the
  lunge-return logic running indefinitely in the background after the
  first kill, causing unrelated movement to occasionally "snap" toward a
  stale attack-return position.
- **NPC axis selection used signed instead of absolute distance.** Picking
  which axis to move along compared raw (signed) distances rather than
  magnitude, so a large negative gap could lose out to a near-zero
  positive one, sending NPCs the wrong way.
