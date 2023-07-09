const $usernameInput = $('.usernameInput'); // Input for username
const $emailInput = $('.emailInput'); // Input for email
const $passwordInput = $('.senhaInput'); // Input for senha
const $button = $('#signin')
const socket = io("ws://172.23.111.117:3000");

const $lobby = document.getElementById("lobby-container")
const $game = document.getElementById("game-container")
const $login = document.getElementById("login-container")
// const $messages = document.getElementById("messages")
// const $games = document.getElementById("games")

const $messages = $('#messages')
const $games = $('#games')
const $chatInput = $('#chat-input-field')
const $sendButton = $('#send-message')
const $createGameButton = $('#create-game')
const $loginWarnings = $('#login-warnings')
let $playGameButton = $('.play-button')

const GAME_STATUS = {
    CREATED: "Criado",
    STARTED: "Em progresso",
    FINISHED: "Finalizado"
}

let playerID = ""
let gameID = ""

const LOGIN_EVENTS = {
    USER_SIGNED_IN: "USER_SIGNED_IN",
    USER_TRY_SIGN_IN: "USER_TRY_SIGN_IN"
}

const COMMUNICATION_EVENTS = {
    SEND_MESSAGE: "SEND_MESSAGE",
    RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
    UPDATE_GAMES: "UPDATE_GAMES",
    CREATE_GAME: "CREATE_GAME",
    GO_TO_THE_GAME: "GO_TO_THE_GAME",
    ENTER_ON_A_GAME: "ENTER_ON_A_GAME",
    SEND_LOGIN_WARNINGS: "SEND_LOGIN_WARNINGS"
}

$button.on("click", () => {
    if ($usernameInput.val() != null && $emailInput.val() != null) {
        socket.emit(LOGIN_EVENTS.USER_TRY_SIGN_IN, {
            username: $usernameInput.val(),
            email: $emailInput.val(),
            password: $passwordInput.val()
        })
    }
})

$sendButton.on("click", () => {
    if ($chatInput.val() != null) {
        socket.emit(COMMUNICATION_EVENTS.SEND_MESSAGE, {
            message: $chatInput.val()
        })
    }
    $chatInput.val("")
})

$createGameButton.on("click", () => {
    socket.emit(COMMUNICATION_EVENTS.CREATE_GAME)
})

$games.on("click", "button", function(e) {
    let id = $(e.target).data("value")
    socket.emit(COMMUNICATION_EVENTS.ENTER_ON_A_GAME, { 
        gameID: id
    })
})

function createMessage(username, message) {
    let template = `<div class="message">
    <span class="sender">${username}:</span>
    <span class="content">${message}</span>
    </div>`
    
    $messages.append(template)
}

function createGameOnList(gameID, username, state) {
    let template = `<li>
    <span class="game-name">Dono: ${username}</span>
    <span class="game-state">${state}</span>
    <button class="play-button" data-value="${gameID}">Jogar</button>
    </li>`

    if (state == GAME_STATUS.STARTED) {
        template = `<li>
        <span class="game-name">Dono: ${username}</span>
        <span class="game-state">${state}</span>
        </li>`
    }
    
    $games.append(template)
}

socket.on(LOGIN_EVENTS.USER_SIGNED_IN, (data) => {
    playerID = data.playerID
    $login.style.display = "none"
    $game.style.display = "none"
    $lobby.style.display = "block"
})

socket.on(COMMUNICATION_EVENTS.RECEIVE_MESSAGE, (data) => {
    if(playerID != "") {
        createMessage(data.username, data.message)
    }
})

socket.on(COMMUNICATION_EVENTS.UPDATE_GAMES, (data) => {
    $games.empty()
    data.games.forEach(element => {
        createGameOnList(element.gameID, element.username, element.gameState)
    });    
})

socket.on(COMMUNICATION_EVENTS.GO_TO_THE_GAME, (data) => {
    $login.style.display = "none"
    $game.style.display = "block"
    $lobby.style.display = "none"
    gameID = data.gameID
})

socket.on(COMMUNICATION_EVENTS.SEND_LOGIN_WARNINGS, (data) => {
    $loginWarnings.text(data.message)
})
