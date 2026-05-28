// ─── Canvas Setup ───────────────────────────────────────────────
const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

const CELL_SIZE = 20;
const cols = canvas.width / CELL_SIZE;
const rows = canvas.height / CELL_SIZE;

// ─── Game State ─────────────────────────────────────────────────
let snake, direction, nextDirection, food, score;
let gameRunning = false;
let gameStarted = false;
let gamePaused  = false;
let gameMode    = "easy";
let gameInterval;

// ─── Initialisation ─────────────────────────────────────────────
function initState() {
    snake         = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    direction     = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    food          = randomFood();
    score         = 0;
}

// ─── Food ────────────────────────────────────────────────────────
function randomFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// ─── Movement & Collision ────────────────────────────────────────
function moveSnake() {
    direction = nextDirection;

    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (gameMode === "easy") {
        newHead.x = (newHead.x + cols) % cols;
        newHead.y = (newHead.y + rows) % rows;
    } else {
        if (newHead.x < 0 || newHead.x >= cols ||
            newHead.y < 0 || newHead.y >= rows) {
            triggerGameOver();
            return;
        }
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        food = randomFood();
        score++;
        updateSpeed();
    } else {
        snake.pop();
    }

    if (checkSelfCollision()) {
        triggerGameOver();
    }
}

function checkSelfCollision() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y)
            return true;
    }
    return false;
}

function updateSpeed() {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, Math.max(80, 300 - score * 10));
}

// ─── Game Flow ───────────────────────────────────────────────────
function startGame() {
    initState();
    gameRunning = true;
    gameStarted = true;
    gamePaused  = false;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 300);
}

function triggerGameOver() {
    gameRunning = false;
    drawGameOver();
}

function togglePause() {
    if (!gameStarted || !gameRunning) return;
    gamePaused = !gamePaused;
    if (gamePaused) drawPauseScreen();
}

function goToMainMenu() {
    gameRunning = false;
    gameStarted = false;
    gamePaused = false;
    clearInterval(gameInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawStartScreen();
    gameInterval = setInterval(gameLoop, 300);
}

// ─── Input ───────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "r": case "R": startGame(); break;
        case "p": case "P": togglePause(); break;
        case "e": case "E": gameMode = "easy"; break;
        case "h": case "H": gameMode = "hard"; break;
        case "ArrowUp":    if (direction.y !== 1)  nextDirection = {x: 0, y: -1}; break;
        case "ArrowDown":  if (direction.y !== -1) nextDirection = {x: 0, y: 1};  break;
        case "ArrowLeft":  if (direction.x !== 1)  nextDirection = {x: -1, y: 0}; break;
        case "ArrowRight": if (direction.x !== -1) nextDirection = {x: 1, y: 0};  break;
        case "Escape": goToMainMenu(); break;
    }
});

// ─── Drawing ─────────────────────────────────────────────────────
function drawGrid() {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < cols; x++)
        for (let y = 0; y < rows; y++)
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#005500" : "#00aa00";
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Mode: " + gameMode, 10, 40);
}

function drawStartScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px Arial";
    ctx.fillText("SNAKE", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Start",       canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText("E = Easy (wraparound)",  canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText("H = Hard (walls)",       canvas.width / 2, canvas.height / 2 + 65);
    ctx.fillText("P = Pause",              canvas.width / 2, canvas.height / 2 + 90);
    ctx.fillText("E / H to change mode", canvas.width / 2, canvas.height / 2 + 115);
}

function drawPauseScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score,      canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Press R to restart",   canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText("Press Esc for menu", canvas.width / 2, canvas.height / 2 + 75);
}

// ─── Game Loop ───────────────────────────────────────────────────
function gameLoop() {
    if (!gameStarted || !gameRunning || gamePaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    moveSnake();
    drawSnake();
    drawFood();
    drawScore();
}

// ─── Boot ────────────────────────────────────────────────────────
drawGrid();
drawStartScreen();
gameInterval = setInterval(gameLoop, 300);