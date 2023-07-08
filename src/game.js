const e = require('express');
const uuid = require('uuid');

const EVENTS = {
    ON_GAME_START: "ON_GAME_START",
    UPDATE_BOARD: "UPDATE_BOARD",
    TO_UP: "ArrowUp",
    TO_DOWN: "ArrowDown",
    TO_LEFT: "ArrowLeft",
    TO_RIGHT: "ArrowRight",
    PUT_BOMB: " ",
    FINAL_MESSAGE: "FINAL_MESSAGE"
}

const OBJECTS = {
    NOTHING: 0,
    FIXED_BLOCK: 1,
    BLOCK: 2,
    PLAYER: 3,
    OPPONENT: 4,
    BOMB: 5,
    FRUTE: 6,
    FIRE: 7,
    FRUTE_2: 8,
}

const GAME_STATUS = {
    CREATED: "CREATED",
    STARTED: "STARTED",
    FINISHED: "FINISHED"
}

const PLAYER_STATUS = {
    LIVE: "LIVE",
    DEAD: "DEAD"
}

class Player {
    /*
    * @param {Scoket} socket
    */
    constructor(socket) {
        this.status = PLAYER_STATUS.LIVE 
        this.socket = socket
        this.id = socket.id
        this.bombPower = 1
        this.numMaxBombs = 1
        this.actualNumBombs = 0;
        this.x = 0;
        this.x = 0;
    }

    /*
    * @param {number} value - The value of player on the board
    */
    setIndex(value) {
        this.index = value
    }

    /*
    * @param {number} x
    * @param {number} y
    */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /*
    * Check if the player id is equals to socket id
    * @param {string} playerID
    * @return {boolean}
    */
    isMe(playerID) {
        return playerID == this.socket.id
    }
}

class Game {

    board = [
        [3, 0, 2, 2, 2, 2, 2, 0, 2,],
        [0, 1, 2, 1, 2, 1, 2, 1, 0,],
        [2, 2, 2, 2, 2, 2, 0, 0, 2,],
        [2, 1, 2, 1, 2, 1, 2, 1, 2,],
        [2, 2, 2, 2, 2, 2, 2, 2, 2,],
        [0, 1, 2, 1, 2, 1, 2, 1, 0,],
        [0, 2, 2, 0, 2, 2, 2, 2, 2,],
        [2, 1, 0, 1, 0, 1, 2, 1, 0,],
        [2, 2, 2, 0, 2, 2, 2, 0, 4,],
    ]

    players = []

