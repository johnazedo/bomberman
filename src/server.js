const express = require('express');
const app = express();
const http = require('http').Server(app);
var cors = require('cors')
const io = require('socket.io')(http);
const { Game, Player, EVENTS, GAME_STATUS } = require('./game');

app.use(express.static('public'));
app.use(cors)

const CONNECTION_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    WAITING_SECOND_PLAYER: "WAITING_SECOND_PLAYER",
    USER_SIGNED_IN: "USER_SIGNED_IN",
    USER_TRY_SIGN_IN: "USER_TRY_SIGN_IN",
    SEND_MESSAGE: "SEND_MESSAGE",
    RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
    UPDATE_GAMES: "UPDATE_GAMES",
    CREATE_GAME: "CREATE_GAME",
    GO_TO_THE_GAME: "GO_TO_THE_GAME",
    ENTER_ON_A_GAME: "ENTER_ON_A_GAME",
    SEND_LOGIN_WARNINGS: "SEND_LOGIN_WARNINGS"
}

const games = new Map();
const players = new Map();

io.on(CONNECTION_EVENTS.CONNECTION, (socket) => {
    players.set(socket.id, new Player(socket))
    console.log(`Connected: ${socket.id}`)
    // updateState()

    function updateState() {
        console.log("Call this")
        let result = []
        games.forEach((value, key) => {
            if (value.status != GAME_STATUS.FINISHED) {
                result.push({
                    gameID: value.id,
                    gameState: value.status,
                    username: value.players[0].username
                })
            }
        })

        players.forEach((value, _) => {
            value.socket.emit(CONNECTION_EVENTS.UPDATE_GAMES, {
                games: result
            })
        })
    }

    socket.on(EVENTS.TO_UP, (data) => {
        const game = games.get(data.gameID)
        if (game != null) {
            game.handleWithMoveControls(data.playerID, EVENTS.TO_UP)
        }
    })

    socket.on(EVENTS.TO_DOWN, (data) => {
        const game = games.get(data.gameID)
        if (game != null) {
            game.handleWithMoveControls(data.playerID, EVENTS.TO_DOWN)
        }
    })

    socket.on(EVENTS.TO_LEFT, (data) => {
        const game = games.get(data.gameID)
        if (game != null) {
            game.handleWithMoveControls(data.playerID, EVENTS.TO_LEFT)
        }
    })

    socket.on(EVENTS.TO_RIGHT, (data) => {
        const game = games.get(data.gameID)
        if (game != null) {
            game.handleWithMoveControls(data.playerID, EVENTS.TO_RIGHT)
        }
    })

    socket.on(EVENTS.PUT_BOMB, (data) => {
        const game = games.get(data.gameID)
        if (game != null) {
            game.handleWithBombControl(data.playerID)
        }
    })

    socket.on(CONNECTION_EVENTS.USER_TRY_SIGN_IN, (data) => {
        const player = players.get(socket.id)
        let canAdd = true;
        players.forEach((item, _) => {
            if (item.username == data.username || item.email == data.email) {
                canAdd = false
            }
        })

        if (canAdd) {
            player.username = data.username
            player.email = data.email
            player.password = data.password

            socket.emit(CONNECTION_EVENTS.USER_SIGNED_IN, {
                playerID: player.socket.id
            })
            updateState()
        } else {
            socket.emit(CONNECTION_EVENTS.SEND_LOGIN_WARNINGS, {
                message: "Esse usario ou email já está em posse de outra pessoa. Tente novamento com outro"
            })
        }
    })

    socket.on(CONNECTION_EVENTS.DISCONNECT, () => {
        console.log("Disconnected: " + socket.id)
        updateState()
        players.delete(socket.id)
    })

    socket.on(CONNECTION_EVENTS.SEND_MESSAGE, (data) => {
        console.log(games.size)
        const player = players.get(socket.id)
        if (player != null) {
            socket.broadcast.emit(CONNECTION_EVENTS.RECEIVE_MESSAGE, {
                username: player.username,
                message: data.message
            })
            socket.emit(CONNECTION_EVENTS.RECEIVE_MESSAGE, {
                username: player.username,
                message: data.message
            })
        }
    })

    socket.on(CONNECTION_EVENTS.CREATE_GAME, () => {
        const player = players.get(socket.id)
        if (player != null) {
            const game = new Game(player)
            game.setCallback(() => {
                updateState()
            })
            games.set(game.id, game)
            updateState()
            socket.emit(CONNECTION_EVENTS.GO_TO_THE_GAME, {
                gameID: game.id
            })
            socket.emit(CONNECTION_EVENTS.WAITING_SECOND_PLAYER)
        }
    })

    socket.on(CONNECTION_EVENTS.ENTER_ON_A_GAME, (data) => {
        const player = players.get(socket.id)
        if (player != null) {
            const game = games.get(data.gameID)
            if (game != null) {
                if (game.players.length < 2 && game.status == GAME_STATUS.CREATED) {
                    game.setSecondPlayer(player);
                    socket.emit(CONNECTION_EVENTS.GO_TO_THE_GAME, {
                        gameID: game.id
                    })
                    game.start()
                }
            }
        }
        updateState()
    })
})

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});
