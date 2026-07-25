    const areAttacking = this.entities.some(
        (attack) => attack.isAttacking === true,
    );
    const areMoving = this.entities.some(
        (move) => move.isMoving === true,
    );
    if (!areMoving && !areAttacking) {
      this.player.axis = "";
      this.player.direction = 0;
    }