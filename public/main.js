const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io("ws://172.21.241.84:3000");

const BOARD_SIZE = 9;
const BLOCK_SIZE = 64;
const CANVAS_SIZE = 576;

const Blocks = {
    NOTHING: 0,
    FIXED_BLOCK: 1,
    BLOCK: 2,
    PLAYER: 3,
    OPPONENT: 4,
    BOMB: 5,
    FRUTE: 6,
    FIRE: 7,
}

const Identifiers = {
    gameID: '',
    playerID: ''
}

const EVENTS = {
    ON_GAME_START: "ON_GAME_START",
    UPDATE_BOARD: "UPDATE_BOARD",
    WAITING_SECOND_PLAYER: "WAITING_SECOND_PLAYER",
    KEY_PRESSED: "keypress"
}

var images = []

const board = [
    [0, 5, 2, 0, 2, 0, 2, 0, 0,],
    [3, 1, 2, 1, 0, 1, 0, 1, 0,],
    [2, 2, 2, 0, 2, 0, 0, 0, 2,],
    [0, 1, 0, 1, 0, 1, 0, 1, 0,],
    [0, 0, 2, 0, 2, 0, 2, 0, 2,],
    [0, 1, 2, 1, 0, 1, 0, 1, 2,],
    [0, 0, 2, 0, 0, 0, 2, 2, 2,],
    [0, 1, 2, 1, 0, 1, 2, 1, 5,],
    [0, 2, 0, 2, 2, 0, 2, 0, 4,],
]

canvas.addEventListener(EVENTS.KEY_PRESSED, function handle(event) {
    const key = event.key;
    socket.emit(key, Identifiers)
})

function draw() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let column = 0; column < BOARD_SIZE; column++) {
            var value = board[row][column]
            if (value == Blocks.NOTHING) { continue; }
            ctx.drawImage(images[value], column * BLOCK_SIZE, row * BLOCK_SIZE);
        }
    }
    requestAnimationFrame(draw);
}

async function run() {
    /*
     * It is necessary load all images. 
     * @location utils.js
     */
    images = await loadImages(Blocks);
    draw()
}


// Connections
socket.on(EVENTS.UPDATE_BOARD, (data) => {
    board = data;
});

socket.on(EVENTS.ON_GAME_START, (data) => {
    Identifiers.gameID = data.gameID
    Identifiers.playerID = data.playerID
    run();
})

socket.on(EVENTS.WAITING_SECOND_PLAYER, () => {
    warnings.textContent = "Esperando segundo jogador"
})
