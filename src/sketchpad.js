

this.isPlayerTurn = true;





  startNpcTurn() {
    this.isPlayerTurn = false;
    this.npcsTurn = [];
    this.npcTurnIndex = 0;
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].type === "npc") {
        this.npcsTurn.push(this.entities[i]);
      }
    }
    this.advanceNpcTurn();
  }



  advanceNpcTurn() {
    if (this.npcTurnIndex < this.npcsTurn.length) {
        const npcTurnNow = this.npcTurnIndex;
        this.npcTurnIndex++;
        this.time.delayedCall(this.globalPauseTime, () =>
        this.processNpcTurn(this.npcsTurn[npcTurnNow]),
      );
    } else {
        this.isPlayerTurn = true;
    }
  }



