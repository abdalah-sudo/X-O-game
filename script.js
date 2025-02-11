// تأكد من أنك تستخدم النسخة الحديثة من Firebase SDK (v9)
const firebaseConfig = {
    apiKey: "AIzaSyBQ3oIjeNRuMtdAFUgXjKEqhrMKQM3oTz0",
    authDomain: "x-o-game-36dbf.firebaseapp.com",
    projectId: "x-o-game-36dbf",
    storageBucket: "x-o-game-36dbf.firebasestorage.app",
    messagingSenderId: "877010275263",
    appId: "1:877010275263:web:d3870a8e8b81b1f19c6f0a",
    measurementId: "G-29SGJLL6TV"
};

// تهيئة Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

let gameId = null;
let playerSymbol = null;
let currentTurn = "X";
let searchAttempts = 0;
let playingWithBot = false;

const board = document.querySelectorAll(".cell");
const findMatchButton = document.getElementById("find-match");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");
const gameContainer = document.getElementById("game-container");
const loading = document.getElementById("loading");

findMatchButton.addEventListener("click", findMatch);

function findMatch() {
    searchAttempts++;
    findMatchButton.style.display = "none";
    loading.classList.remove("hidden");
    statusText.textContent = "جارٍ البحث عن لاعب... (محاولة " + searchAttempts + ")";

    setTimeout(() => {
        if (searchAttempts >= 3) {
            startBotGame("hard");
        } else {
            checkForMatch();
        }
    }, 3000);
}

function checkForMatch() {
    const matchRef = database.ref("matches");
    matchRef.once("value", (snapshot) => {
        const matches = snapshot.val();
        let availableGame = null;

        if (matches) {
            for (let key in matches) {
                if (matches[key].playerO === null) {
                    availableGame = key;
                    break;
                }
            }
        }

        if (availableGame) {
            joinGame(availableGame);
        } else {
            createGame();
        }
    });
}

function createGame() {
    gameId = "game_" + Date.now();
    playerSymbol = "X";
    database.ref(`matches/${gameId}`).set({
        board: ["", "", "", "", "", "", "", "", ""],
        playerX: true,
        playerO: null,
        turn: "X"
    });

    statusText.textContent = "في انتظار لاعب آخر...";
    database.ref(`matches/${gameId}/playerO`).on("value", (snapshot) => {
        if (snapshot.val() !== null) {
            startGame();
        }
    });
}

function joinGame(gameKey) {
    gameId = gameKey;
    playerSymbol = "O";
    database.ref(`matches/${gameId}/playerO`).set(true);
    startGame();
}

function startGame() {
    statusText.textContent = "تم العثور على لاعب! دور " + currentTurn;
    gameContainer.style.display = "block";
    loading.classList.add("hidden");

    board.forEach((cell) => {
        cell.addEventListener("click", handleMove);
    });

    database.ref(`matches/${gameId}/board`).on("value", (snapshot) => {
        const newBoard = snapshot.val();
        if (newBoard) {
            newBoard.forEach((value, index) => {
                board[index].textContent = value;
            });
        }
    });

    database.ref(`matches/${gameId}/turn`).on("value", (snapshot) => {
        currentTurn = snapshot.val();
        statusText.textContent = "دور " + currentTurn;
    });
}

function startBotGame(level) {
    playingWithBot = true;
    playerSymbol = "X";
    gameContainer.style.display = "block";
    loading.classList.add("hidden");
    statusText.textContent = "تلعب ضد بوت صعب";

    board.forEach((cell) => {
        cell.addEventListener("click", (event) => {
            if (event.target.textContent === "") {
                event.target.textContent = playerSymbol;
                if (!checkWin(playerSymbol) && !boardFull()) {
                    botMove(level);
                }
            }
        });
    });
}

function botMove(level) {
    let emptyCells = [...board].filter(cell => cell.textContent === "");
    let move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    move.textContent = "O";
}

function checkWin(player) {
    return false;
}

function boardFull() {
    return [...board].every(cell => cell.textContent !== "");
}