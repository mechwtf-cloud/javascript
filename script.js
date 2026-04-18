const views = {
  menu: document.getElementById("menuView"),
  rhythm: document.getElementById("rhythmView"),
  typing: document.getElementById("typingView")
};

const viewTitles = {
  menu: "Choose a mode",
  rhythm: "Pulse Grid",
  typing: "Word Rush"
};

const viewLabelEl = document.getElementById("viewLabel");
const menuButtonEl = document.getElementById("menuButton");
const modeButtons = document.querySelectorAll("[data-view]");

let activeView = "menu";

const laneConfig = [

  { key: "W", color: "#ff8f66" },
  { key: "A", color: "#ffd85e" },
  { key: "S", color: "#55f0d5" },
  { key: "D", color: "#71a8ff" }

];

const rhythmEls = {
  score: document.getElementById("rhythmScore"),
  combo: document.getElementById("rhythmComboCount"),
  bestCombo: document.getElementById("rhythmBestCombo"),
  keySet: document.getElementById("rhythmKeySet"),
  speed: document.getElementById("rhythmSpeedDisplay"),
  feedback: document.getElementById("rhythmFeedback"),
  hint: document.getElementById("rhythmComboText"),
  laneKeys: document.getElementById("laneKeys"),
  lanes: document.getElementById("lanes"),
  notes: document.getElementById("notes"),
  game: document.getElementById("rhythmGame"),
  overlay: document.getElementById("rhythmOverlay"),
  overlayTitle: document.getElementById("rhythmOverlayTitle"),
  overlayText: document.getElementById("rhythmOverlayText")
};

const RHYTHM_HIT_LINE_RATIO = 0.82;
const RHYTHM_PERFECT_WINDOW = 44;
const RHYTHM_GREAT_WINDOW = 84;
const RHYTHM_MISS_WINDOW = 176;

const rhythmLaneEls = [];
const rhythmLaneKeyEls = [];
const rhythmLaneFlashTimers = [];
let rhythmFeedbackTimer = null;
let rhythmAudioContext = null;

const rhythmState = {
  running: false,
  paused: false,
  score: 0,
  combo: 0,
  bestCombo: 0,
  baseSpeed: 320,
  currentSpeed: 320,
  spawnTimer: 0,
  elapsed: 0,
  lastFrameTime: 0,
  animationFrameId: null,
  notes: []
};

const typingEls = {
  time: document.getElementById("typingTime"),
  wpm: document.getElementById("typingWpm"),
  accuracy: document.getElementById("typingAccuracy"),
  progress: document.getElementById("typingProgress"),
  errors: document.getElementById("typingErrors"),
  feedback: document.getElementById("typingFeedback"),
  hint: document.getElementById("typingHint"),
  prompt: document.getElementById("typingPrompt"),
  input: document.getElementById("typingInput"),
  newText: document.getElementById("typingNewTextButton"),
  reset: document.getElementById("typingResetButton")
};

const typingPassages = [
  "Neon rain paints the sidewalk while arcade lights pulse against the night.",
  "Fast fingers win the round when every word lands cleanly and without panic.",
  "A tiny browser game can feel surprisingly alive when motion and feedback click together.",
  "Push your rhythm, trust your timing, and let the scoreboard reward steady hands.",
  "Typing quickly is less about rushing and more about staying smooth through every sentence."
];

const typingState = {
  text: "",
  active: false,
  finished: false,
  startTime: 0,
  elapsedMs: 0,
  frameId: null,
  lastTextIndex: -1
};

function showView(viewName) {
  activeView = viewName;

  Object.entries(views).forEach(([name, element]) => {
    element.classList.toggle("active", name === viewName);
  });

  viewLabelEl.textContent = viewTitles[viewName];
  menuButtonEl.classList.toggle("hidden", viewName === "menu");

  if (viewName !== "rhythm") {
    resetRhythmMode();
  }

  if (viewName === "typing") {
    setupTypingRound(true);
  } else {
    pauseTypingClock();
    typingEls.input.blur();
  }
}

