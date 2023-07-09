const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
    FRUIT: 6,
    FIRE: 7,
    FRUIT_2: 8,
}

const EVENTS = {
    ON_GAME_START: "ON_GAME_START",
    UPDATE_BOARD: "UPDATE_BOARD",
    WAITING_SECOND_PLAYER: "WAITING_SECOND_PLAYER",
    KEY_PRESSED: "keyup"
}

let images = []

let board = []
let hiddenBoard = []

window.addEventListener(EVENTS.KEY_PRESSED, function(event) {
    const key = event.key;
    socket.emit(key, {
        gameID: gameID,
        playerID: playerID
    })
})

function draw() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let column = 0; column < BOARD_SIZE; column++) {
            let boardIndex = board[row][column]
            let hiddenBoardIndex = hiddenBoard[row][column]
          
            if (hiddenBoardIndex != Blocks.NOTHING) {
                ctx.drawImage(images[hiddenBoardIndex], column * BLOCK_SIZE, row * BLOCK_SIZE)
            }

            if (boardIndex != Blocks.NOTHING) {
                ctx.drawImage(images[boardIndex], column * BLOCK_SIZE, row * BLOCK_SIZE);
            }
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
    board = data.board
    hiddenBoard = data.hiddenBoard
});

socket.on(EVENTS.ON_GAME_START, () => {
    warnings.textContent = ""
    run();
})

socket.on(EVENTS.WAITING_SECOND_PLAYER, () => {
    warnings.textContent = "Esperando segundo jogador"
})

socket.on("FINAL_MESSAGE", (data) => {
    warnings.textContent = data
})
