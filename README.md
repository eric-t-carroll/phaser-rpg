# Phaser-RPG

---

## What is it?
Creating a turn based dungeon crawler in Phaser, with an old school flavour and basic geometry for graphics. First go at creating something in Javascript.

### How do I run the game?
1. Install [Node.js](https://nodejs.org/) if you don't already have it.
2. Pull a local copy of this repo to your PC.
3. Open the project folder in VS Code.
4. Open a terminal in that folder and run `npm install` to install dependencies.
5. Run `npm run dev` to start the Vite dev server.
6. Open a browser and navigate to http://localhost:5173/.

---

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
- Turn pacing (delays between actions for readability).
- Cell highlighting — a translucent, entity-colored square with a bolder border renders behind each entity's shape, anchored to their grid cell. Keeps the occupied tile visible even when `healthShrink` has shrunk an entity's shape down near death. Stays in place during lunge attacks, since the lunge only animates the entity's own shape.
 - Aggro range (no line of sight).
 - Reduced/removed NPC turn pause when nothing is aggro'd, so exploring with several inactive NPCs on screen no longer feels sluggish.
 - Aggro-range indicator — reworked from an experimental grid-of-cells version into a single translucent ring per NPC (matches the NPC's own color), tracking smoothly with movement via `syncEntity`.
 - Aggro-trigger pulse — the first time an NPC transitions to aggro, its ring plays a brighten/dim pulse (via chained Phaser tweens) before fading out and being destroyed. Multiple NPCs aggro'ing from the same player move now pulse simultaneously (tracked via a shared counter), rather than staggered across the turn sequence.
 - Aggro trigger accounts for the player's shape size (not just its center point), so aggro fires when the player's square visibly touches the ring rather than only once the player's center crosses it.
 - Health-shrink now remaps between a floor (~10-20%) and ceiling (~85%) instead of the raw 0-100% range, so a shape is never fully invisible right before death, and never fills the entire cell at full health.
 - Explicit render-depth layering (`renderDepth`: map → aggro ring → entity highlight → entity shape → spell effects), replacing ad-hoc `sendToBack()` calls, so future visual layers (projectiles, cast-range indicators) have a clear place to slot in.
 - Internal cleanup: extracted `isAdjacent()`, `checkRadiusDistance()`, and `checkNpcAggro()` as small reusable functions; renamed `processNpcTurn` to `processNpcAttack` to reflect its narrowed purpose; renamed misleading `directionX`/`directionY` to `absDistanceX`/`absDistanceY`.

### Planned / In Progress
- Aggro line-of-sight (NPCs should only engage if they can see/reach the player).
- When aggro'ed, NPCs shout to warn other NPCs within close range. Multiple grouped NPCs aggro at the same time.
- Add NPC shout to combat log.
- Wizards approach until in spell range and then they cast fireballs
- Fireball animation and damage
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
- NPCs patrol
- when not in combat - should the player move more freely, or potentially even just with a smaller pause delay (design decision to be confirmed)


### Longer-Term / Stretch Goals
- Telegraphed enemy abilities and interrupts (WoW Classic-inspired tactical combat).

### Explicitly Decided Against (for now)
- Diagonal movement — sticking with 4-directional to preserve the tactical, old-school feel.

---

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
- When npcs aggro range is overlapping and one moves, the cells where it was do not 
render with a new highlight, if it is space where npc 1 no longer has aggro. This is
because aggro highlights for each npx are created at the end of every move. The blank
space needs to have highlights created for the npc that is not moving.

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
- **Move guard didn't account for NPC movement, causing turn overlap and
  player/NPC desync.** The player's movement guard only checked
  `!this.player.isMoving` plus an `areAttacking` check, with no equivalent
  check for NPCs mid-movement (`isMoving`). This let rapid keypresses
  interrupt an NPC's move or attack animation with a new player move,
  which could let the player and an NPC end up on the same tile, or leave
  an NPC's `shape` out of sync with its logical `location` (observed once
  with an NPC ending up inside a wall tile).
  Fixed by adding an `areMoving` check (`this.entities.some(...)`)
  alongside `areAttacking`, so a new turn can't start while *any* entity —
  player or NPC — is still mid-movement or mid-attack animation.
- **NPC shapes visually snapped to their destination instead of gliding.**
  `syncEntity()` for NPCs only ran inside `moveToward`'s `onArrive`
  callback, so an NPC's shape sat still for the entire glide and then
  jumped to its final position the instant movement finished — unlike the
  player, whose `syncEntity()` call ran every frame outside the callback.
  Pre-existing behavior, made more noticeable once turn pacing added a
  pause that gave the snap time to be visible.
  Fixed by moving the NPC `syncEntity()` call to run every frame (same
  position as the player's), while leaving `isMoving = false` and
  `advanceNpcTurn()` inside the callback so those still only fire once,
  on arrival.
- **Turn pause appeared to do nothing.** `this.globalPauseTime` was
  declared as `this.globalPauseTurn` (typo) in one spot, so
  `delayedCall` received `undefined` as its delay and fired
  immediately. Fixed by correcting the variable name to match.
 - **Player could have their turn before NPCs finished their turns.** 
 After adding `this.time.delayedCall` it opened up a window where checks 
 ensuring nobody was moving or attacking could be passed. NPCs were not 
 attacking or moving during the pause, allowing the player to take another 
 move. Fixed by adding a player turn flag to ensure player could not take 
 their turn while NPCs were taking theirs.
  - Feels like most bugs are coming up because I alter a function without 
  properly examining how they are called, to see how the new behaviour 
  would present.
 - **Aggro highlights did not render where they already previously were. Caused
 by code that destroyed the highlight shape, but didn't destroy the highlight array.
 When checking if a highlight already existed, it was present even though it wasn't 
 being rendered. Fixed by redeclaring the highlight array every move, just before it 
 gets recreated.
 - **Multiple NPCs aggro'ing on the same player move pulsed one at a time,
  staggered across the NPC turn sequence, instead of together.** Aggro was
  only ever checked one NPC at a time, inside `advanceNpcTurn`, so a second
  newly-aggro'd NPC's pulse didn't start until the first NPC's entire turn
  had finished. Fixed by moving aggro-detection for *all* NPCs into
  `startNpcTurn` (checked once, up front, right after the player's move
  completes), with a shared counter tracking how many pulses are in
  flight — the real NPC turn sequence only begins once the counter returns
  to zero, i.e. once every pulse has genuinely finished.