function returnToMenu() {
  showView("menu");
}

function buildRhythmBoard() {
  rhythmEls.laneKeys.style.setProperty("--lane-count", laneConfig.length);
  rhythmEls.lanes.style.setProperty("--lane-count", laneConfig.length);
  rhythmEls.keySet.textContent = laneConfig.map((lane) => lane.key).join("");

  laneConfig.forEach((lane, laneIndex) => {
    const laneKeyEl = document.createElement("div");
    laneKeyEl.className = "lane-key";
    laneKeyEl.textContent = lane.key;
    laneKeyEl.style.setProperty("--lane-color", lane.color);
    rhythmEls.laneKeys.appendChild(laneKeyEl);
    rhythmLaneKeyEls.push(laneKeyEl);

    const laneEl = document.createElement("div");
    laneEl.className = "lane";
    laneEl.style.setProperty("--lane-color", lane.color);
    laneEl.dataset.laneIndex = String(laneIndex);
    rhythmEls.lanes.appendChild(laneEl);
    rhythmLaneEls.push(laneEl);
  });
}

function getRhythmHitLineY() {
  return rhythmEls.game.clientHeight * RHYTHM_HIT_LINE_RATIO;
}

function updateRhythmHud() {
  rhythmEls.score.textContent = String(rhythmState.score);
  rhythmEls.combo.textContent = String(rhythmState.combo);
  rhythmEls.bestCombo.textContent = String(rhythmState.bestCombo);
  rhythmEls.speed.textContent = `${(rhythmState.currentSpeed / rhythmState.baseSpeed).toFixed(1)}x`;
}

function setRhythmStatus(title, detail, accent = "") {
  rhythmEls.feedback.textContent = title;
  rhythmEls.feedback.style.color = accent;
  rhythmEls.hint.textContent = detail;
}

function flashRhythmJudgement(title, detail, accent) {
  if (rhythmFeedbackTimer) {
    clearTimeout(rhythmFeedbackTimer);
  }

  setRhythmStatus(title, detail, accent);
  rhythmFeedbackTimer = setTimeout(() => {
    rhythmEls.feedback.style.color = "";
  }, 180);
}

function flashRhythmLane(laneIndex) {
  const laneEl = rhythmLaneEls[laneIndex];
  const laneKeyEl = rhythmLaneKeyEls[laneIndex];

  clearTimeout(rhythmLaneFlashTimers[laneIndex]);
  laneEl.classList.add("active");
  laneKeyEl.classList.add("active");

  rhythmLaneFlashTimers[laneIndex] = setTimeout(() => {
    laneEl.classList.remove("active");
    laneKeyEl.classList.remove("active");
  }, 120);
}

function pulseElement(element, className, duration = 260) {
  if (!element) {
    return;
  }

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);

  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

function getRhythmAudioContext() {
  if (rhythmAudioContext) {
    if (rhythmAudioContext.state === "suspended") {
      rhythmAudioContext.resume();
    }
    return rhythmAudioContext;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  rhythmAudioContext = new AudioContextCtor();

  if (rhythmAudioContext.state === "suspended") {
    rhythmAudioContext.resume();
  }

  return rhythmAudioContext;
}

function playRhythmTone(kind) {
  const audioContext = getRhythmAudioContext();

  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  const toneMap = {
    perfect: { frequency: 740, type: "triangle", gain: 0.085, decay: 0.22 },
    great: { frequency: 620, type: "triangle", gain: 0.07, decay: 0.18 },
    good: { frequency: 520, type: "sine", gain: 0.055, decay: 0.14 },
    miss: { frequency: 210, type: "sawtooth", gain: 0.04, decay: 0.12 }
  };

  const config = toneMap[kind] || toneMap.good;

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(90, config.frequency * (kind === "miss" ? 0.72 : 1.24)),
    now + config.decay
  );

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(config.gain, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + config.decay);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + config.decay + 0.03);
}

