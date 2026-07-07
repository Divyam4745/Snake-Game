/* ===========================================
   DOM ELEMENTS
=========================================== */

const board = document.getElementById("board");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const timerElement = document.getElementById("timer");

const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScore = document.getElementById("finalScore");


/* ===========================================
   BOARD SETTINGS
=========================================== */

const ROWS = 15;
const COLS = 20;

const TOTAL_CELLS = ROWS * COLS;

let cells = [];


/* ===========================================
   GAME VARIABLES
=========================================== */

let snake = [
    { x: 7, y: 5 }
];

let food = {};

let direction = "RIGHT";
let nextDirection = "RIGHT";

let score = 0;

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

highScoreElement.textContent = highScore;

let speed = 180;

let gameLoop = null;
let timerLoop = null;

let elapsedSeconds = 0;

let gameStarted = false;
let paused = false;


/* ===========================================
   CREATE BOARD
=========================================== */

function createBoard() {

    board.innerHTML = "";

    cells = [];

    for (let i = 0; i < TOTAL_CELLS; i++) {

        const cell = document.createElement("div");

        cell.classList.add("cell");

        board.appendChild(cell);

        cells.push(cell);

    }

}


/* ===========================================
   GET CELL INDEX
=========================================== */

function getIndex(x, y) {

    return x * COLS + y;

}


/* ===========================================
   DRAW GAME
=========================================== */

function drawGame() {

    cells.forEach(cell => {

        cell.className = "cell";

    });

    // Draw Food

    cells[getIndex(food.x, food.y)]
        .classList.add("food");


    // Draw Snake

    snake.forEach((part, index) => {

        const cell = cells[getIndex(part.x, part.y)];

        if (!cell) return;

        cell.classList.add("snake");

        if (index === 0) {

            cell.classList.add("head");

        }

    });

}


/* ===========================================
   RANDOM FOOD
=========================================== */

function createFood() {

    while (true) {

        const randomX =
            Math.floor(Math.random() * ROWS);

        const randomY =
            Math.floor(Math.random() * COLS);

        const insideSnake =
            snake.some(segment =>
                segment.x === randomX &&
                segment.y === randomY
            );

        if (!insideSnake) {

            food = {

                x: randomX,

                y: randomY

            };

            break;

        }

    }

}


/* ===========================================
   UPDATE SCORE
=========================================== */

function updateScore() {

    scoreElement.textContent = score;

    if (score > highScore) {

        highScore = score;

        highScoreElement.textContent = highScore;

        localStorage.setItem(
            "snakeHighScore",
            highScore
        );

    }

}


/* ===========================================
   TIMER
=========================================== */

function startTimer() {

    clearInterval(timerLoop);

    elapsedSeconds = 0;

    timerElement.textContent = "00:00";

    timerLoop = setInterval(() => {

        elapsedSeconds++;

        const minutes = String(
            Math.floor(elapsedSeconds / 60)
        ).padStart(2, "0");

        const seconds = String(
            elapsedSeconds % 60
        ).padStart(2, "0");

        timerElement.textContent =
            `${minutes}:${seconds}`;

    }, 1000);

}


/* ===========================================
   RESET GAME
=========================================== */

function resetGame() {

    score = 0;

    speed = 180;

    direction = "RIGHT";

    nextDirection = "RIGHT";

    paused = false;

    snake = [

        { x: 7, y: 5 }

    ];

    updateScore();

    createFood();

    drawGame();

}


/* ===========================================
   START GAME
=========================================== */

function startGame() {

    resetGame();

    startModal.classList.add("hidden");

    gameOverModal.classList.add("hidden");

    startTimer();

    gameStarted = true;

    // Game loop starts in Part 2

}


/* ===========================================
   BUTTON EVENTS
=========================================== */

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", startGame);


/* ===========================================
   INITIALIZE
=========================================== */

createBoard();

createFood();

drawGame();
/* ===========================================
   MOVE SNAKE
=========================================== */

function moveSnake() {

    direction = nextDirection;

    const head = {
        ...snake[0]
    };

    switch (direction) {

        case "UP":
            head.x--;
            break;

        case "DOWN":
            head.x++;
            break;

        case "LEFT":
            head.y--;
            break;

        case "RIGHT":
            head.y++;
            break;

    }

    /* ===========================
       WALL COLLISION
    =========================== */

    if (
        head.x < 0 ||
        head.x >= ROWS ||
        head.y < 0 ||
        head.y >= COLS
    ) {
        gameOver();
        return;
    }

    /* ===========================
       SELF COLLISION
    =========================== */

    if (
        snake.some(segment =>
            segment.x === head.x &&
            segment.y === head.y
        )
    ) {
        gameOver();
        return;
    }

    snake.unshift(head);

    /* ===========================
       FOOD
    =========================== */

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score += 10;

        updateScore();

        createFood();

        /* Increase speed every 50 points */

        if (score % 50 === 0 && speed > 60) {

            speed -= 15;

            clearInterval(gameLoop);

            gameLoop = setInterval(moveSnake, speed);

        }

    } else {

        snake.pop();

    }

    drawGame();

}

/* ===========================================
   GAME OVER
=========================================== */

function gameOver() {

    clearInterval(gameLoop);

    clearInterval(timerLoop);

    gameStarted = false;

    finalScore.textContent = score;

    gameOverModal.classList.remove("hidden");

}

/* ===========================================
   START GAME OVERRIDE
=========================================== */

const oldStartGame = startGame;

startGame = function () {

    oldStartGame();

    clearInterval(gameLoop);

    gameLoop = setInterval(moveSnake, speed);

};

/* ===========================================
   PAUSE / RESUME
=========================================== */

function togglePause() {

    if (!gameStarted) return;

    paused = !paused;

    if (paused) {

        clearInterval(gameLoop);

        clearInterval(timerLoop);

    } else {

        gameLoop = setInterval(moveSnake, speed);

        timerLoop = setInterval(() => {

            elapsedSeconds++;

            const minutes = String(
                Math.floor(elapsedSeconds / 60)
            ).padStart(2, "0");

            const seconds = String(
                elapsedSeconds % 60
            ).padStart(2, "0");

            timerElement.textContent =
                `${minutes}:${seconds}`;

        }, 1000);

    }

}

/* ===========================================
   KEYBOARD CONTROLS
=========================================== */

document.addEventListener("keydown", function (e) {

    const key = e.key.toLowerCase();

    if (key === " ") {

        e.preventDefault();

        togglePause();

        return;

    }

    switch (key) {

        case "arrowup":
        case "w":

            if (direction !== "DOWN")
                nextDirection = "UP";

            break;

        case "arrowdown":
        case "s":

            if (direction !== "UP")
                nextDirection = "DOWN";

            break;

        case "arrowleft":
        case "a":

            if (direction !== "RIGHT")
                nextDirection = "LEFT";

            break;

        case "arrowright":
        case "d":

            if (direction !== "LEFT")
                nextDirection = "RIGHT";

            break;

    }

});

/* ===========================================
   DRAW INITIAL STATE
=========================================== */

drawGame();