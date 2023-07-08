const uuid = require('uuid');

const EVENTS = {
    ON_GAME_START: "ON_GAME_START",
    UPDATE_BOARD: "UPDATE_BOARD",
    TO_UP: "ArrowUp",
    TO_DOWN: "ArrowDown",
    TO_LEFT: "ArrowLeft",
    TO_RIGHT: "ArrowRight",
    PUT_BOMB: " "
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
}

class Player {
    /*
    * @param {Scoket} socket
    */
    constructor(socket) {
        this.socket = socket
        this.id = socket.id
        this.bombPower = 1
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
        [3, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 4,],
    ]

    players = []

    hiddenBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
        [0, 1, 0, 1, 0, 1, 0, 1, 0,],
        [0, 0, 0, 0, 0, 0, 0, 0, 0,],
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
    }
    
    /*
    * Check if the move player is valid and set the new position
    * @param {string} playerID
    * @param {string} command
    */ 
    handleWithMoveControls(playerID, command) {
        // Get the player
        let player = this.players[0].isMe(playerID) ? this.players[0] : this.players[1]
        let x = player.x
        let y = player.y

        if(command == EVENTS.TO_UP) { x-- } 
        else if(command == EVENTS.TO_DOWN) { x++ } 
        else if(command == EVENTS.TO_LEFT) { y-- }
        else if(command == EVENTS.TO_RIGHT) { y++ }

        if(this.isAValidPosition(x, y)) {
            this.board[player.x][player.y] = 0;
            this.board[x][y] = player.index
            player.setPosition(x, y);
        }
        this.emitState()
    }

    /*
    * Put bomb on board
    * @param {string} playerID
    */
    handleWithBombControl(playerID) {
        let player = this.players[0].isMe(playerID) ? this.players[0] : this.players[1]
        this.hiddenBoard[player.x][player.y] = OBJECTS.BOMB
        this.emitState()
    }


    isAValidPosition(x, y) {
        let xIsValid = x >= 0 && x < 9
        let yIsValid = y >= 0 && y < 9
        if(xIsValid && yIsValid) {
            let hasNotingOnSpot = this.board[x][y] == OBJECTS.NOTHING
            return hasNotingOnSpot;
        }
        return false
    }
}

module.exports = { Game, Player, EVENTS }