function spawnRhythmBurst(laneIndex, kind) {
  const lane = laneConfig[laneIndex];

  if (!lane) {
    return;
  }

  const burst = document.createElement("div");
  burst.className = `hit-burst hit-burst-${kind}`;
  burst.style.setProperty("--burst-color", lane.color);
  burst.style.setProperty("--x", `${((laneIndex + 0.5) * 100) / laneConfig.length}%`);
  burst.style.setProperty("--y", `${getRhythmHitLineY()}px`);
  rhythmEls.game.appendChild(burst);

  burst.addEventListener("animationend", () => {
    burst.remove();
  });
}

function triggerRhythmImpact(kind, laneIndex) {
  const boardImpactClass = `impact-${kind}`;
  pulseElement(rhythmEls.game, boardImpactClass, 320);
  pulseElement(rhythmEls.feedback, "impact-text", 260);
  pulseElement(rhythmEls.score.closest(".stat-card"), "impact-card", 280);
  pulseElement(rhythmLaneEls[laneIndex], "impact", 240);
  pulseElement(rhythmLaneKeyEls[laneIndex], "impact", 240);
  spawnRhythmBurst(laneIndex, kind);
  playRhythmTone(kind);

  if (navigator.vibrate) {
    navigator.vibrate(kind === "perfect" ? 14 : kind === "miss" ? 18 : 10);
  }
}

function showRhythmOverlay(title, text) {
  rhythmEls.overlay.classList.remove("hidden");
  rhythmEls.overlayTitle.textContent = title;
  rhythmEls.overlayText.textContent = text;
}

function hideRhythmOverlay() {
  rhythmEls.overlay.classList.add("hidden");
}

function stopRhythmLoop() {
  if (rhythmState.animationFrameId !== null) {
    cancelAnimationFrame(rhythmState.animationFrameId);
    rhythmState.animationFrameId = null;
  }
}

function clearRhythmNotes() {
  rhythmState.notes.forEach((note) => {
    note.element.remove();
  });
  rhythmState.notes = [];
}

function positionRhythmNote(note) {
  note.element.style.transform = `translate3d(-50%, ${note.y}px, 0)`;
}

function spawnRhythmNote() {
  const laneIndex = Math.floor(Math.random() * laneConfig.length);
  const lane = laneConfig[laneIndex];
  const noteEl = document.createElement("div");

  noteEl.className = "note";
  noteEl.textContent = lane.key;
  noteEl.style.setProperty("--lane-color", lane.color);
  noteEl.style.setProperty("--x", `${((laneIndex + 0.5) * 100) / laneConfig.length}%`);
  rhythmEls.notes.appendChild(noteEl);

  const note = {
    laneIndex,
    key: lane.key,
    y: -80,
    element: noteEl
  };

  positionRhythmNote(note);
  rhythmState.notes.push(note);
}

function removeRhythmNoteAt(noteIndex) {
  const [note] = rhythmState.notes.splice(noteIndex, 1);

  if (note) {
    note.element.remove();
  }

  return note;
}

function registerRhythmMiss(note) {
  rhythmState.combo = 0;
  updateRhythmHud();
  flashRhythmJudgement("MISS", `${note.key} slipped by. No lives to lose, just catch the next beat.`, "#ff9cc0");
  triggerRhythmImpact("miss", note.laneIndex);
}

function handleRhythmMiss(noteIndex) {
  const note = removeRhythmNoteAt(noteIndex);

  if (note) {
    registerRhythmMiss(note);
  }
}

