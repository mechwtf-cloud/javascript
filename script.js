const laneConfig = [
  { key: "Q", color: "#ff5e8f" },
  { key: "W", color: "#ff9f43" },
  { key: "E", color: "#ffd54a" },
  { key: "A", color: "#58e5a2" },
  { key: "S", color: "#53c7ff" },
  { key: "D", color: "#b88cff" }
];

const HIT_LINE_RATIO = 0.82;
const PERFECT_WINDOW = 28;
const GREAT_WINDOW = 56;
const GOOD_WINDOW = 96;
const MISS_WINDOW = 130;
const STARTING_LIVES = 8;

const scoreEl = document.getElementById("score");
const comboCountEl = document.getElementById("comboCount");
const bestComboEl = document.getElementById("bestCombo");
const livesEl = document.getElementById("lives");
const speedDisplayEl = document.getElementById("speedDisplay");
const feedbackEl = document.getElementById("feedback");
const comboTextEl = document.getElementById("comboText");
const laneKeysEl = document.getElementById("laneKeys");
const lanesEl = document.getElementById("lanes");
const notesEl = document.getElementById("notes");
const gameEl = document.getElementById("game");

const laneEls = [];
const laneKeyEls = [];
const laneFlashTimers = [];

let overlayEl = null;
let feedbackTimer = null;

const state = {
  running: false,
  paused: false,
  score: 0,
  combo: 0,
  bestCombo: 0,
  lives: STARTING_LIVES,
  baseSpeed: 460,
  currentSpeed: 460,
  spawnTimer: 0,
  elapsed: 0,
  lastFrameTime: 0,
  animationFrameId: null,
  notes: []
};

function buildBoard() {
  laneConfig.forEach((lane, laneIndex) => {
    const laneKeyEl = document.createElement("div");
    laneKeyEl.className = "lane-key";
    laneKeyEl.textContent = lane.key;
    laneKeyEl.style.setProperty("--lane-color", lane.color);
    laneKeysEl.appendChild(laneKeyEl);
    laneKeyEls.push(laneKeyEl);

    const laneEl = document.createElement("div");
    laneEl.className = "lane";
    laneEl.style.setProperty("--lane-color", lane.color);
    laneEl.dataset.laneIndex = String(laneIndex);
    lanesEl.appendChild(laneEl);
    laneEls.push(laneEl);
  });
}

function getHitLineY() {
  return gameEl.clientHeight * HIT_LINE_RATIO;
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  comboCountEl.textContent = String(state.combo);
  bestComboEl.textContent = String(state.bestCombo);
  livesEl.textContent = String(state.lives);
  speedDisplayEl.textContent = `${(state.currentSpeed / state.baseSpeed).toFixed(1)}x`;
}

function setStatus(title, detail, accent = "") {
  feedbackEl.textContent = title;
  feedbackEl.style.color = accent;
  comboTextEl.textContent = detail;
}

function flashJudgement(title, detail, accent) {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }

  setStatus(title, detail, accent);
  feedbackTimer = setTimeout(() => {
    feedbackEl.style.color = "";
  }, 180);
}

function flashLane(laneIndex) {
  const laneEl = laneEls[laneIndex];
  const laneKeyEl = laneKeyEls[laneIndex];

  clearTimeout(laneFlashTimers[laneIndex]);
  laneEl.classList.add("active");
  laneKeyEl.classList.add("active");

  laneFlashTimers[laneIndex] = setTimeout(() => {
    laneEl.classList.remove("active");
    laneKeyEl.classList.remove("active");
  }, 120);
}

function showOverlay(title, subtitle) {
  hideOverlay();

  overlayEl = document.createElement("div");
  overlayEl.id = "gameOver";
  overlayEl.innerHTML = `<div><h2>${title}</h2><p>${subtitle}</p></div>`;
  document.body.appendChild(overlayEl);
}

function hideOverlay() {
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
}

function stopLoop() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
}

function clearNotes() {
  state.notes.forEach((note) => {
    note.element.remove();
  });
  state.notes = [];
}

function positionNote(note) {
  note.element.style.transform = `translate3d(-50%, ${note.y}px, 0)`;
}

function spawnNote() {
  const laneIndex = Math.floor(Math.random() * laneConfig.length);
  const lane = laneConfig[laneIndex];
  const noteEl = document.createElement("div");

  noteEl.className = "note";
  noteEl.textContent = lane.key;
  noteEl.style.setProperty("--lane-color", lane.color);
  noteEl.style.setProperty("--x", `${((laneIndex + 0.5) * 100) / laneConfig.length}%`);
  notesEl.appendChild(noteEl);

  const note = {
    laneIndex,
    key: lane.key,
    y: -80,
    element: noteEl
  };

  positionNote(note);
  state.notes.push(note);
}

function removeNoteAt(noteIndex) {
  const [note] = state.notes.splice(noteIndex, 1);

  if (note) {
    note.element.remove();
  }

  return note;
}

