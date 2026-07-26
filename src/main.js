import Phaser from "phaser";

//create Dungeon Scene
class DungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: "DungeonScene" });
  }

  create() {
    //create Dungeon scene global variables
    this.gameOver = false;
    this.gridSize = 40;
    this.walls = [];
    this.entities = [];
    this.logRows = 3;
    this.logHeight = this.logRows * this.gridSize;
    this.gridLength = phaserRpg.width / this.gridSize;
    this.gridHeight = phaserRpg.height / this.gridSize - this.logRows;
    this.maxColumn = this.gridLength - 1;
    this.maxRow = this.gridHeight - 1;
    this.axisConfig = {
      x: { other: "y", max: this.maxColumn },
      y: { other: "x", max: this.maxRow },
    };
    this.globalMoveSpeed = 0.8;
    this.globalPauseTime = 400;
    this.combatLog = [];
    this.combatText = this.add.text(
      10,
      this.gridHeight * this.gridSize + 10,
      this.combatLog.join("\n"),
      {
        fontFamily: "Courier New",
        fontSize: "14px",
        color: "#00ff00",
      },
    );
    this.entityColors = {
      Player: 0x008000,
      Barbarian: 0xb53737,
      Wizard: 0x0000ff,
      aggroCells: 0x8000ff,
    };
    this.healthShrinkFloor = 0.20;
    this.healthShrinkCeiling = 0.84;
    this.isPlayerTurn = true;
    this.highlightAlpha = 0.25;
    this.highlightStrokeAlpha = 3;
    this.highlightLineWidth = 3;
    this.npcsTurn = [];
    this.npcTurnIndex = 0;
    this.countNpcsAggroed = 0;
    this.globalAggroCellDistance = 6 * this.gridSize;

    this.renderDepth = {
      map: 10,
      aggroCircle: 20,
      highlight: 30,
      entity: 40,
      spellEffect: 100,
    };

    //call create wall function to set walls around the border of the wap
    this.createWall(0, 0, "x", this.gridLength);
    this.createWall(0, 1, "y", this.gridHeight - 1);
    this.createWall(this.gridLength - 1, 1, "y", this.gridHeight - 1);
    this.createWall(1, this.gridHeight - 1, "x", this.gridLength - 2);

    //create lined grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333333);
    for (let x = 0; x <= phaserRpg.width; x += this.gridSize) {
      grid.lineBetween(x, 0, x, phaserRpg.height - this.logHeight);
    }
    for (
      let y = 0;
      y <= phaserRpg.height - this.logHeight;
      y += this.gridSize
    ) {
      grid.lineBetween(0, y, phaserRpg.width, y);
    }
    grid.setDepth(this.renderDepth.map);

    //define player start location
    const startLocation = { x: this.gridPosition(3), y: this.gridPosition(3) };

    //create player object and place on map
    this.player = {
      type: "player",
      name: "Player",
      location: startLocation,
      maxHealth: 300,
      currentHealth: 300,
      shape: this.add
        .rectangle(
          startLocation.x,
          startLocation.y,
          this.gridSize,
          this.gridSize,
          this.entityColors.Player,
        )
        .setDepth(this.renderDepth.entity),
      baseDamage: { melee: { min: 20, max: 30 }, spell: { min: 10, max: 20 } },
      critChance: 0.2,
      isAttacking: false,
      attackPhase: "idle",
      isMoving: false,
      axis: "",
      direction: 0,
      targetTile: 0,
    };

    this.createHighlight(this.player);

    this.entities.push(this.player);

    //create array for locations and call function to place Barbarians
    this.locationBarbarians = [
      { x: this.gridPosition(13), y: this.gridPosition(7) },
      { x: this.gridPosition(22), y: this.gridPosition(18) },
    ];
    for (let i = 0; i < this.locationBarbarians.length; i++) {
      this.createNpc(
        "Barbarian",
        this.locationBarbarians[i].x,
        this.locationBarbarians[i].y,
      );
    }
    //create array for locations and call function to place Wizards
    this.locationWizards = [
      { x: this.gridPosition(15), y: this.gridPosition(15) },
      { x: this.gridPosition(9), y: this.gridPosition(22) },
    ];
    for (let i = 0; i < this.locationWizards.length; i++) {
      this.createNpc(
        "Wizard",
        this.locationWizards[i].x,
        this.locationWizards[i].y,
      );
    }

    //set player movement controls and speed
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    //listen for gameOver flag and change to gameOverScene if true
    if (this.gameOver) {
      return;
    }

    //check player and npc are not moving or attacking
    const areAttacking = this.entities.some(
      (attack) => attack.isAttacking === true,
    );
    const areMoving = this.entities.some((move) => move.isMoving === true);
    if (!areMoving && !areAttacking && this.isPlayerTurn) {
      this.player.axis = "";
      this.player.direction = 0;

      //listen for key presses - set axis and direction
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.player.axis = "x";
        this.player.direction = -1;
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.player.axis = "x";
        this.player.direction = 1;
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        this.player.axis = "y";
        this.player.direction = -1;
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        this.player.axis = "y";
        this.player.direction = 1;
      }

      //if keypress has initiated movement
      if (this.player.axis !== "") {
        //declare the target tile the player is moving to
        this.player.targetTile =
          this.player.location[this.player.axis] +
          this.player.direction * this.gridSize;
        //set moving flag to true
        this.player.isMoving = true;

        //check if target tile is a wall tile or boundary. Set moving flag to false if wall tile.
        const hitsWall = this.walls.some(
          (wall) =>
            wall[this.player.axis] === this.player.targetTile &&
            wall[this.axisConfig[this.player.axis].other] ===
              this.player.location[this.axisConfig[this.player.axis].other],
        );
        const hitsBoundary =
          this.player.targetTile < this.gridPosition(0) ||
          this.player.targetTile >
            this.gridPosition(this.axisConfig[this.player.axis].max);
        //check if target tile is an enemy npc.
        this.player.attackTarget = this.entities.find(
          (npc) =>
            npc.type !== "player" &&
            npc.shape[this.player.axis] === this.player.targetTile &&
            npc.shape[this.axisConfig[this.player.axis].other] ===
              this.player.location[this.axisConfig[this.player.axis].other],
        );

        if (hitsWall || hitsBoundary || this.player.attackTarget) {
          this.player.isMoving = false;
        } else {
          this.player.isMoving = true;
        }

        if (this.player.attackTarget) {
          this.startMeleeLunge(this.player);
        }
      }
    }

    //if moving flag is true - start moving
    if (this.player.isMoving) {
      this.moveToward(
        this.player.location,
        this.player.targetTile,
        this.player.axis,
        this.player.direction,
        this.globalMoveSpeed,
        () => {
          this.player.isMoving = false;
          this.startNpcTurn();
        },
      );
      //sync player shape with location
      this.syncEntity(this.player);
    }

    // if attack phase is out - lunge forward
    if (this.player.attackPhase === "out") {
      this.moveToward(
        this.player.shape,
        this.player.attackDest[this.player.axis],
        this.player.axis,
        this.player.direction,
        0.3,
        () => {
          //calculate damage and set variable if npc died
          const died = this.damageCalc(
            "melee",
            this.player,
            this.player.attackTarget,
          );

          //if npc died destroy it from the array
          if (died) {
            this.player.attackTarget.shape.destroy();
            this.player.attackTarget.highlight.destroy();
            this.player.attackTarget.aggroCircle.destroy();
            this.entities = this.entities.filter(
              (npc) => npc !== this.player.attackTarget,
            );
          }

          //change attack phase to moving away from npc
          this.player.attackPhase = "in";
        },
      );
    }

    // if attack phase is in - move back
    if (this.player.attackPhase === "in") {
      this.moveToward(
        this.player.shape,
        this.player.attackReturn[this.player.axis],
        this.player.axis,
        this.player.direction * -1,
        0.5,
        () => {
          this.endMeleeLunge(this.player);
          this.startNpcTurn();
        },
      );
    }

    //sync entity size to currentHealth value
    this.entities.forEach((npc) => {
      this.healthShrink(npc.shape, npc.maxHealth, npc.currentHealth);
    });

    for (let i = 0; i < this.entities.length; i++) {
      //if entity isMoving, move
      if (this.entities[i].isMoving && this.entities[i].type === "npc") {
        this.moveToward(
          this.entities[i].location,
          this.entities[i].targetTile,
          this.entities[i].axis,
          this.entities[i].direction,
          this.globalMoveSpeed,
          () => {
            this.entities[i].isMoving = false;
            this.advanceNpcTurn();
          },
        );
        this.syncEntity(this.entities[i]);
      }

      // if attack phase is out - lunge forward
      if (
        this.entities[i].attackPhase === "out" &&
        this.entities[i].type === "npc"
      ) {
        this.moveToward(
          this.entities[i].shape,
          this.entities[i].attackDest[this.entities[i].axis],
          this.entities[i].axis,
          this.entities[i].direction,
          0.3,
          () => {
            //calculate damage and set variable if npc died
            this.npcAttack(this.entities[i]);

            //change attack phase to moving away from player
            this.entities[i].attackPhase = "in";
          },
        );
      }

      // if attack phase is in - move back
      if (
        this.entities[i].attackPhase === "in" &&
        this.entities[i].type === "npc"
      ) {
        this.moveToward(
          this.entities[i].shape,
          this.entities[i].attackReturn[this.entities[i].axis],
          this.entities[i].axis,
          this.entities[i].direction * -1,
          0.5,
          () => {
            this.endMeleeLunge(this.entities[i]);
          },
        );
      }
    }
  }

  //function that takes grid index number position and returns the corresponding pixel position.
  gridPosition(number) {
    return this.gridSize / 2 + number * this.gridSize;
  }

  //function that takes a start position an axis and a length - creates a wall and adds it to the map wall array
  createWall(startX, startY, axis, length) {
    const start = { x: startX, y: startY };

    for (let i = 0; i < length; i++) {
      const current = { x: start.x, y: start.y };
      current[axis] = start[axis] + i;
      this.walls.push(
        this.add
          .rectangle(
            this.gridPosition(current.x),
            this.gridPosition(current.y),
            this.gridSize,
            this.gridSize,
            0x808080,
          )
          .setDepth(this.renderDepth.map),
      );
    }
  }

  //function to sync a character or enemy npc location with their health bar position
  syncEntity(entity) {
    entity.highlight.x = entity.shape.x = entity.location.x;
    entity.highlight.y = entity.shape.y = entity.location.y;
    if (entity.type === "npc") {
      entity.aggroCircle.x = entity.location.x;
      entity.aggroCircle.y = entity.location.y;
    }
  }

  moveToward(mover, target, axis, direction, speed, onArrive) {
    // mover: the object being moved
    // axis: 'x' or 'y'
    // target: the pixel value to move toward
    // speed: how fast
    // onArrive: a function to call once arrived
    //check if entity is at destination, snap to exact position and callback
    if ((target - mover[axis]) * direction < speed) {
      mover[axis] = target;
      onArrive();
      //if not at destination yet - keep moving.
    } else {
      mover[axis] += direction * speed;
    }
  }

  //function to reduce the size of player and npc shapes when they take damage
  healthShrink(entity, maxHealth, currentHealth) {
    const maxHealthRatio = currentHealth / maxHealth;
    const remainingHealthRatio =
      this.healthShrinkFloor +
      maxHealthRatio * (this.healthShrinkCeiling - this.healthShrinkFloor);
    if (entity.type === "Rectangle") {
      entity.setSize(
        this.gridSize * remainingHealthRatio,
        this.gridSize * remainingHealthRatio,
      );
    }
    if (entity.type === "Arc") {
      entity.setRadius((this.gridSize * remainingHealthRatio) / 2);
    }
    if (entity.type === "Polygon") {
      entity.setScale(remainingHealthRatio);
    }
  }

  //function to calculate damage
  damageCalc(attackType, attacker, target) {
    const { min, max } = attacker.baseDamage[attackType];
    let damage = Math.floor(Math.random() * (max - min + 1)) + min;
    let critical = false;
    if (Math.random() < attacker.critChance) {
      critical = true;
      damage = Math.round(damage + damage * 0.5);
    }
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    if (critical) {
      this.addToLog(
        `The ${attacker.name} critically hit the ${target.name} for ${damage} damage!`,
      );
    } else {
      this.addToLog(
        `The ${attacker.name} hit the ${target.name} for ${damage} damage!`,
      );
    }
    return target.currentHealth === 0;
  }

  addToLog(message) {
    //if array has 5 logs stored
    if (this.combatLog.length >= 5) {
      //shift array and push new message in
      this.combatLog.shift();
      this.combatLog.push(message);
    } else {
      //else push new message in
      this.combatLog.push(message);
    }
    this.combatText.setText(this.combatLog.join("\n"));
  }

  createNpc(npcClass, x, y) {
    let newNpc = null;
    if (npcClass === "Barbarian") {
      newNpc = {
        type: "npc",
        name: npcClass,
        shape: this.add
          .circle(x, y, this.gridSize / 2, this.entityColors.Barbarian)
          .setDepth(this.renderDepth.entity),
        aggroCircle: null,
        location: { x: x, y: y },
        maxHealth: 100,
        currentHealth: 100,
        baseDamage: { melee: { min: 10, max: 20 }, spell: { min: 0, max: 0 } },
        critChance: 0.2,
        attackType: "melee",
      };
    }

    if (npcClass === "Wizard") {
      //place enemy diamond
      newNpc = {
        type: "npc",
        name: npcClass,
        shape: this.addDiamond(x, y, this.entityColors.Wizard),
        aggroCircle: null,
        location: { x: x, y: y },
        maxHealth: 50,
        currentHealth: 50,
        baseDamage: { melee: { min: 5, max: 10 }, spell: { min: 10, max: 20 } },
        critChance: 0.2,
        attackType: "spell",
      };
    }
    this.entities.push(newNpc);
    this.createHighlight(newNpc);
    this.createNpcAggroCircle(newNpc);
  }

  addDiamond(x, y, color) {
    const half = this.gridSize / 2;
    const points = [0, -half, half, 0, 0, half, -half, 0];
    const diamond = this.add
      .polygon(x, y, points, color)
      .setDepth(this.renderDepth.entity);
    diamond.setDisplayOrigin(
      diamond.displayOriginX - half,
      diamond.displayOriginY - half,
    );
    return diamond;
  }

  createHighlight(entity) {
    entity.highlight = this.add.rectangle(
      entity.location.x,
      entity.location.y,
      this.gridSize,
      this.gridSize,
      this.entityColors[entity.name],
    );
    entity.highlight.setAlpha(this.highlightAlpha);
    entity.highlight.setStrokeStyle(
      this.highlightLineWidth,
      this.entityColors[entity.name],
      this.highlightStrokeAlpha,
    );
    entity.highlight.setDepth(this.renderDepth.highlight);
  }

  isAdjacent(absDistanceX, absDistanceY) {
    //If adjacent return true
    return (
      (absDistanceX === this.gridSize && absDistanceY === 0) ||
      (absDistanceX === 0 && absDistanceY === this.gridSize)
    );
  }

  startMeleeLunge(entity) {
    entity.attackReturn = { x: entity.shape.x, y: entity.shape.y };
    entity.attackDest = { x: entity.attackReturn.x, y: entity.attackReturn.y };
    entity.attackDest[entity.axis] += entity.direction * this.gridSize * 0.3;
    entity.isAttacking = true;
    entity.attackPhase = "out";
  }

  endMeleeLunge(entity) {
    entity.attackTarget = null;
    entity.isAttacking = false;
    entity.attackPhase = "idle";
    if (entity.type === "npc") {
      this.advanceNpcTurn();
    }
  }

  npcAttack(attacker) {
    const playerDied = this.damageCalc(
      attacker.attackType,
      attacker,
      this.player,
    );
    if (playerDied) {
      this.addToLog("You have died a brutal death!");
      this.gameOver = true;
      this.scene.start("GameOverScene");
    }
  }

  startNpcTurn() {
    this.isPlayerTurn = false;
    this.npcsTurn = [];
    this.npcTurnIndex = 0;
    for (let i = 0; i < this.entities.length; i++) {
        if (this.entities[i].type === "npc") {
            this.npcsTurn.push(this.entities[i]);
            const npcIsAggro = this.checkNpcAggro(this.entities[i]);
            if(!npcIsAggro.previousAggroState && npcIsAggro.isAggro) {
                this.countNpcsAggroed++;
                this.pulseAggroCircle(this.entities[i], () => {
                    if(this.countNpcsAggroed === 0) {
                        this.advanceNpcTurn();
                    }
                });
            }
        }
    }
    if (this.countNpcsAggroed === 0) {
        this.advanceNpcTurn();
    }
}

   advanceNpcTurn() {
    if (this.npcTurnIndex < this.npcsTurn.length) {
      const npcTurnNow = this.npcTurnIndex;
      this.npcTurnIndex++;
      if (this.npcsTurn[npcTurnNow].isAggro) {
        this.time.delayedCall(this.globalPauseTime, () =>
            this.processNpcAttack(this.npcsTurn[npcTurnNow]),
            );
      } else {
        this.advanceNpcTurn();
      }
    } else {
      this.isPlayerTurn = true;
    }
  }

  checkNpcAggro(entity) {
    const previousAggroState = entity.isAggro;
    const distance =
      this.checkRadiusDistance(entity.location, this.player.location) -
      this.gridSize / 2;
    if (distance <= this.globalAggroCellDistance) {
      entity.isAggro = true;
    }
    return {
      previousAggroState: previousAggroState,
      isAggro: entity.isAggro,
    };
  }

    pulseAggroCircle(entity, callback) {
        this.tweens.add({
            targets: entity.aggroCircle, // which object(s) to animate
            strokeAlpha: 0.8, // the property to animate, and its target value
            fillAlpha: 0.15, // second property to animate
            duration: 250, // how long one animation takes, in ms
            yoyo: true, // play forward, then automatically reverse back
            repeat: 1, // how many additional times to repeat (1 = plays twice total)
            ease: "Sine.easeInOut", // the shape of the animation curve over time
            onComplete: () => this.tweens.add({
                targets: entity.aggroCircle, // which object(s) to animate
                strokeAlpha: 0, // the property to animate, and its target value
                fillAlpha: 0, // second property to animate
                duration: 100, // how long one animation takes, in ms
                yoyo: false, // play forward, then automatically reverse back
                repeat: 0, // how many additional times to repeat (1 = plays twice total)
                ease: "Sine.easeInOut", // the shape of the animation curve over time
                onComplete: () => {
                    entity.aggroCircle.destroy();
                    this.countNpcsAggroed--;
                    callback();
                },
            })
        });
    }

  processNpcAttack(entity) {
    const absDistanceX = Math.abs(this.player.location.x - entity.location.x);
    const absDistanceY = Math.abs(this.player.location.y - entity.location.y);

    //If npc is an adjacent, start lunge attack
    if (
      this.isAdjacent(absDistanceX, absDistanceY) &&
      entity.attackType === "melee"
    ) {
      //determine which axis the npc is attacking on
      if (absDistanceX === 0) {
        entity.axis = "y";
      } else {
        entity.axis = "x";
      }
      //determine the direction the npc is attacking
      entity.direction = Math.sign(
        this.player.location[entity.axis] - entity.location[entity.axis],
      );
      this.startMeleeLunge(entity);

      //start Wizard attack
    } else if (
      this.isAdjacent(absDistanceX, absDistanceY) &&
      entity.attackType === "spell"
    ) {
      //calculate damage and set variable if npc died
      this.npcAttack(entity);
      this.advanceNpcTurn();
    } else {
      //determine if distance along x or y axis is bigger
      const distanceX = this.player.location.x - entity.location.x;
      const distanceY = this.player.location.y - entity.location.y;
      if (absDistanceX > absDistanceY) {
        entity.axis = "x";
        entity.direction = Math.sign(distanceX);
      }
      if (absDistanceX < absDistanceY) {
        entity.axis = "y";
        entity.direction = Math.sign(distanceY);
      }
      if (absDistanceX === absDistanceY) {
        entity.axis = Math.random() < 0.5 ? "x" : "y";
        if (entity.axis === "x") {
          entity.direction = Math.sign(distanceX);
        } else {
          entity.direction = Math.sign(distanceY);
        }
      }
      entity.targetTile =
        entity.location[entity.axis] + entity.direction * this.gridSize;
      //check if npc can move
      if (this.checkCanMoveTo(entity, entity.axis, entity.direction)) {
        //set NPC isMoving
        entity.isMoving = true;
      } else {
        this.addToLog(`The ${entity.name} could not move!`);
        this.advanceNpcTurn();
      }
    }
  }

  checkCanMoveTo(entity, axis, direction) {
    //check if target tile is another npc.
    const hitsNpc = this.entities.some(
      (npc) =>
        npc.location[axis] === entity.targetTile &&
        npc.location[this.axisConfig[axis].other] ===
          entity.location[this.axisConfig[axis].other],
    );
    //check if target tile is a wall tile or boundary.
    const hitsWall = this.walls.some(
      (wall) =>
        wall[axis] === entity.targetTile &&
        wall[this.axisConfig[axis].other] ===
          entity.location[this.axisConfig[axis].other],
    );
    const hitsBoundary =
      entity.targetTile < this.gridPosition(0) ||
      entity.targetTile > this.gridPosition(this.axisConfig[axis].max);
    //return false if entity can't move or true if they can move
    return !(hitsNpc || hitsWall || hitsBoundary);
  }

  createNpcAggroCircle(entity) {
    entity.aggroCircle = this.add.circle(
      entity.location.x,
      entity.location.y,
      this.globalAggroCellDistance,
      this.entityColors.aggroCells,
    );
    entity.aggroCircle.setStrokeStyle(4, this.entityColors.aggroCells, 0.4);
    entity.aggroCircle.setFillStyle(this.entityColors.aggroCells, 0.1);
    entity.aggroCircle.setDepth(this.renderDepth.aggroCircle);
  }

  //function to calculate and return Pythagoras hypotenuse
  checkRadiusDistance(npc, destination) {
    const distanceX = npc.x - destination.x;
    const distanceY = npc.y - destination.y;
    return Math.hypot(distanceX, distanceY);
  }
}