function scoreRhythmHit(noteIndex, distance) {
  const note = removeRhythmNoteAt(noteIndex);

  if (!note) {
    return;
  }

  let points = 1;
  let title = "GOOD";
  let accent = "#fff6b4";
  let impactKind = "good";

  if (distance <= RHYTHM_PERFECT_WINDOW) {
    points = 5;
    title = "PERFECT";
    accent = "#7ef9ff";
    impactKind = "perfect";
  } else if (distance <= RHYTHM_GREAT_WINDOW) {
    points = 3;
    title = "GREAT";
    accent = "#9be38e";
    impactKind = "great";
  }

  rhythmState.score += points + Math.floor(rhythmState.combo / 6);
  rhythmState.combo += 1;
  rhythmState.bestCombo = Math.max(rhythmState.bestCombo, rhythmState.combo);
  updateRhythmHud();

  flashRhythmJudgement(title, `${rhythmState.combo} combo alive in the ${note.key} lane.`, accent);
  triggerRhythmImpact(impactKind, note.laneIndex);
}

function findClosestRhythmNote(laneIndex) {
  let result = null;

  for (let noteIndex = 0; noteIndex < rhythmState.notes.length; noteIndex += 1) {
    const note = rhythmState.notes[noteIndex];

    if (note.laneIndex !== laneIndex) {
      continue;
    }

    const distance = Math.abs(note.y - getRhythmHitLineY());

    if (!result || distance < result.distance) {
      result = { noteIndex, distance };
    }
  }

  return result;
}

function startRhythmGame() {
  hideRhythmOverlay();
  stopRhythmLoop();
  clearRhythmNotes();

  rhythmState.running = true;
  rhythmState.paused = false;
  rhythmState.score = 0;
  rhythmState.combo = 0;
  rhythmState.bestCombo = 0;
  rhythmState.currentSpeed = rhythmState.baseSpeed;
  rhythmState.spawnTimer = 0;
  rhythmState.elapsed = 0;
  rhythmState.lastFrameTime = 0;

  updateRhythmHud();
  setRhythmStatus("GO", "Easy mode is live. Float through the neon lanes and keep the combo climbing.", "#7ef9ff");
  spawnRhythmNote();
  rhythmState.animationFrameId = requestAnimationFrame(runRhythmLoop);
}

function toggleRhythmPause() {
  if (!rhythmState.running) {
    return;
  }

  rhythmState.paused = !rhythmState.paused;

  if (rhythmState.paused) {
    stopRhythmLoop();
    setRhythmStatus("PAUSED", "Press P to jump back in.", "#ffd36b");
    showRhythmOverlay("Paused", "Press P to continue or Back to Menu to switch games.");
    return;
  }

  hideRhythmOverlay();
  rhythmState.lastFrameTime = 0;
  setRhythmStatus("GO", "Back in motion. Keep the streak alive.", "#7ef9ff");
  rhythmState.animationFrameId = requestAnimationFrame(runRhythmLoop);
}

function resetRhythmMode() {
  rhythmState.running = false;
  rhythmState.paused = false;
  stopRhythmLoop();
  clearRhythmNotes();
  rhythmState.score = 0;
  rhythmState.combo = 0;
  rhythmState.bestCombo = 0;
  rhythmState.currentSpeed = rhythmState.baseSpeed;
  rhythmState.spawnTimer = 0;
  rhythmState.elapsed = 0;
  rhythmState.lastFrameTime = 0;
  updateRhythmHud();
  setRhythmStatus("Ready", "W, A, S, and D only. No lives, no pressure, just flow.", "");
  showRhythmOverlay("Pulse Grid", "Press SPACE to launch an endless easy run.");
}

