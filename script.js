const keys = ["W","A","S","D","Q","E","R","F"];

let currentNote = null;
let speed = 2;
let gameRunning = false;
let score = 0;
let spawnCooldown = 0;

const game = document.getElementById("game");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const GAME_HEIGHT = 650;
const HIT_LINE = GAME_HEIGHT - 120;


function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 60%)`;
}

function spawnNote() {
  const key = keys[Math.floor(Math.random() * keys.length)];

  const note = document.createElement("div");
  note.classList.add("note");
  note.textContent = key;

  note.style.color = randomColor();
  note.style.borderColor = randomColor();
  note.style.boxShadow = `0 0 15px ${randomColor()}`;

  game.appendChild(note);

  currentNote = {
    element: note,
    key: key,
    y: 0
  };
}

function gameLoop() {
  if (!gameRunning) return;

  requestAnimationFrame(gameLoop);

  // increase difficulty over time
  speed += 0.002;

  if (currentNote) {
    currentNote.y += speed;
    currentNote.element.style.top = currentNote.y + "px";

    if (currentNote.y > 350) {
      feedback.textContent = "MISS!";
      resetGame();
      return;
    }
  }
}
function resetGame() {
  gameRunning = false;

  if (currentNote) {
    currentNote.element.remove();
    currentNote = null;
  }

  feedback.textContent = "GAME OVER";

  // stop everything cleanly
  cancelAnimationFrame(gameLoopId);
}

function flashScreen(color) {
  document.body.style.background = color;
  setTimeout(() => document.body.style.background = "#111", 100);
}

document.addEventListener("keydown", (e) => {
  if (!gameRunning && e.code === "Space") {
    gameRunning = true;
    score = 0;
    speed = 2;

    scoreEl.textContent = score;
    feedback.textContent = "GO!";

    spawnNote();
    gameLoop();
    return;
  }

  if (!gameRunning || !currentNote) return;

  const key = e.key.toUpperCase();

  if (key === currentNote.key) {
    let distance = Math.abs(currentNote.y - HIT_LINE);

    if (distance < 10) {
      feedback.textContent = "PERFECT!";
      score += 3;
      flashScreen("#00ffcc");
    } else if (distance < 30) {
      feedback.textContent = "GOOD!";
      score += 1;
    } else {
      feedback.textContent = "EARLY!";
    }

    scoreEl.textContent = score;

    currentNote.element.remove();
    spawnNote();
  }
});