//create GameOverScene
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create() {
    //display tombstone
    const tombstoneText = `
        _.-'''''-._  
      .'   _____   '. 
     /   .'     '.   \\
    |   /  R.I.P  \\   |
    |  |           |  |
    |  |    YOU    |  |
    |  |    DIED   |  |
    |  |           |  |
    |   \\_________/   |
    |                 |
    |_________________|
   /___________________\\
  |_____________________|
~~~^~~~^~~~^~~~^~~~^~~~^~~~
`;
    const tombstoneAscii = this.add.text(620, 620, tombstoneText, {
      fontFamily: "Courier New",
      fontSize: "24px",
      color: "#00ff00",
    });
    tombstoneAscii.setOrigin(0.5, 0.5);

    const tryAgain = "Press Enter to try again";
    const tryAgainText = this.add.text(620, 900, tryAgain, {
      fontFamily: "Courier New",
      fontSize: "24px",
      color: "#00ff00",
    });
    tryAgainText.setOrigin(0.5, 0.5);
    this.enterKey = this.input.keyboard.addKey("ENTER");
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.start("DungeonScene");
    }
  }
}

//object defining the game
const phaserRpg = {
  height: 1240,
  width: 1240,
  parent: "app",
  scene: [DungeonScene, GameOverScene],
};

//variable running the game
const runningGame = new Phaser.Game(phaserRpg);