function registerMiss(noteKey) {
  state.combo = 0;
  state.lives -= 1;
  updateHud();

  if (state.lives <= 0) {
    endGame();
    return;
  }

  flashJudgement("MISS", `${noteKey} slipped by. ${state.lives} lives left.`, "#ff7f9c");
}

function handleNoteMiss(noteIndex) {
  const note = removeNoteAt(noteIndex);

  if (note) {
    registerMiss(note.key);
  }
}

function scoreHit(noteIndex, distance) {
  const note = removeNoteAt(noteIndex);

  if (!note) {
    return;
  }

  let points = 0;
  let title = "GOOD";
  let accent = "#fff6b4";

  if (distance <= PERFECT_WINDOW) {
    points = 5;
    title = "PERFECT";
    accent = "#7ef9ff";
  } else if (distance <= GREAT_WINDOW) {
    points = 3;
    title = "GREAT";
    accent = "#9be38e";
  } else {
    points = 1;
  }

  state.score += points + Math.floor(state.combo / 6);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  updateHud();

  flashJudgement(title, `${state.combo} combo alive in the ${note.key} lane.`, accent);
}

function findClosestNoteInLane(laneIndex) {
  let result = null;

  for (let noteIndex = 0; noteIndex < state.notes.length; noteIndex += 1) {
    const note = state.notes[noteIndex];

    if (note.laneIndex !== laneIndex) {
      continue;
    }

    const distance = Math.abs(note.y - getHitLineY());

    if (!result || distance < result.distance) {
      result = { noteIndex, note, distance };
    }
  }

  return result;
}

function startGame() {
  hideOverlay();
  stopLoop();
  clearNotes();

  state.running = true;
  state.paused = false;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.lives = STARTING_LIVES;
  state.currentSpeed = state.baseSpeed;
  state.spawnTimer = 0;
  state.elapsed = 0;
  state.lastFrameTime = 0;

  updateHud();
  setStatus("GO", "Lock into the beat and keep the combo climbing.", "#7ef9ff");

  spawnNote();
  state.animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
  state.running = false;
  state.paused = false;
  stopLoop();
  clearNotes();
  updateHud();
  setStatus("ROUND OVER", `Final score ${state.score}. Best combo ${state.bestCombo}.`, "#ff90ae");
  showOverlay("Game Over", "Press SPACE to launch another run.");
}

function togglePause() {
  if (!state.running) {
    return;
  }

  state.paused = !state.paused;

  if (state.paused) {
    stopLoop();
    setStatus("PAUSED", "Press P to jump back in.", "#ffd36b");
    return;
  }

  state.lastFrameTime = 0;
  setStatus("GO", "Back in motion. Keep the streak alive.", "#7ef9ff");
  state.animationFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!state.running || state.paused) {
    state.animationFrameId = null;
    return;
  }

  if (!state.lastFrameTime) {
    state.lastFrameTime = timestamp;
  }

  const deltaTime = Math.min(0.05, (timestamp - state.lastFrameTime) / 1000);
  state.lastFrameTime = timestamp;
  state.elapsed += deltaTime;
  state.spawnTimer += deltaTime * 1000;
  state.currentSpeed = state.baseSpeed + state.elapsed * 48;

  const spawnInterval = Math.max(240, 760 - state.elapsed * 26);

  while (state.spawnTimer >= spawnInterval) {
    spawnNote();
    state.spawnTimer -= spawnInterval;
  }

  for (let noteIndex = state.notes.length - 1; noteIndex >= 0; noteIndex -= 1) {
    const note = state.notes[noteIndex];
    note.y += state.currentSpeed * deltaTime;
    positionNote(note);

    if (note.y > getHitLineY() + MISS_WINDOW) {
      handleNoteMiss(noteIndex);

      if (!state.running) {
        break;
      }
    }
  }

  updateHud();

  if (state.running && !state.paused) {
    state.animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    state.animationFrameId = null;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();

    if (!state.running) {
      startGame();
    }
    return;
  }

  if (event.code === "KeyP") {
    togglePause();
    return;
  }

  const key = event.key.toUpperCase();
  const laneIndex = laneConfig.findIndex((lane) => lane.key === key);

  if (laneIndex === -1) {
    return;
  }

  flashLane(laneIndex);

  if (!state.running || state.paused) {
    return;
  }

  const target = findClosestNoteInLane(laneIndex);

  if (!target) {
    state.combo = 0;
    updateHud();
    flashJudgement("EMPTY", `${key} lane is clear. Wait for the note.`, "#f7b0ff");
    return;
  }

  if (target.distance > MISS_WINDOW) {
    state.combo = 0;
    updateHud();
    flashJudgement("TOO SOON", `${key} was not close enough to the line.`, "#ffb347");
    return;
  }

  scoreHit(target.noteIndex, target.distance);
});

buildBoard();
updateHud();
showOverlay("Press Space", "Use Q, W, E, A, S, and D. Press P any time to pause.");