    hiddenBoard = [
        [0, 0, 8, 0, 6, 0, 6, 0, 8,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 6, 0, 8, 6, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 8, 0, 0, 0, 0, 0, 8, 0,],
        [0, 1, 0, 1, 6, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 8, 6, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [8, 0, 6, 0, 0, 6, 8, 0, 0,],
    ]

    /*
    * @param {Player} firstPlayer
    * @param {Player} secondPlayer
    */
    constructor(firstPlayer, secondPlayer) {
        this.id = uuid.v4().toString();
        firstPlayer.setIndex(OBJECTS.PLAYER)
        secondPlayer.setIndex(OBJECTS.OPPONENT)
        firstPlayer.setPosition(0, 0)
        secondPlayer.setPosition(8, 8)
        this.players.push(firstPlayer)
        this.players.push(secondPlayer)
    }


    start() {
        this.status = GAME_STATUS.STARTED
        this.players.forEach((player, _) => {
            player.socket.emit(EVENTS.ON_GAME_START, {
                gameID: this.id,
                playerID: player.id
            })
        })
        this.emitState()
    }

    emitState() {
        this.players.forEach((player, _) => {
            player.socket.emit(EVENTS.UPDATE_BOARD, {
                board: this.board,
                hiddenBoard: this.hiddenBoard
            })
        })
        this.checkResult()
    }

    finish() {
        this.status = GAME_STATUS.FINISHED
    }

    checkResult() {
        if(this.status == GAME_STATUS.FINISHED) {
            let messageForFirst = "Empate"
            let messageForSecond = "Empate"
            if(this.players[0].status == PLAYER_STATUS.DEAD && this.players[1].status == PLAYER_STATUS.LIVE){
                messageForFirst = "Você perdeu"
                messageForSecond = "Você ganhou"
            }

            if(this.players[0].status == PLAYER_STATUS.LIVE && this.players[1].status == PLAYER_STATUS.DEAD) {
                messageForFirst = "Você ganhou"
                messageForSecond = "Você perdeu"
            }

            this.players[0].socket.emit(EVENTS.FINAL_MESSAGE, messageForFirst)
            this.players[1].socket.emit(EVENTS.FINAL_MESSAGE, messageForSecond)
        }
    }



    /*
    * Check if the move player is valid and set the new position
    * @param {string} playerID
    * @param {string} command
    */
    handleWithMoveControls(playerID, command) {
        if (this.status == GAME_STATUS.STARTED) {
            // Get the player
            let player = this.players[0].isMe(playerID) ? this.players[0] : this.players[1]
            let x = player.x
            let y = player.y

            if (command == EVENTS.TO_UP) { x-- }
            else if (command == EVENTS.TO_DOWN) { x++ }
            else if (command == EVENTS.TO_LEFT) { y-- }
            else if (command == EVENTS.TO_RIGHT) { y++ }

            // Check if the player can go to the position
            if (this.isAValidPosition(x, y)) {
                this.board[player.x][player.y] = 0;
                this.board[x][y] = player.index
                player.setPosition(x, y);

                if (this.hiddenBoard[x][y] == OBJECTS.FRUTE) {
                    this.hiddenBoard[x][y] = OBJECTS.NOTHING
                    player.numMaxBombs++;
                }

                if (this.hiddenBoard[x][y] == OBJECTS.FRUTE_2) {
                    this.hiddenBoard[x][y] = OBJECTS.NOTHING
                    player.bombPower++;
                }
            }
            this.emitState()
        }
    }

    /*
    * Put bomb on board
    * @param {string} playerID
    */
    handleWithBombControl(playerID) {
        if (this.status == GAME_STATUS.STARTED) {
            let player = this.players[0].isMe(playerID) ? this.players[0] : this.players[1]
            if (player.numMaxBombs > player.actualNumBombs) {
                let x = player.x
                let y = player.y
                let power = player.bombPower
                player.actualNumBombs++;
                this.hiddenBoard[x][y] = OBJECTS.BOMB
                setTimeout(() => {
                    this.explodBomb(x, y, power, true)
                    player.actualNumBombs--;
                    this.emitState()
                }, 2000)
                setTimeout(() => {
                    this.explodBomb(x, y, power, false)
                    this.emitState()
                }, 3000)
            }
            this.emitState()
        }

    }

    explodBomb(x, y, power, first) {
        this.board[x][y] = first ? OBJECTS.FIRE : OBJECTS.NOTHING
        this.hiddenBoard[x][y] = OBJECTS.NOTHING
        let up = true;
        let down = true;
        let left = true;
        let right = true;
        for (let i = 1; i <= power; i++) {
            if (up) { up = this._explodBomb(x + i, y, first) }
            if (down) { down = this._explodBomb(x - i, y, first) }
            if (right) { right = this._explodBomb(x, y + i, first) }
            if (left) { left = this._explodBomb(x, y - i, first) }
        }
    }

    _explodBomb(x, y, first) {
        if (x >= 0 && x < 9 && y >= 0 && y < 9) {
            if (this.board[x][y] != OBJECTS.FIXED_BLOCK) {
                // Destroy blocks
                if (this.board[x][y] == OBJECTS.BLOCK) {
                    this.board[x][y] == 0
                }

                if (this.board[x][y] == OBJECTS.PLAYER && first) {
                    this.players[0].status = PLAYER_STATUS.DEAD
                    this.finish()
                }

                if (this.board[x][y] == OBJECTS.OPPONENT && first) {
                    this.players[1].status = PLAYER_STATUS.DEAD
                    this.finish()
                }

                this.board[x][y] = first ? OBJECTS.FIRE : OBJECTS.NOTHING
            } else {
                return false
            }
        }
        return true
    }


    isAValidPosition(x, y) {
        let xIsValid = x >= 0 && x < 9
        let yIsValid = y >= 0 && y < 9
        if (xIsValid && yIsValid) {
            let hasNotingOnSpot = this.board[x][y] == OBJECTS.NOTHING
            return hasNotingOnSpot;
        }
        return false
    }
}

module.exports = { Game, Player, EVENTS }