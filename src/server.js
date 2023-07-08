const express = require('express');
const app = express();
const http = require('http').Server(app);
var cors = require('cors')
const io = require('socket.io')(http);
const uuid = require('uuid');
const { Game, Player, EVENTS } = require('./game');

app.use(express.static('public'));
app.use(cors)

const CONNECTION_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  WAITING_SECOND_PLAYER: "WAITING_SECOND_PLAYER",
}

const games = new Map();
const players = new Map();
const room = []; 

io.on(CONNECTION_EVENTS.CONNECTION, (socket) => {
  players.set(socket.id, socket)
  room.push(socket)
  console.log(`User: ${socket.id}`)
  
  if(room.length < 2) {
    socket.emit(CONNECTION_EVENTS.WAITING_SECOND_PLAYER)
  }

  if(room.length == 2) {
    const firstPlayer = new Player(room.shift())
    const secondPlayer = new Player(room.shift())
    const game = new Game(firstPlayer, secondPlayer)
    games.set(game.id, game)
    game.start()
  }

  socket.on(EVENTS.TO_UP, (data) => {
    const game = games.get(data.gameID)
    game.handleWithMoveControls(data.playerID, EVENTS.TO_UP)
  })

  socket.on(EVENTS.TO_DOWN, (data) => {
    const game = games.get(data.gameID)
    game.handleWithMoveControls(data.playerID, EVENTS.TO_DOWN)
  })

  socket.on(EVENTS.TO_LEFT, (data) => {
    const game = games.get(data.gameID)
    game.handleWithMoveControls(data.playerID, EVENTS.TO_LEFT)
  })

  socket.on(EVENTS.TO_RIGHT, (data) => {
    const game = games.get(data.gameID)
    game.handleWithMoveControls(data.playerID, EVENTS.TO_RIGHT)
  })

  socket.on(EVENTS.PUT_BOMB, (data) => {
    const game = games.get(data.gameID)
    game.handleWithBombControl(data.playerID)
  })
})

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