function runRhythmLoop(timestamp) {
  if (!rhythmState.running || rhythmState.paused || activeView !== "rhythm") {
    rhythmState.animationFrameId = null;
    return;
  }

  if (!rhythmState.lastFrameTime) {
    rhythmState.lastFrameTime = timestamp;
  }

  const deltaTime = Math.min(0.05, (timestamp - rhythmState.lastFrameTime) / 1000);
  rhythmState.lastFrameTime = timestamp;
  rhythmState.elapsed += deltaTime;
  rhythmState.spawnTimer += deltaTime * 1000;
  rhythmState.currentSpeed = rhythmState.baseSpeed + rhythmState.elapsed * 18;

  const spawnInterval = Math.max(540, 980 - rhythmState.elapsed * 18);

  while (rhythmState.spawnTimer >= spawnInterval) {
    spawnRhythmNote();
    rhythmState.spawnTimer -= spawnInterval;
  }

  for (let noteIndex = rhythmState.notes.length - 1; noteIndex >= 0; noteIndex -= 1) {
    const note = rhythmState.notes[noteIndex];
    note.y += rhythmState.currentSpeed * deltaTime;
    positionRhythmNote(note);

    if (note.y > getRhythmHitLineY() + RHYTHM_MISS_WINDOW) {
      handleRhythmMiss(noteIndex);
    }
  }

  updateRhythmHud();

  if (rhythmState.running && !rhythmState.paused) {
    rhythmState.animationFrameId = requestAnimationFrame(runRhythmLoop);
  } else {
    rhythmState.animationFrameId = null;
  }
}

function updateTypingStats(correctChars = 0, typedLength = 0) {
  const minutes = typingState.elapsedMs / 60000;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy = typedLength > 0 ? Math.round((correctChars / typedLength) * 100) : 100;
  const progress = typingState.text ? Math.round((typedLength / typingState.text.length) * 100) : 0;

  typingEls.time.textContent = `${(typingState.elapsedMs / 1000).toFixed(1)}s`;
  typingEls.wpm.textContent = String(wpm);
  typingEls.accuracy.textContent = `${accuracy}%`;
  typingEls.progress.textContent = `${Math.min(progress, 100)}%`;
  typingEls.errors.textContent = String(Math.max(typedLength - correctChars, 0));
}

function setTypingStatus(title, detail, accent = "") {
  typingEls.feedback.textContent = title;
  typingEls.feedback.style.color = accent;
  typingEls.hint.textContent = detail;
}

function renderTypingPrompt(typedValue) {
  let correctChars = 0;

  [...typingEls.prompt.children].forEach((charEl, index) => {
    const expectedChar = typingState.text[index];
    const typedChar = typedValue[index];

    charEl.className = "char";

    if (typedChar == null) {
      if (index === typedValue.length) {
        charEl.classList.add("current");
      }
      return;
    }

    if (typedChar === expectedChar) {
      charEl.classList.add("correct");
      correctChars += 1;
    } else {
      charEl.classList.add("incorrect");
    }

    if (index === typedValue.length) {
      charEl.classList.add("current");
    }
  });

  updateTypingStats(correctChars, typedValue.length);
  return correctChars;
}

function chooseTypingPassage() {
  let nextIndex = Math.floor(Math.random() * typingPassages.length);

  if (typingPassages.length > 1) {
    while (nextIndex === typingState.lastTextIndex) {
      nextIndex = Math.floor(Math.random() * typingPassages.length);
    }
  }

  typingState.lastTextIndex = nextIndex;
  return typingPassages[nextIndex];
}

function renderTypingText() {
  typingEls.prompt.innerHTML = "";

  [...typingState.text].forEach((character) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = character;
    typingEls.prompt.appendChild(span);
  });
}

function pauseTypingClock() {
  if (typingState.frameId !== null) {
    cancelAnimationFrame(typingState.frameId);
    typingState.frameId = null;
  }
}

function runTypingClock(now) {
  if (!typingState.active) {
    typingState.frameId = null;
    return;
  }

  typingState.elapsedMs = now - typingState.startTime;
  const typedValue = typingEls.input.value;
  const correctChars = renderTypingPrompt(typedValue);
  updateTypingStats(correctChars, typedValue.length);
  typingState.frameId = requestAnimationFrame(runTypingClock);
}

