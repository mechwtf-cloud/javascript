const keys = ["W", "A", "S", "D", "Q", "E"];

let currentNote = null;
let speed = 3;
let gameRunning = false;
let paused = false;
let score = 0;
let animationFrameId = null;
let gameOverEl = null;

const game = document.getElementById("game");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const HIT_LINE_RATIO = 0.8;

function getHitLineY() {
  return game.clientHeight * HIT_LINE_RATIO;
}

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 60%)`;
}

function clearCurrentNote() {
  if (!currentNote) {
    return;
  }

  currentNote.element.remove();
  currentNote = null;
}

function spawnNote() {
  clearCurrentNote();

  const key = keys[Math.floor(Math.random() * keys.length)];
  const note = document.createElement("div");
  note.className = "note";
  note.textContent = key;
  note.style.color = randomColor();
  note.style.borderColor = randomColor();
  note.style.top = "0px";

  game.appendChild(note);

  currentNote = {
    element: note,
    key,
    y: 0
  };

  comboEl.textContent = `Hit ${key} on the line`;
}

function hideGameOver() {
  if (gameOverEl) {
    gameOverEl.remove();
    gameOverEl = null;
  }
}

function showGameOver() {
  hideGameOver();

  gameOverEl = document.createElement("div");
  gameOverEl.id = "gameOver";
  gameOverEl.textContent = "GAME OVER";
  document.body.appendChild(gameOverEl);
}

function stopLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function resetGame() {
  gameRunning = false;
  paused = false;
  stopLoop();
  clearCurrentNote();
  feedback.textContent = "MISS!";
  comboEl.textContent = "Press SPACE to try again";
  showGameOver();
}

function startGame() {
  hideGameOver();
  clearCurrentNote();
  gameRunning = true;
  paused = false;
  score = 0;
  speed = 3;
  scoreEl.textContent = "0";
  feedback.textContent = "GO!";
  comboEl.textContent = "Watch the lane";
  spawnNote();
  gameLoop();
}

function gameLoop() {
  if (!gameRunning || paused) {
    animationFrameId = null;
    return;
  }

  animationFrameId = requestAnimationFrame(gameLoop);
  speed += 0.002;

  if (!currentNote) {
    return;
  }

  currentNote.y += speed;
  currentNote.element.style.top = `${currentNote.y}px`;

  if (currentNote.y > game.clientHeight) {
    resetGame();
  }
}

function scoreNote(distance) {
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

  setTimeout(() => {
    feedback.style.color = "white";
  }, 100);

  scoreEl.textContent = String(score);
  spawnNote();
}

document.addEventListener("keydown", (e) => {
  if (!gameRunning && e.code === "Space") {
    e.preventDefault();
    startGame();
    return;
  }

  if (e.code === "KeyP" && gameRunning) {
    paused = !paused;
    feedback.textContent = paused ? "PAUSED" : "GO!";

    if (!paused && animationFrameId === null) {
      gameLoop();
    }
    return;
  }

  if (!gameRunning || !currentNote || paused) {
    return;
  }

  const key = e.key.toUpperCase();

  if (key !== currentNote.key) {
    return;
  }

  const distance = Math.abs(currentNote.y - getHitLineY());
  scoreNote(distance);
});
