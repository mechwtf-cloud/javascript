const keys = ["W","A","S","D","Q","E","R","F"];
let currentNote = null;
let noteY = 0;
let speed = 2;
let gameRunning = false;
let score = 0;

const game = document.getElementById("game");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");

function spawnNote() {
  const key = keys[Math.floor(Math.random() * keys.length)];

  const note = document.createElement("div");
  note.classList.add("note");
  note.textContent = key;

  game.appendChild(note);

  currentNote = {
    element: note,
    key: key,
    y: 0
  };
}

function gameLoop() {
  if (!gameRunning) return;

  if (currentNote) {
    currentNote.y += speed;
    currentNote.element.style.top = currentNote.y + "px";

    // too late = lose
    if (currentNote.y > 350) {
      feedback.textContent = "MISS!";
      resetGame();
      return;
    }
  }

  requestAnimationFrame(gameLoop);
}

function resetGame() {
  gameRunning = false;
  if (currentNote) currentNote.element.remove();
  currentNote = null;
}

document.addEventListener("keydown", (e) => {
  if (!gameRunning && e.code === "Space") {
    gameRunning = true;
    score = 0;
    scoreEl.textContent = score;
    feedback.textContent = "GO!";
    spawnNote();
    gameLoop();
    return;
  }

  if (!gameRunning || !currentNote) return;

  let key = e.key.toUpperCase();

  if (key === currentNote.key) {
    let distance = Math.abs(currentNote.y - 320);

    if (distance < 10) {
      feedback.textContent = "PERFECT!";
      score += 3;
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
