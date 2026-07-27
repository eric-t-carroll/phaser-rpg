


processNpcAttack(entity) {
    const absDistanceX = Math.abs(this.player.location.x - entity.location.x);
    const absDistanceY = Math.abs(this.player.location.y - entity.location.y);
    const shouldMove = this.checkShouldMove(entity);



    //Barbarian branch
    if (entity.attackType === "melee") {
      if (this.isAdjacent(absDistanceX, absDistanceY)) {
        //existing melee lunge logic — unchanged
        if (absDistanceX === 0) {
          entity.axis = "y";
        } else {
          entity.axis = "x";
        }
        entity.direction = Math.sign(
          this.player.location[entity.axis] - entity.location[entity.axis],
        );
        this.startMeleeLunge(entity);
      } else {
        //placeholder: shared chase/movement logic
        this.chaseTarget(entity);
      }



    //Wizard branch
    } else if (entity.attackType === "spell") {
      if (!shouldMove) {
        //in range — add orb (covers both starting and continuing a cast)
        if (entity.castProgress < this.castSpellTurns) {
          this.createSpellOrb(entity);
          this.advanceNpcTurn();
        } else {
          //castProgress has reached castSpellTurns — fire!
          //placeholder: fire animation, then damage + advanceNpcTurn
        }
      } else {
        //out of range — abandon any in-progress cast, then chase
        if (entity.castProgress > 0) {
          //placeholder: destroy entity.castOrbs shapes, reset castOrbs to [],
          //reset castProgress to 0, reset castCenter to {x: null, y: null}
        }
        //placeholder: shared chase/movement logic
        this.chaseTarget(entity);
      }
    }
  }



  //placeholder — decides whether an entity is close enough to its
  //engagement distance (melee = 1 tile, spell = cast range)
  checkShouldMove(entity) {
    const engagementDistance =
      entity.attackType === "melee" ? this.gridSize : this.globalCastRange;
    const distance = this.checkRadiusDistance(
      entity.location,
      this.player.location,
    );
    return distance > engagementDistance;
  }


  
  //placeholder — the existing axis/direction-picking + checkCanMoveTo
  //logic, extracted so both branches can share it
  chaseTarget(entity) {
    const distanceX = this.player.location.x - entity.location.x;
    const distanceY = this.player.location.y - entity.location.y;
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

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
      entity.direction =
        entity.axis === "x" ? Math.sign(distanceX) : Math.sign(distanceY);
    }
    entity.targetTile =
      entity.location[entity.axis] + entity.direction * this.gridSize;

    if (this.checkCanMoveTo(entity, entity.axis, entity.direction)) {
      entity.isMoving = true;
    } else {
      this.addToLog(`The ${entity.name} could not move!`);
      this.advanceNpcTurn();
    }
  }