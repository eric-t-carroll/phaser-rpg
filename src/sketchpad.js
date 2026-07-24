this.directionConfig = {
    1: { other: -1},
    -1: { other: 1}
};




const xDistance = this.player.x - this.entities[i].x;
const yDistance = this.player.y - this.entities[i].y;
const xDirection = Math.sign(xDistance);
const yDirection = Math.sign(yDistance);
if (xDistance > yDistance) {
    this.entities[i].axis = 'x';  //TODO** remember to add targetTile, axis and direction to this.entities for npcs
    this.entities[i].direction = xDirection;
} else {
    this.entities[i].axis = 'y';
    this.entities[i].direction = yDirection;
}
if (xDirection === yDirection) {
    this.entities[i].axis = Math.random() < 0.5 ? 'x' : 'y';
    if (this.entities[i].axis === 'x') {
        this.entities[i].direction === xDirection;
    } else {
        this. entities[i].direction === yDirection;
    }
}
this.entities[i].targetTile = this.entities[i].location.axis + this.entities[i].direction * this.gridSize;
if(this.checkCanMoveTo(this.entities[i], this.entitied[i].axis), this.entities[i].direction) {
    this.entities[i].isMoving = true; //TODO - add isMoving to npcs
    this.moveToward(this.entities[i], this.entities[i].targetTile, this.entities[i].axis, this.entities[i].direction, this.globalMoveSpeed,
        () => {
            this.entities[i].isMoving = false;
            this.advanceNpcTurn();
        });
    return;
}
if(this.checkCanMoveTo(this.entities[i], this.entities[i].location[this.axisConfig[axis].other]), this.entities[i].direction) {
    this.entities[i].isMoving = true; //TODO - add isMoving to npcs
    this.moveToward(this.entities[i], this.entities[i].targetTile, this.entities[i].location[this.axisConfig[axis].other], this.entities[i].direction[this.directionConfig[direction]], this.globalMoveSpeed,
        () => {
            this.entities[i].isMoving = false;
            this.advanceNpcTurn();
        });
    return;
}
this.addToLog(`The ${this.entities[i].name} could not move!`);


//sync npc shape with location
this.syncEntity(
this.entities[i].location.x,
this.entities[i].location.y,
this.entities[i].shape,
);   //TODO - change this.playerSpeed to this.moveSpeed
















  processNpcTurn(entity) {
    const directionX = Math.abs(this.player.location.x - entity.location.x);
    const directionY = Math.abs(this.player.location.y - entity.location.y);

    //If npc is an adjacent Barbarian, start lunge attack
    if (
      ((directionX === this.gridSize && directionY === 0) ||
        (directionX === 0 && directionY === this.gridSize)) &&
      entity.attackType === "melee"
    ) {
      //determine which axis the npc is attacking on
      if (directionX === 0) {
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
      ((directionX === this.gridSize && directionY === 0) ||
        (directionX === 0 && directionY === this.gridSize)) &&
      entity.attackType === "spell"
    ) {
      //calculate damage and set variable if npc died
      this.npcAttack(entity);
      this.advanceNpcTurn();
    } else {
    //determine if distance along x or y axis is bigger
    const distanceX = this.player.location.x - entity.location.x;
    const distanceY = this.player.location.y - entity.location.y;
    if (distanceX > distanceY) {
        entity.axis = 'x';
        entity.direction = Math.sign(distanceX);
    }
    if (distanceX < distanceY) {
        entity.axis = 'y';
        entity.direction = Math.sign(distanceY);
    }
    if (distanceX === distanceY) {
        entity.axis = Math.random() < 0.5 ? 'x' : 'y';
        if (entity.axis === 'x') {
            entity.direction = Math.sign(distanceX);
        } else {
            entity.direction = Math.sign(distanceY);
        }
    }
    entity.targetTile = entity.location[entity.axis] + entity.direction * this.gridSize;
    //check if npc can move
    if(this.checkCanMoveTo(entity, entity.axis, entity.direction)) {
        //move NPC
        this.moveToward(entity.location, entity.targetTile, entity.axis, entity.direction, this.globalMoveSpeed, () => {
            this.syncEntity(
                entity.location.x,
                entity.location.y,
                entity.shape,
                );
            this.advanceNpcTurn();
            });
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
    entity.targetTile >
    this.gridPosition(this.axisConfig[axis].max);
    //return false if entity can't move or true if they can move
    return !(hitsNpc || hitsWall || hitsBoundary);
}