const keys = ["W","A","S","D","Q","E"];

let currentNote = null;
let speed = 3;
let gameRunning = false;
let paused = false;
let score = 0;

const game = document.getElementById("game");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const gameHeight = game.clientHeight;
const HIT_LINE = gameHeight * 0.8;
const HIT_LINE_RATIO = 0.8;
const hitLineY = game.clientHeight * HIT_LINE_RATIO;

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

  game.appendChild(note);

  currentNote = {
    element: note,
    key,
    y: 0
  };
}

function showGameOver() {
  const div = document.createElement("div");
  div.id = "gameOver";
  div.textContent = "GAME OVER";
  document.body.appendChild(div);
}

function resetGame() {
  gameRunning = false;

  if (currentNote) {
    currentNote.element.remove();
    currentNote = null;
  }

  showGameOver();
}

function gameLoop() {
  if (!gameRunning || paused) return;

  requestAnimationFrame(gameLoop);

  speed += 0.002;

  if (currentNote) {
    currentNote.y += speed;
    currentNote.element.style.top = currentNote.y + "px";

    if (currentNote.y > window.innerHeight) {
      feedback.textContent = "MISS!";
      resetGame();
      return;
    }
  }
}

document.addEventListener("keydown", (e) => {
  document.addEventListener("keydown", (e) => {
    console.log(e.code);
  /* ▶ START GAME */
  if (!gameRunning && e.code === "Space") {
    gameRunning = true;
    score = 0;
    speed = 3;

    scoreEl.textContent = score;
    feedback.textContent = "GO!";

    spawnNote();
    gameLoop();
    return;
  }

  /* ⏸ PAUSE */
  if (e.code === "KeyP") {
    paused = !paused;
    feedback.textContent = paused ? "PAUSED" : "GO!";
    if (!paused) gameLoop();
    return;
  }

  if (!gameRunning || !currentNote || paused) return;

  const key = e.key.toUpperCase();

 if (key === currentNote.key) {
  let distance = Math.abs(currentNote.y - HIT_LINE);

  if (distance < 20) {
    feedback.textContent = "PERFECT!";
    feedback.style.color = "cyan";
    score += 3;
  } else if (distance < 50) {
    feedback.textContent = "GOOD!";
    feedback.style.color = "white";
    score += 1;
  } else {
    feedback.textContent = "EARLY!";
    feedback.style.color = "orange";
  }

  setTimeout(() => feedback.style.color = "white", 100);

  scoreEl.textContent = score;

  currentNote.element.remove();
  spawnNote();
}
    scoreEl.textContent = score;

    currentNote.element.remove();
    spawnNote();
  }
});