function setupTypingRound(selectNewText) {
  pauseTypingClock();

  if (selectNewText || !typingState.text) {
    typingState.text = chooseTypingPassage();
  }

  typingState.active = false;
  typingState.finished = false;
  typingState.startTime = 0;
  typingState.elapsedMs = 0;

  typingEls.input.value = "";
  typingEls.input.maxLength = typingState.text.length;
  typingEls.input.readOnly = false;
  renderTypingText();
  renderTypingPrompt("");
  setTypingStatus("Ready", "Start typing and the timer will begin on your first key.", "");

  if (activeView === "typing") {
    setTimeout(() => {
      typingEls.input.focus();
    }, 0);
  }
}

function startTypingClock() {
  if (typingState.active || typingState.finished) {
    return;
  }

  typingState.active = true;
  typingState.startTime = performance.now() - typingState.elapsedMs;
  setTypingStatus("GO", "Stay smooth. Speed matters, but clean typing wins.", "#ffcf7f");
  typingState.frameId = requestAnimationFrame(runTypingClock);
}

function finishTypingRound() {
  typingState.active = false;
  typingState.finished = true;
  pauseTypingClock();

  const typedValue = typingEls.input.value;
  const correctChars = renderTypingPrompt(typedValue);
  updateTypingStats(correctChars, typedValue.length);

  const minutes = typingState.elapsedMs / 60000;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy = typedValue.length > 0 ? Math.round((correctChars / typedValue.length) * 100) : 100;

  typingEls.input.readOnly = true;
  setTypingStatus("Finished", `You cleared the text in ${(typingState.elapsedMs / 1000).toFixed(1)}s at ${wpm} WPM with ${accuracy}% accuracy.`, "#7ef9ff");
}

function handleTypingInput() {
  let typedValue = typingEls.input.value.replace(/\n/g, " ");

  if (typedValue !== typingEls.input.value) {
    typingEls.input.value = typedValue;
  }

  if (!typingState.text) {
    setupTypingRound(true);
  }

  if (!typingState.active && typedValue.length > 0 && !typingState.finished) {
    startTypingClock();
  }

  renderTypingPrompt(typedValue);

  if (typedValue === typingState.text && !typingState.finished) {
    finishTypingRound();
  }
}

document.addEventListener("keydown", (event) => {
  if (activeView === "rhythm") {
    if (event.code === "Space") {
      event.preventDefault();

      if (!rhythmState.running) {
        startRhythmGame();
      }
      return;
    }

    if (event.code === "KeyP") {
      toggleRhythmPause();
      return;
    }

    const key = event.key.toUpperCase();
    const laneIndex = laneConfig.findIndex((lane) => lane.key === key);

    if (laneIndex === -1) {
      return;
    }

    flashRhythmLane(laneIndex);

    if (!rhythmState.running || rhythmState.paused) {
      return;
    }

    const target = findClosestRhythmNote(laneIndex);

    if (!target) {
      rhythmState.combo = 0;
      updateRhythmHud();
      flashRhythmJudgement("EMPTY", `${key} lane is clear. Wait for the note.`, "#f7b0ff");
      return;
    }

    if (target.distance > RHYTHM_MISS_WINDOW) {
      rhythmState.combo = 0;
      updateRhythmHud();
      flashRhythmJudgement("TOO SOON", `${key} was not close enough to the line.`, "#ffb347");
      return;
    }

    scoreRhythmHit(target.noteIndex, target.distance);
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const viewName = button.dataset.view;
    showView(viewName);
  });
});

menuButtonEl.addEventListener("click", returnToMenu);
typingEls.input.addEventListener("input", handleTypingInput);
typingEls.input.addEventListener("paste", (event) => {
  event.preventDefault();
  setTypingStatus("No Paste", "This mode tracks real typing speed, so pasting is disabled.", "#ffb347");
});
typingEls.newText.addEventListener("click", () => setupTypingRound(true));
typingEls.reset.addEventListener("click", () => setupTypingRound(false));

buildRhythmBoard();
resetRhythmMode();
setupTypingRound(true);
showView("menu");
