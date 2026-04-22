const views = {
  menu: document.getElementById("menuView"),
  rhythm: document.getElementById("rhythmView"),
  typing: document.getElementById("typingView"),
  echo: document.getElementById("echoView"),
  brawl: document.getElementById("brawlView")
};

const viewTitles = {
  menu: "Choose a mode",
  rhythm: "Pulse Grid",
  typing: "Word Rush",
  echo: "Echo Reactor",
  brawl: "Neon Brawl"
};

const viewLabelEl = document.getElementById("viewLabel");
const menuButtonEl = document.getElementById("menuButton");
const musicButtonEl = document.getElementById("musicButton");
const modeButtons = document.querySelectorAll("[data-view]");
const brawlMoveButtons = document.querySelectorAll("[data-brawl-move]");

let activeView = "menu";

const laneConfig = [
  { key: "W", color: "#ff8f66" },
  { key: "A", color: "#ffd85e" },
  { key: "S", color: "#55f0d5" },
  { key: "D", color: "#71a8ff" }
];

const echoPadConfig = [
  { label: "North", subtitle: "Lift the signal", key: "ArrowUp", keyLabel: "Up", color: "#71a8ff", tone: 659.25 },
  { label: "Nova", subtitle: "Snap right", key: "ArrowRight", keyLabel: "Right", color: "#ffd85e", tone: 783.99 },
  { label: "Flux", subtitle: "Cut left", key: "ArrowLeft", keyLabel: "Left", color: "#ff7a8a", tone: 523.25 },
  { label: "South", subtitle: "Drop low", key: "ArrowDown", keyLabel: "Down", color: "#55f0d5", tone: 587.33 }
];

const rhythmEls = {
  score: document.getElementById("rhythmScore"),
  shield: document.getElementById("rhythmShield"),
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

const echoEls = {
  round: document.getElementById("echoRound"),
  score: document.getElementById("echoScore"),
  lives: document.getElementById("echoLives"),
  streak: document.getElementById("echoStreak"),
  pace: document.getElementById("echoPace"),
  feedback: document.getElementById("echoFeedback"),
  hint: document.getElementById("echoHint"),
  board: document.getElementById("echoBoard"),
  padGrid: document.getElementById("echoPadGrid"),
  overlay: document.getElementById("echoOverlay"),
  overlayTitle: document.getElementById("echoOverlayTitle"),
  overlayText: document.getElementById("echoOverlayText"),
  start: document.getElementById("echoStartButton"),
  replay: document.getElementById("echoReplayButton")
};

const brawlEls = {
  health: document.getElementById("brawlHealth"),
  score: document.getElementById("brawlScore"),
  combo: document.getElementById("brawlCombo"),
  wave: document.getElementById("brawlWave"),
  danger: document.getElementById("brawlDanger"),
  feedback: document.getElementById("brawlFeedback"),
  hint: document.getElementById("brawlHint"),
  arena: document.getElementById("brawlArena"),
  enemyLayer: document.getElementById("brawlEnemyLayer"),
  projectileLayer: document.getElementById("brawlProjectileLayer"),
  impactLayer: document.getElementById("brawlImpactLayer"),
  player: document.getElementById("brawlPlayer"),
  overlay: document.getElementById("brawlOverlay"),
  overlayTitle: document.getElementById("brawlOverlayTitle"),
  overlayText: document.getElementById("brawlOverlayText"),
  start: document.getElementById("brawlStartButton"),
  reset: document.getElementById("brawlResetButton")
};

const RHYTHM_HIT_LINE_RATIO = 0.82;
const RHYTHM_PERFECT_WINDOW = 44;
const RHYTHM_GREAT_WINDOW = 84;
const RHYTHM_MISS_WINDOW = 176;

const rhythmLaneEls = [];
const rhythmLaneKeyEls = [];
const rhythmLaneFlashTimers = [];
const echoPadEls = [];
const echoPadTimers = [];

let rhythmFeedbackTimer = null;
let arcadeAudioContext = null;
let arcadeMasterGain = null;
let arcadeMusicGain = null;
let arcadeSfxGain = null;
let arcadeNoiseBuffer = null;

const musicScenes = {
  menu: {
    bpm: 106,
    kick: [0, 8],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    bass: [45, null, 45, null, 50, null, 45, 52, 45, null, 57, null, 52, null, 50, null],
    lead: [69, null, 72, null, 74, null, 76, null, 74, null, 72, null, 69, null, 67, null],
    chords: [[57, 61, 64], [55, 59, 62], [50, 54, 57], [52, 57, 61]]
  },
  rhythm: {
    bpm: 138,
    kick: [0, 3, 6, 8, 11, 14],
    snare: [4, 12],
    hat: [1, 2, 5, 6, 7, 9, 10, 13, 14, 15],
    bass: [45, null, 45, 48, 52, null, 45, 48, 45, null, 45, 53, 48, null, 47, 43],
    lead: [74, null, 81, null, 79, 77, null, 74, 86, null, 84, null, 81, 79, null, 77],
    chords: [[57, 60, 64], [55, 59, 62], [60, 64, 67], [52, 57, 60]]
  },
  typing: {
    bpm: 118,
    kick: [0, 8],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    bass: [48, null, 48, null, 55, null, 52, null, 48, null, 48, null, 57, null, 55, null],
    lead: [72, null, 74, null, 76, null, 79, null, 76, null, 74, null, 72, null, 69, null],
    chords: [[60, 64, 67], [57, 60, 64], [55, 59, 62], [60, 64, 67]]
  },
  echo: {
    bpm: 128,
    kick: [0, 5, 8, 11, 14],
    snare: [4, 12],
    hat: [1, 3, 5, 7, 9, 11, 13, 15],
    bass: [45, null, 45, 48, 52, null, 53, null, 45, null, 45, 48, 55, null, 53, null],
    lead: [79, null, 81, 84, 86, null, 84, null, 81, null, 79, 76, 74, null, 76, null],
    chords: [[57, 60, 64], [60, 64, 67], [62, 65, 69], [55, 59, 62]]
  },
  brawl: {
    bpm: 142,
    kick: [0, 2, 4, 6, 8, 11, 14],
    snare: [4, 12],
    hat: [1, 3, 5, 7, 9, 10, 11, 13, 15],
    bass: [41, null, 41, 44, 48, null, 44, null, 41, 44, 48, null, 44, 41, 39, null],
    lead: [76, null, 79, 81, null, 84, 81, null, 79, null, 76, 72, null, 74, 76, null],
    chords: [[53, 57, 60], [56, 60, 63], [48, 52, 55], [50, 53, 57]]
  }
};

const musicState = {
  enabled: true,
  currentScene: "menu",
  schedulerId: null,
  step: 0,
  nextStepTime: 0,
  unlocked: false
};

const rhythmState = {
  running: false,
  paused: false,
  score: 0,
  combo: 0,
  bestCombo: 0,
  health: 100,
  maxHealth: 100,
  baseSpeed: 320,
  currentSpeed: 320,
  spawnTimer: 0,
  elapsed: 0,
  lastFrameTime: 0,
  animationFrameId: null,
  lastLaneIndex: -1,
  notes: []
};

const typingPassages = [
  "Neon rain paints the sidewalk while arcade lights pulse against the night.",
  "Fast fingers win the round when every word lands cleanly and without panic.",
  "A tiny browser game can feel surprisingly alive when motion and feedback click together.",
  "Push your rhythm, trust your timing, and let the scoreboard reward steady hands.",
  "Typing quickly is less about rushing and more about staying smooth through every sentence.",
  "Every clean run feels louder when your focus beats the timer instead of chasing it.",
  "Smooth inputs, bright feedback, and one more round can turn a small game into a habit.",
  "The best arcade runs feel simple at first and savage once the tempo starts climbing."
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

const echoState = {
  running: false,
  paused: false,
  showing: false,
  playerTurn: false,
  sequence: [],
  playerIndex: 0,
  round: 0,
  score: 0,
  lives: 3,
  maxLives: 3,
  streak: 0,
  tempoMs: 760,
  baseTempoMs: 760,
  timeoutIds: []
};

const brawlState = {
  running: false,
  paused: false,
  health: 100,
  maxHealth: 100,
  score: 0,
  combo: 0,
  wave: 1,
  kills: 0,
  elapsed: 0,
  lastFrameTime: 0,
  spawnTimer: 0,
  animationFrameId: null,
  moveTimerId: null,
  currentMove: "idle",
  dangerMultiplier: 1,
  invulnerabilityTimer: 0,
  lastSpawnSide: "right",
  enemies: [],
  projectiles: []
};

const brawlEnemyCatalog = {
  striker: {
    height: "mid",
    category: "melee",
    approachSpeed: [250, 320],
    engageDistance: 154,
    windupMs: 180,
    lungeSpeed: 700,
    score: 30,
    accent: "#ffd36b",
    tone: "punch",
    title: "COUNTER",
    detail: "Side rusher stuffed clean."
  },
  hopper: {
    height: "high",
    category: "melee",
    approachSpeed: [230, 290],
    engageDistance: 166,
    windupMs: 220,
    lungeSpeed: 640,
    score: 36,
    accent: "#9be38e",
    tone: "launcher",
    title: "LAUNCH",
    detail: "Jump attacker got read early."
  },
  slider: {
    height: "low",
    category: "melee",
    approachSpeed: [255, 325],
    engageDistance: 178,
    windupMs: 170,
    lungeSpeed: 720,
    score: 36,
    accent: "#ff8ea8",
    tone: "sweep",
    title: "SWEEP",
    detail: "Low slider got folded up."
  },
  thrower: {
    height: "mid",
    category: "projectile",
    approachSpeed: [180, 230],
    engageDistance: 268,
    windupMs: 320,
    retreatSpeed: 220,
    projectileSpeed: 780,
    score: 44,
    accent: "#7ef9ff",
    tone: "reflect",
    title: "REFLECT",
    detail: "Weapon sent right back."
  }
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

  if (viewName !== "echo") {
    resetEchoMode();
  }

  if (viewName !== "brawl") {
    resetBrawlMode();
  }

  setMusicScene(viewName);
}

function returnToMenu() {
  showView("menu");
}

function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function getArcadeAudioContext() {
  if (arcadeAudioContext) {
    return arcadeAudioContext;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextCtor) {
    musicButtonEl.disabled = true;
    musicButtonEl.textContent = "Music: N/A";
    return null;
  }

  arcadeAudioContext = new AudioContextCtor();
  arcadeMasterGain = arcadeAudioContext.createGain();
  arcadeMusicGain = arcadeAudioContext.createGain();
  arcadeSfxGain = arcadeAudioContext.createGain();

  const compressor = arcadeAudioContext.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, arcadeAudioContext.currentTime);
  compressor.knee.setValueAtTime(20, arcadeAudioContext.currentTime);
  compressor.ratio.setValueAtTime(9, arcadeAudioContext.currentTime);

  arcadeMasterGain.gain.setValueAtTime(0.9, arcadeAudioContext.currentTime);
  arcadeMusicGain.gain.setValueAtTime(0.0001, arcadeAudioContext.currentTime);
  arcadeSfxGain.gain.setValueAtTime(0.55, arcadeAudioContext.currentTime);

  arcadeMusicGain.connect(compressor);
  arcadeSfxGain.connect(compressor);
  compressor.connect(arcadeMasterGain);
  arcadeMasterGain.connect(arcadeAudioContext.destination);

  return arcadeAudioContext;
}

function getNoiseBuffer() {
  const audioContext = getArcadeAudioContext();

  if (!audioContext) {
    return null;
  }

  if (arcadeNoiseBuffer) {
    return arcadeNoiseBuffer;
  }

  const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  arcadeNoiseBuffer = buffer;
  return arcadeNoiseBuffer;
}

function updateMusicButton() {
  musicButtonEl.dataset.enabled = String(musicState.enabled);
  musicButtonEl.textContent = musicState.enabled ? "Music: On" : "Music: Off";
  musicButtonEl.setAttribute("aria-pressed", String(musicState.enabled));
}

function resumeArcadeAudio() {
  const audioContext = getArcadeAudioContext();

  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  musicState.unlocked = true;

  if (musicState.enabled && musicState.schedulerId === null) {
    restartMusicLoop();
  }
}

function stopMusicLoop(fadeOut = true) {
  if (musicState.schedulerId !== null) {
    clearInterval(musicState.schedulerId);
    musicState.schedulerId = null;
  }

  if (!fadeOut || !arcadeAudioContext || !arcadeMusicGain) {
    return;
  }

  const now = arcadeAudioContext.currentTime;
  arcadeMusicGain.gain.cancelScheduledValues(now);
  arcadeMusicGain.gain.setValueAtTime(Math.max(arcadeMusicGain.gain.value, 0.0001), now);
  arcadeMusicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
}

function restartMusicLoop() {
  const audioContext = getArcadeAudioContext();

  if (!audioContext || audioContext.state === "suspended" || !musicState.enabled) {
    return;
  }

  stopMusicLoop(false);
  musicState.step = 0;
  musicState.nextStepTime = audioContext.currentTime + 0.06;

  const now = audioContext.currentTime;
  arcadeMusicGain.gain.cancelScheduledValues(now);
  arcadeMusicGain.gain.setValueAtTime(Math.max(arcadeMusicGain.gain.value, 0.0001), now);
  arcadeMusicGain.gain.exponentialRampToValueAtTime(0.18, now + 0.18);

  musicState.schedulerId = window.setInterval(scheduleMusicLoop, 80);
}

function setMusicEnabled(enabled) {
  musicState.enabled = enabled;
  updateMusicButton();

  if (!enabled) {
    stopMusicLoop(true);
    return;
  }

  resumeArcadeAudio();
  restartMusicLoop();
}

function setMusicScene(sceneName) {
  const nextScene = musicScenes[sceneName] ? sceneName : "menu";

  if (musicState.currentScene === nextScene) {
    return;
  }

  musicState.currentScene = nextScene;

  if (musicState.enabled && musicState.unlocked) {
    restartMusicLoop();
  }
}

function scheduleOscillatorTone({
  frequency,
  time,
  duration,
  type = "sine",
  gainAmount = 0.05,
  attack = 0.01,
  release = duration,
  pitchTo = null,
  destination = arcadeMusicGain,
  filterType = null,
  filterFrequency = null,
  detune = 0
}) {
  const audioContext = getArcadeAudioContext();

  if (!audioContext || !destination) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  oscillator.detune.setValueAtTime(detune, time);

  if (pitchTo && pitchTo > 0 && pitchTo !== frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(pitchTo, time + duration);
  }

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainAmount, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + release);

  if (filterType && filterFrequency) {
    const filter = audioContext.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFrequency, time);
    oscillator.connect(filter);
    filter.connect(gain);
  } else {
    oscillator.connect(gain);
  }

  gain.connect(destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.04);
}

function scheduleNoiseHit({
  time,
  duration = 0.12,
  gainAmount = 0.05,
  filterType = "highpass",
  filterFrequency = 1600,
  destination = arcadeMusicGain
}) {
  const audioContext = getArcadeAudioContext();
  const noiseBuffer = getNoiseBuffer();

  if (!audioContext || !noiseBuffer || !destination) {
    return;
  }

  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  noise.buffer = noiseBuffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFrequency, time);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainAmount, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(time);
  noise.stop(time + duration + 0.03);
}

function scheduleKick(time, strength = 1) {
  scheduleOscillatorTone({
    frequency: 150,
    pitchTo: 42,
    time,
    duration: 0.18,
    release: 0.18,
    gainAmount: 0.17 * strength,
    type: "sine",
    destination: arcadeMusicGain
  });
}

function scheduleSnare(time, strength = 1) {
  scheduleNoiseHit({
    time,
    duration: 0.12,
    gainAmount: 0.075 * strength,
    filterType: "highpass",
    filterFrequency: 1700,
    destination: arcadeMusicGain
  });

  scheduleOscillatorTone({
    frequency: 220,
    pitchTo: 170,
    time,
    duration: 0.08,
    release: 0.08,
    gainAmount: 0.04 * strength,
    type: "triangle",
    destination: arcadeMusicGain
  });
}

function scheduleHat(time, strength = 1) {
  scheduleNoiseHit({
    time,
    duration: 0.045,
    gainAmount: 0.03 * strength,
    filterType: "highpass",
    filterFrequency: 5000,
    destination: arcadeMusicGain
  });
}

function scheduleBassNote(midi, time, duration) {
  scheduleOscillatorTone({
    frequency: midiToFrequency(midi),
    time,
    duration,
    release: duration,
    gainAmount: 0.052,
    type: "sawtooth",
    filterType: "lowpass",
    filterFrequency: 460,
    destination: arcadeMusicGain
  });
}

function scheduleLeadNote(midi, time, duration) {
  scheduleOscillatorTone({
    frequency: midiToFrequency(midi),
    pitchTo: midiToFrequency(midi + 0.4),
    time,
    duration,
    release: duration,
    gainAmount: 0.026,
    type: "triangle",
    filterType: "lowpass",
    filterFrequency: 1800,
    destination: arcadeMusicGain
  });
}

function schedulePadChord(chord, time, duration) {
  chord.forEach((midi, index) => {
    scheduleOscillatorTone({
      frequency: midiToFrequency(midi),
      time,
      duration,
      attack: 0.04,
      release: duration,
      gainAmount: 0.014,
      type: index === 0 ? "sine" : "triangle",
      filterType: "lowpass",
      filterFrequency: 1200,
      detune: index === 1 ? 4 : index === 2 ? -4 : 0,
      destination: arcadeMusicGain
    });
  });
}

function scheduleSceneStep(scene, step, time, stepDuration) {
  if (scene.kick.includes(step)) {
    scheduleKick(time, step === 0 || step === 8 ? 1 : 0.88);
  }

  if (scene.snare.includes(step)) {
    scheduleSnare(time);
  }

  if (scene.hat.includes(step)) {
    scheduleHat(time, step % 4 === 3 ? 0.95 : 0.7);
  }

  const bassNote = scene.bass[step];

  if (bassNote != null) {
    scheduleBassNote(bassNote, time, stepDuration * 1.6);
  }

  const leadNote = scene.lead[step];

  if (leadNote != null) {
    scheduleLeadNote(leadNote, time, stepDuration * 1.15);
  }

  if (step % 4 === 0) {
    const chord = scene.chords[(step / 4) % scene.chords.length];
    schedulePadChord(chord, time, stepDuration * 3.45);
  }
}

function scheduleMusicLoop() {
  const audioContext = arcadeAudioContext;

  if (!audioContext || audioContext.state === "suspended" || !musicState.enabled) {
    return;
  }

  const scene = musicScenes[musicState.currentScene] || musicScenes.menu;
  const stepDuration = 60 / scene.bpm / 4;

  while (musicState.nextStepTime < audioContext.currentTime + 0.3) {
    scheduleSceneStep(scene, musicState.step, musicState.nextStepTime, stepDuration);
    musicState.nextStepTime += stepDuration;
    musicState.step = (musicState.step + 1) % 16;
  }
}

function playImmediateTone(options) {
  const audioContext = getArcadeAudioContext();

  if (!audioContext || audioContext.state === "suspended") {
    return;
  }

  scheduleOscillatorTone({
    ...options,
    time: audioContext.currentTime,
    destination: arcadeSfxGain
  });
}

function playImmediateNoise(options) {
  const audioContext = getArcadeAudioContext();

  if (!audioContext || audioContext.state === "suspended") {
    return;
  }

  scheduleNoiseHit({
    ...options,
    time: audioContext.currentTime,
    destination: arcadeSfxGain
  });
}

function playRhythmTone(kind) {
  const toneMap = {
    perfect: { frequency: 740, pitchTo: 910, type: "triangle", gainAmount: 0.12, duration: 0.24 },
    great: { frequency: 620, pitchTo: 760, type: "triangle", gainAmount: 0.1, duration: 0.2 },
    good: { frequency: 520, pitchTo: 620, type: "sine", gainAmount: 0.08, duration: 0.16 },
    miss: { frequency: 220, pitchTo: 140, type: "sawtooth", gainAmount: 0.07, duration: 0.14 }
  };

  const config = toneMap[kind] || toneMap.good;
  playImmediateTone(config);

  if (kind === "miss") {
    playImmediateNoise({
      duration: 0.08,
      gainAmount: 0.035,
      filterType: "highpass",
      filterFrequency: 2200
    });
  }
}

function playTypingFinishTone() {
  playImmediateTone({
    frequency: 523.25,
    pitchTo: 659.25,
    type: "triangle",
    gainAmount: 0.08,
    duration: 0.14
  });

  setTimeout(() => {
    playImmediateTone({
      frequency: 783.99,
      pitchTo: 987.77,
      type: "triangle",
      gainAmount: 0.09,
      duration: 0.18
    });
  }, 90);
}

function playEchoPadTone(padIndex, accent = "default") {
  const pad = echoPadConfig[padIndex];

  if (!pad) {
    return;
  }

  const toneScale = accent === "preview" ? 0.8 : accent === "wrong" ? 0.6 : 1;
  playImmediateTone({
    frequency: pad.tone,
    pitchTo: accent === "wrong" ? pad.tone * 0.82 : pad.tone * 1.08,
    type: accent === "preview" ? "triangle" : "sawtooth",
    gainAmount: 0.06 * toneScale,
    duration: accent === "preview" ? 0.16 : 0.22
  });
}

function playUiConfirmTone() {
  playImmediateTone({
    frequency: 392,
    pitchTo: 523.25,
    type: "triangle",
    gainAmount: 0.06,
    duration: 0.12
  });

  setTimeout(() => {
    playImmediateTone({
      frequency: 523.25,
      pitchTo: 659.25,
      type: "triangle",
      gainAmount: 0.08,
      duration: 0.18
    });
  }, 80);
}

function playUiFailTone() {
  playImmediateTone({
    frequency: 246.94,
    pitchTo: 164.81,
    type: "sawtooth",
    gainAmount: 0.06,
    duration: 0.14
  });

  playImmediateNoise({
    duration: 0.08,
    gainAmount: 0.03,
    filterType: "highpass",
    filterFrequency: 1800
  });
}

function playGameOverTone() {
  playImmediateTone({
    frequency: 329.63,
    pitchTo: 220,
    type: "triangle",
    gainAmount: 0.06,
    duration: 0.16
  });

  setTimeout(() => {
    playImmediateTone({
      frequency: 220,
      pitchTo: 146.83,
      type: "triangle",
      gainAmount: 0.065,
      duration: 0.22
    });
  }, 120);
}

function playBrawlTone(kind) {
  const toneMap = {
    punch: { frequency: 261.63, pitchTo: 392, type: "sawtooth", gainAmount: 0.08, duration: 0.11 },
    launcher: { frequency: 392, pitchTo: 659.25, type: "triangle", gainAmount: 0.09, duration: 0.14 },
    sweep: { frequency: 220, pitchTo: 329.63, type: "square", gainAmount: 0.075, duration: 0.12 },
    reflect: { frequency: 392, pitchTo: 783.99, type: "triangle", gainAmount: 0.095, duration: 0.16 },
    hurt: { frequency: 196, pitchTo: 130.81, type: "sawtooth", gainAmount: 0.07, duration: 0.13 },
    whiff: { frequency: 246.94, pitchTo: 220, type: "triangle", gainAmount: 0.045, duration: 0.08 }
  };

  const config = toneMap[kind] || toneMap.punch;
  playImmediateTone(config);

  if (kind === "punch" || kind === "launcher" || kind === "sweep" || kind === "reflect") {
    playImmediateNoise({
      duration: 0.05,
      gainAmount: 0.024,
      filterType: "highpass",
      filterFrequency: kind === "launcher" ? 3600 : kind === "reflect" ? 4400 : 2400
    });
  }

  if (kind === "hurt") {
    playImmediateNoise({
      duration: 0.08,
      gainAmount: 0.03,
      filterType: "highpass",
      filterFrequency: 1900
    });
  }
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

function buildEchoBoard() {
  echoPadConfig.forEach((pad, padIndex) => {
    const padButton = document.createElement("button");
    padButton.type = "button";
    padButton.className = "echo-pad";
    padButton.dataset.padIndex = String(padIndex);
    padButton.style.setProperty("--pad-color", pad.color);
    padButton.innerHTML = `
      <span class="echo-pad-copy">
        <span class="echo-pad-label">${pad.label}</span>
        <span class="echo-pad-subtitle">${pad.subtitle}</span>
      </span>
      <span class="echo-pad-key">${pad.keyLabel}</span>
    `;

    padButton.addEventListener("click", () => {
      resumeArcadeAudio();
      handleEchoInput(padIndex);
    });

    echoEls.padGrid.appendChild(padButton);
    echoPadEls.push(padButton);
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
  rhythmEls.shield.textContent = `${Math.round(rhythmState.health)}%`;

  if (rhythmState.health > 55) {
    rhythmEls.shield.style.color = "";
  } else if (rhythmState.health > 25) {
    rhythmEls.shield.style.color = "#ffd36b";
  } else {
    rhythmEls.shield.style.color = "#ff8ea8";
  }
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

  if (!laneEl || !laneKeyEl) {
    return;
  }

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

  if (typeof laneIndex === "number") {
    pulseElement(rhythmLaneEls[laneIndex], "impact", 240);
    pulseElement(rhythmLaneKeyEls[laneIndex], "impact", 240);
    spawnRhythmBurst(laneIndex, kind);
  }

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

function spawnRhythmNote(forcedLaneIndex) {
  let laneIndex = typeof forcedLaneIndex === "number" ? forcedLaneIndex : Math.floor(Math.random() * laneConfig.length);

  if (typeof forcedLaneIndex !== "number" && laneIndex === rhythmState.lastLaneIndex && laneConfig.length > 1 && Math.random() < 0.55) {
    laneIndex = (laneIndex + 1 + Math.floor(Math.random() * (laneConfig.length - 1))) % laneConfig.length;
  }

  rhythmState.lastLaneIndex = laneIndex;

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
  return note;
}

function removeRhythmNoteAt(noteIndex) {
  const [note] = rhythmState.notes.splice(noteIndex, 1);

  if (note) {
    note.element.remove();
  }

  return note;
}

function finishRhythmGame(reason) {
  rhythmState.running = false;
  rhythmState.paused = false;
  stopRhythmLoop();
  clearRhythmNotes();
  setRhythmStatus("RUN OVER", reason, "#ff8ea8");
  showRhythmOverlay(
    "Run Over",
    `Score ${rhythmState.score}. Best combo ${rhythmState.bestCombo}. Press SPACE to launch another run.`
  );
  playGameOverTone();
}

function applyRhythmPenalty(reason, laneIndex, message) {
  const penaltyMap = { slip: 34, empty: 18, early: 24 };
  const feedbackMap = {
    slip: { title: "MISS", accent: "#ff8ea8" },
    empty: { title: "WHIFF", accent: "#f7b0ff" },
    early: { title: "TOO SOON", accent: "#ffb347" }
  };
  const detailMap = {
    slip: "A note slipped past the line.",
    empty: "That lane was empty.",
    early: "The note was not close enough yet."
  };

  const penalty = penaltyMap[reason] || 20;
  const feedback = feedbackMap[reason] || feedbackMap.empty;

  rhythmState.combo = 0;
  rhythmState.health = Math.max(0, rhythmState.health - penalty);
  updateRhythmHud();
  flashRhythmJudgement(
    feedback.title,
    `${message || detailMap[reason]} Shield at ${Math.round(rhythmState.health)}%.`,
    feedback.accent
  );
  triggerRhythmImpact("miss", laneIndex);

  if (rhythmState.health <= 0) {
    finishRhythmGame("Wrong reads finally broke the shield. Stay cleaner on the next run.");
  }
}

function registerRhythmMiss(note) {
  applyRhythmPenalty("slip", note.laneIndex, `${note.key} got through the line.`);
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
  let heal = 2;
  let title = "GOOD";
  let accent = "#fff6b4";
  let impactKind = "good";

  if (distance <= RHYTHM_PERFECT_WINDOW) {
    points = 5;
    heal = 7;
    title = "PERFECT";
    accent = "#7ef9ff";
    impactKind = "perfect";
  } else if (distance <= RHYTHM_GREAT_WINDOW) {
    points = 3;
    heal = 4;
    title = "GREAT";
    accent = "#9be38e";
    impactKind = "great";
  }

  rhythmState.score += points + Math.floor(rhythmState.combo / 6);
  rhythmState.combo += 1;
  rhythmState.bestCombo = Math.max(rhythmState.bestCombo, rhythmState.combo);
  rhythmState.health = Math.min(rhythmState.maxHealth, rhythmState.health + heal);
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
  rhythmState.health = rhythmState.maxHealth;
  rhythmState.currentSpeed = rhythmState.baseSpeed;
  rhythmState.spawnTimer = 0;
  rhythmState.elapsed = 0;
  rhythmState.lastFrameTime = 0;
  rhythmState.lastLaneIndex = -1;

  updateRhythmHud();
  setRhythmStatus("GO", "Misses and wrong taps now hit your shield. Play sharp and protect the run.", "#7ef9ff");
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
  setRhythmStatus("GO", "Back in motion. Keep the shield intact.", "#7ef9ff");
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
  rhythmState.health = rhythmState.maxHealth;
  rhythmState.currentSpeed = rhythmState.baseSpeed;
  rhythmState.spawnTimer = 0;
  rhythmState.elapsed = 0;
  rhythmState.lastFrameTime = 0;
  rhythmState.lastLaneIndex = -1;
  updateRhythmHud();
  setRhythmStatus("Ready", "W, A, S, and D only. Misses burn shield, perfect hits can patch it back up.", "");
  showRhythmOverlay("Pulse Grid", "Press SPACE to launch a run. Wrong taps and missed notes now end bad runs.");
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
  rhythmState.currentSpeed = rhythmState.baseSpeed + rhythmState.elapsed * 24;

  const spawnInterval = Math.max(360, 900 - rhythmState.elapsed * 28);

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
  setTypingStatus(
    "Finished",
    `You cleared the text in ${(typingState.elapsedMs / 1000).toFixed(1)}s at ${wpm} WPM with ${accuracy}% accuracy.`,
    "#7ef9ff"
  );
  playTypingFinishTone();
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

function updateEchoHud() {
  echoEls.round.textContent = String(echoState.round);
  echoEls.score.textContent = String(echoState.score);
  echoEls.lives.textContent = String(echoState.lives);
  echoEls.streak.textContent = String(echoState.streak);
  echoEls.pace.textContent = `${(echoState.baseTempoMs / echoState.tempoMs).toFixed(1)}x`;

  if (echoState.lives > 1) {
    echoEls.lives.style.color = "";
  } else {
    echoEls.lives.style.color = "#ff8ea8";
  }
}

function setEchoStatus(title, detail, accent = "") {
  echoEls.feedback.textContent = title;
  echoEls.feedback.style.color = accent;
  echoEls.hint.textContent = detail;
}

function showEchoOverlay(title, text) {
  echoEls.overlay.classList.remove("hidden");
  echoEls.overlayTitle.textContent = title;
  echoEls.overlayText.textContent = text;
}

function hideEchoOverlay() {
  echoEls.overlay.classList.add("hidden");
}

function clearEchoTimers() {
  echoState.timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
  echoState.timeoutIds = [];
}

function flashEchoPad(padIndex, toneAccent = "default", className = "active", duration = 220) {
  const padEl = echoPadEls[padIndex];

  if (!padEl) {
    return;
  }

  clearTimeout(echoPadTimers[padIndex]);
  padEl.classList.remove("wrong", "success");
  padEl.classList.add(className);

  if (toneAccent) {
    playEchoPadTone(padIndex, toneAccent);
  }

  echoPadTimers[padIndex] = setTimeout(() => {
    padEl.classList.remove(className);
  }, duration);
}

function markEchoPad(padIndex, className, duration = 280) {
  const padEl = echoPadEls[padIndex];

  if (!padEl) {
    return;
  }

  padEl.classList.remove("wrong", "success");
  padEl.classList.add(className);

  setTimeout(() => {
    padEl.classList.remove(className);
  }, duration);
}

function chooseEchoPad() {
  let nextPadIndex = Math.floor(Math.random() * echoPadConfig.length);
  const lastPad = echoState.sequence[echoState.sequence.length - 1];

  if (echoPadConfig.length > 1 && nextPadIndex === lastPad && Math.random() < 0.6) {
    nextPadIndex = (nextPadIndex + 1 + Math.floor(Math.random() * (echoPadConfig.length - 1))) % echoPadConfig.length;
  }

  return nextPadIndex;
}

function playEchoSequence(statusTitle, detail, accent = "#ffcf7f") {
  if (!echoState.running) {
    return;
  }

  clearEchoTimers();
  echoState.showing = true;
  echoState.playerTurn = false;
  echoState.playerIndex = 0;
  setEchoStatus(statusTitle, detail, accent);

  let delay = 360;

  echoState.sequence.forEach((padIndex) => {
    const timeoutId = setTimeout(() => {
      flashEchoPad(padIndex, "preview", "active", Math.max(180, echoState.tempoMs * 0.58));
    }, delay);

    echoState.timeoutIds.push(timeoutId);
    delay += echoState.tempoMs;
  });

  const turnTimeoutId = setTimeout(() => {
    echoState.showing = false;
    echoState.playerTurn = true;
    setEchoStatus("Your Turn", `Repeat ${echoState.sequence.length} pulses before the reactor speeds up again.`, "#7ef9ff");
  }, delay + 20);

  echoState.timeoutIds.push(turnTimeoutId);
}

function queueNextEchoRound() {
  if (!echoState.running) {
    return;
  }

  echoState.sequence.push(chooseEchoPad());
  echoState.round = echoState.sequence.length;
  updateEchoHud();
  playEchoSequence("Watch", `Round ${echoState.round} is live. Lock in on the glowing pattern.`, "#ffcf7f");
}

function finishEchoGame(reason) {
  echoState.running = false;
  echoState.paused = false;
  echoState.showing = false;
  echoState.playerTurn = false;
  clearEchoTimers();
  setEchoStatus("REACTOR DOWN", reason, "#ff8ea8");
  showEchoOverlay(
    "Reactor Down",
    `Score ${echoState.score}. You cleared ${Math.max(echoState.round - 1, 0)} full rounds. Press SPACE or Start Reactor to try again.`
  );
  pulseElement(echoEls.board, "impact-miss", 320);
  playGameOverTone();
}

function startEchoGame() {
  clearEchoTimers();
  hideEchoOverlay();

  echoState.running = true;
  echoState.paused = false;
  echoState.showing = false;
  echoState.playerTurn = false;
  echoState.sequence = [];
  echoState.playerIndex = 0;
  echoState.round = 0;
  echoState.score = 0;
  echoState.lives = echoState.maxLives;
  echoState.streak = 0;
  echoState.tempoMs = echoState.baseTempoMs;

  updateEchoHud();
  setEchoStatus("SYNCING", "Watch the sequence, then mirror it back one pulse at a time.", "#7ef9ff");
  queueNextEchoRound();
}

function toggleEchoPause() {
  if (!echoState.running) {
    return;
  }

  echoState.paused = !echoState.paused;

  if (echoState.paused) {
    clearEchoTimers();
    echoState.showing = false;
    echoState.playerTurn = false;
    setEchoStatus("PAUSED", "Press P to replay the pattern and jump back in.", "#ffd36b");
    showEchoOverlay("Paused", "Press P to continue. The current pattern will replay when you return.");
    return;
  }

  hideEchoOverlay();
  playEchoSequence("Watch", "Pattern replaying to bring you back in cleanly.", "#ffcf7f");
}

function replayEchoSequence(costsLife) {
  if (!echoState.running || echoState.sequence.length === 0 || echoState.showing) {
    return;
  }

  if (costsLife) {
    if (echoState.lives <= 1) {
      echoState.lives = 0;
      updateEchoHud();
      finishEchoGame("You burned the last life on a replay. The reactor timed out.");
      return;
    }

    echoState.lives -= 1;
    echoState.streak = 0;
    updateEchoHud();
  }

  playEchoSequence(
    "Replay",
    costsLife ? "Sequence replayed for one life. Breathe, then nail it." : "Pattern replaying. Lock back in.",
    "#ffcf7f"
  );
}

function handleEchoInput(padIndex) {
  if (!echoState.running || echoState.paused || echoState.showing || !echoState.playerTurn) {
    return;
  }

  flashEchoPad(padIndex, "default", "active", Math.max(150, echoState.tempoMs * 0.45));

  const expectedPadIndex = echoState.sequence[echoState.playerIndex];

  if (padIndex !== expectedPadIndex) {
    echoState.lives -= 1;
    echoState.streak = 0;
    updateEchoHud();
    markEchoPad(padIndex, "wrong", 320);
    pulseElement(echoEls.board, "impact-miss", 320);
    playUiFailTone();

    if (echoState.lives <= 0) {
      finishEchoGame("One wrong pulse too many knocked the reactor out of sync.");
      return;
    }

    echoState.tempoMs = Math.min(900, echoState.tempoMs + 24);
    updateEchoHud();
    setEchoStatus("STRIKE", `Wrong pad. ${echoState.lives} lives left and the pattern is replaying.`, "#ff8ea8");

    const retryTimeoutId = setTimeout(() => {
      playEchoSequence("Watch", "Same round again. Follow the glow and answer cleanly.", "#ffcf7f");
    }, 760);

    echoState.timeoutIds.push(retryTimeoutId);
    return;
  }

  markEchoPad(padIndex, "success", 240);
  pulseElement(echoEls.board, "impact-good", 220);
  echoState.playerIndex += 1;
  echoState.score += 12 + echoState.round * 4;
  echoState.streak += 1;
  updateEchoHud();

  if (echoState.playerIndex === echoState.sequence.length) {
    echoState.playerTurn = false;
    echoState.score += echoState.round * 12;
    echoState.tempoMs = Math.max(320, echoState.tempoMs - 36);
    updateEchoHud();
    setEchoStatus("CLEAR", `Round ${echoState.round} cleared. The reactor is accelerating.`, "#9be38e");
    playUiConfirmTone();

    const nextRoundTimeoutId = setTimeout(() => {
      queueNextEchoRound();
    }, 860);

    echoState.timeoutIds.push(nextRoundTimeoutId);
    return;
  }

  const remaining = echoState.sequence.length - echoState.playerIndex;
  setEchoStatus("LOCKED IN", `${remaining} pulse${remaining === 1 ? "" : "s"} left in this round.`, "#9be38e");
}

function resetEchoMode() {
  clearEchoTimers();
  echoState.running = false;
  echoState.paused = false;
  echoState.showing = false;
  echoState.playerTurn = false;
  echoState.sequence = [];
  echoState.playerIndex = 0;
  echoState.round = 0;
  echoState.score = 0;
  echoState.lives = echoState.maxLives;
  echoState.streak = 0;
  echoState.tempoMs = echoState.baseTempoMs;
  updateEchoHud();
  setEchoStatus("Ready", "Watch the pattern first, then replay it without leaking all three lives.", "");
  showEchoOverlay(
    "Echo Reactor",
    "Press SPACE or Start Reactor to begin. You can replay the sequence, but it costs one life."
  );
}

function updateBrawlHud() {
  brawlEls.health.textContent = `${Math.round(brawlState.health)}%`;
  brawlEls.score.textContent = String(brawlState.score);
  brawlEls.combo.textContent = String(brawlState.combo);
  brawlEls.wave.textContent = String(brawlState.wave);
  brawlEls.danger.textContent = `${brawlState.dangerMultiplier.toFixed(1)}x`;

  if (brawlState.health > 55) {
    brawlEls.health.style.color = "";
  } else if (brawlState.health > 25) {
    brawlEls.health.style.color = "#ffd36b";
  } else {
    brawlEls.health.style.color = "#ff8ea8";
  }
}

function setBrawlStatus(title, detail, accent = "") {
  brawlEls.feedback.textContent = title;
  brawlEls.feedback.style.color = accent;
  brawlEls.hint.textContent = detail;
}

function showBrawlOverlay(title, text) {
  brawlEls.overlay.classList.remove("hidden");
  brawlEls.overlayTitle.textContent = title;
  brawlEls.overlayText.textContent = text;
}

function hideBrawlOverlay() {
  brawlEls.overlay.classList.add("hidden");
}

function stopBrawlLoop() {
  if (brawlState.animationFrameId !== null) {
    cancelAnimationFrame(brawlState.animationFrameId);
    brawlState.animationFrameId = null;
  }
}

function clearBrawlEnemies() {
  brawlState.enemies.forEach((enemy) => enemy.element.remove());
  brawlState.enemies = [];
}

function clearBrawlProjectiles() {
  brawlState.projectiles.forEach((projectile) => projectile.element.remove());
  brawlState.projectiles = [];
}

function getBrawlArenaMetrics() {
  const width = brawlEls.arena.clientWidth || 900;
  const height = brawlEls.arena.clientHeight || 640;

  return {
    width,
    height,
    centerX: width / 2
  };
}

function getBrawlEnemyBottom(height) {
  if (height === "high") {
    return "34%";
  }

  if (height === "low") {
    return "10%";
  }

  return "18%";
}

function getBrawlImpactY(height) {
  const arenaHeight = brawlEls.arena.clientHeight || 640;

  if (height === "high") {
    return arenaHeight * 0.37;
  }

  if (height === "low") {
    return arenaHeight * 0.78;
  }

  return arenaHeight * 0.58;
}

function getBrawlProjectileY(height) {
  const arenaHeight = brawlEls.arena.clientHeight || 640;

  if (height === "high") {
    return arenaHeight * 0.36;
  }

  if (height === "low") {
    return arenaHeight * 0.72;
  }

  return arenaHeight * 0.56;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnBrawlImpact(x, y, accent) {
  const impact = document.createElement("div");
  impact.className = "brawl-enemy-hit";
  impact.style.left = `${x}px`;
  impact.style.top = `${y}px`;

  if (accent) {
    impact.style.boxShadow = `0 0 28px ${accent}`;
    impact.style.borderColor = accent;
  }

  brawlEls.impactLayer.appendChild(impact);
  impact.addEventListener("animationend", () => {
    impact.remove();
  });
}

function setBrawlPlayerMove(moveName, duration = 180) {
  if (brawlState.moveTimerId) {
    clearTimeout(brawlState.moveTimerId);
    brawlState.moveTimerId = null;
  }

  brawlState.currentMove = moveName;
  brawlEls.player.className = `brawl-player ${moveName}`;

  if (moveName === "idle") {
    return;
  }

  brawlState.moveTimerId = setTimeout(() => {
    brawlState.currentMove = "idle";
    brawlEls.player.className = "brawl-player idle";
  }, duration);
}

function getDefaultBrawlTypeForHeight(height) {
  if (height === "high") {
    return "hopper";
  }

  if (height === "low") {
    return "slider";
  }

  return "striker";
}

function syncBrawlEnemyElement(enemy) {
  enemy.element.className = [
    "brawl-enemy",
    `type-${enemy.type}`,
    `side-${enemy.side}`,
    `height-${enemy.height}`,
    `state-${enemy.state}`,
    enemy.threatened ? "threat" : "",
    enemy.state === "windup" ? "telegraph" : ""
  ]
    .filter(Boolean)
    .join(" ");

  enemy.element.style.left = `${enemy.x}px`;
  enemy.element.style.bottom = getBrawlEnemyBottom(enemy.height);
}

function createBrawlEnemy(side, typeOrHeight = "striker", overrides = {}) {
  const metrics = getBrawlArenaMetrics();
  const type =
    brawlEnemyCatalog[typeOrHeight] ? typeOrHeight : getDefaultBrawlTypeForHeight(typeOrHeight || overrides.height);
  const config = brawlEnemyCatalog[type];
  const enemyEl = document.createElement("div");
  const height = overrides.height || config.height;
  enemyEl.className = `brawl-enemy type-${type} side-${side} height-${height} state-approach`;
  enemyEl.innerHTML = `
    <span class="brawl-enemy-head"></span>
    <span class="brawl-enemy-body"></span>
    <span class="brawl-enemy-weapon"></span>
  `;

  const enemy = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    side,
    height,
    x: typeof overrides.x === "number" ? overrides.x : side === "left" ? -88 : metrics.width + 88,
    speed:
      typeof overrides.speed === "number"
        ? overrides.speed
        : randomBetween(config.approachSpeed[0], config.approachSpeed[1]) * brawlState.dangerMultiplier,
    engageDistance: overrides.engageDistance || config.engageDistance,
    state: overrides.state || "approach",
    attackTimer: overrides.attackTimer || 0,
    projectileId: null,
    threatened: false,
    element: enemyEl
  };

  brawlEls.enemyLayer.appendChild(enemyEl);
  brawlState.enemies.push(enemy);
  syncBrawlEnemyElement(enemy);
  return enemy;
}

function createBrawlProjectile(sourceEnemy, overrides = {}) {
  const projectileEl = document.createElement("div");
  projectileEl.className = `brawl-projectile side-${sourceEnemy.side}`;
  const direction = sourceEnemy.side === "left" ? 1 : -1;
  const projectile = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceId: sourceEnemy.id,
    sourceSide: sourceEnemy.side,
    height: overrides.height || sourceEnemy.height,
    x: typeof overrides.x === "number" ? overrides.x : sourceEnemy.x + direction * 30,
    y: typeof overrides.y === "number" ? overrides.y : getBrawlProjectileY(overrides.height || sourceEnemy.height),
    velocityX:
      typeof overrides.velocityX === "number"
        ? overrides.velocityX
        : direction * ((brawlEnemyCatalog.thrower.projectileSpeed || 760) * brawlState.dangerMultiplier),
    reflected: Boolean(overrides.reflected),
    element: projectileEl
  };

  projectileEl.style.left = `${projectile.x}px`;
  projectileEl.style.top = `${projectile.y}px`;

  if (projectile.reflected) {
    projectileEl.classList.add("reflected");
  }

  brawlEls.projectileLayer.appendChild(projectileEl);
  brawlState.projectiles.push(projectile);
  return projectile;
}

function chooseBrawlEnemyType() {
  const roll = Math.random();

  if (brawlState.wave <= 2) {
    if (roll < 0.5) {
      return "striker";
    }

    if (roll < 0.72) {
      return "hopper";
    }

    return roll < 0.92 ? "slider" : "thrower";
  }

  if (brawlState.wave <= 4) {
    if (roll < 0.36) {
      return "striker";
    }

    if (roll < 0.58) {
      return "hopper";
    }

    if (roll < 0.8) {
      return "slider";
    }

    return "thrower";
  }

  if (roll < 0.28) {
    return "striker";
  }

  if (roll < 0.5) {
    return "hopper";
  }

  if (roll < 0.72) {
    return "slider";
  }

  return "thrower";
}

function spawnBrawlEnemy(options = {}) {
  const side = options.side || (brawlState.lastSpawnSide === "left" ? "right" : "left");
  const type = options.type || (options.height ? getDefaultBrawlTypeForHeight(options.height) : chooseBrawlEnemyType());
  brawlState.lastSpawnSide = side;
  return createBrawlEnemy(side, type, options);
}

function removeBrawlEnemy(enemy) {
  const enemyIndex = brawlState.enemies.findIndex((entry) => entry.id === enemy.id);

  if (enemyIndex !== -1) {
    brawlState.enemies.splice(enemyIndex, 1);
  }

  enemy.element.remove();
}

function removeBrawlProjectile(projectile) {
  const projectileIndex = brawlState.projectiles.findIndex((entry) => entry.id === projectile.id);

  if (projectileIndex !== -1) {
    brawlState.projectiles.splice(projectileIndex, 1);
  }

  projectile.element.remove();
}

function getBrawlRequiredMove(enemy) {
  const config = brawlEnemyCatalog[enemy.type] || brawlEnemyCatalog.striker;

  if (config.category === "projectile") {
    return enemy.side;
  }

  if (enemy.height === "high") {
    return "up";
  }

  if (enemy.height === "low") {
    return "down";
  }

  return enemy.side;
}

function getClosestBrawlEnemy(predicate) {
  const { centerX } = getBrawlArenaMetrics();
  let result = null;

  brawlState.enemies.forEach((enemy) => {
    const distance = Math.abs(enemy.x - centerX);

    if (!predicate(enemy, distance)) {
      return;
    }

    if (!result || distance < result.distance) {
      result = { enemy, distance };
    }
  });

  return result;
}

function getClosestBrawlProjectile(predicate) {
  const { centerX } = getBrawlArenaMetrics();
  let result = null;

  brawlState.projectiles.forEach((projectile) => {
    const distance = Math.abs(projectile.x - centerX);

    if (!predicate(projectile, distance)) {
      return;
    }

    if (!result || distance < result.distance) {
      result = { projectile, distance };
    }
  });

  return result;
}

function defeatBrawlEnemy(enemy, moveName, method = "counter") {
  const config = brawlEnemyCatalog[enemy.type] || brawlEnemyCatalog.striker;
  const label =
    method === "reflect"
      ? { title: "REFLECT", detail: "Returned the weapon to sender.", accent: "#7ef9ff", tone: "reflect" }
      : {
          title: config.title,
          detail: config.detail,
          accent: config.accent,
          tone: config.tone
        };

  brawlState.combo += 1;
  brawlState.kills += 1;
  brawlState.wave = 1 + Math.floor(brawlState.kills / 7);
  brawlState.score += config.score + brawlState.wave * 7 + brawlState.combo * 4 + (method === "reflect" ? 10 : 0);
  brawlState.health = Math.min(
    brawlState.maxHealth,
    brawlState.health + (method === "reflect" ? 4 : moveName === "up" ? 4 : 2)
  );
  updateBrawlHud();
  setBrawlStatus(label.title, `${label.detail} ${brawlState.combo} combo rolling.`, label.accent);
  spawnBrawlImpact(enemy.x, getBrawlImpactY(enemy.height), label.accent);
  pulseElement(brawlEls.arena, "impact-good", 220);
  playBrawlTone(label.tone);
  enemy.element.classList.add("defeated");
  removeBrawlEnemy(enemy);
}

function damageBrawlPlayer(amount, message, accent = "#ff8ea8") {
  if (brawlState.invulnerabilityTimer > 0 || !brawlState.running) {
    return;
  }

  brawlState.health = Math.max(0, brawlState.health - amount);
  brawlState.combo = 0;
  brawlState.invulnerabilityTimer = 0.42;
  updateBrawlHud();
  setBrawlStatus("HIT", `${message} Health at ${Math.round(brawlState.health)}%.`, accent);
  setBrawlPlayerMove("hurt", 220);
  pulseElement(brawlEls.arena, "impact-miss", 280);
  playBrawlTone("hurt");

  if (brawlState.health <= 0) {
    finishBrawlGame("The rush finally broke through. Reset and hold the lane tighter next run.");
  }
}

function reflectBrawlProjectile(projectile) {
  const direction = projectile.sourceSide === "left" ? -1 : 1;
  projectile.reflected = true;
  projectile.velocityX = Math.abs(projectile.velocityX) * 1.18 * direction;
  projectile.element.classList.add("reflected");
  brawlState.score += 12 + Math.floor(brawlState.combo / 2);
  updateBrawlHud();
  setBrawlStatus("REFLECT", "You slapped the weapon back into the crowd.", "#7ef9ff");
  spawnBrawlImpact(getBrawlArenaMetrics().centerX + direction * 24, projectile.y, "#7ef9ff");
  playBrawlTone("reflect");
}

function performBrawlMove(moveName) {
  if (!brawlState.running || brawlState.paused) {
    return;
  }

  const poseClass = {
    left: "attack-left",
    right: "attack-right",
    up: "attack-up",
    down: "attack-down"
  }[moveName] || "idle";

  setBrawlPlayerMove(poseClass, 180);

  if (moveName === "left" || moveName === "right") {
    const projectileTarget = getClosestBrawlProjectile((projectile, distance) => {
      return !projectile.reflected && projectile.sourceSide === moveName && distance <= 108;
    });

    if (projectileTarget) {
      reflectBrawlProjectile(projectileTarget.projectile);
      return;
    }
  }

  const targets = brawlState.enemies
    .map((enemy) => ({ enemy, distance: Math.abs(enemy.x - getBrawlArenaMetrics().centerX) }))
    .filter(({ enemy, distance }) => getBrawlRequiredMove(enemy) === moveName && distance <= 176)
    .sort((left, right) => left.distance - right.distance)
    .slice(0, moveName === "left" || moveName === "right" ? 2 : 1);

  if (targets.length > 0) {
    targets.forEach(({ enemy }) => {
      defeatBrawlEnemy(enemy, moveName);
    });
    return;
  }

  const badRead = getClosestBrawlEnemy((enemy, distance) => {
    return distance <= 124 && enemy.state !== "retreat";
  });

  if (badRead && getBrawlRequiredMove(badRead.enemy) !== moveName) {
    const enemy = badRead.enemy;
    removeBrawlEnemy(enemy);
    damageBrawlPlayer(14, "Bad read in the pocket. That commit got punished.");
    return;
  }

  const badProjectile = getClosestBrawlProjectile((projectile, distance) => {
    return !projectile.reflected && distance <= 66;
  });

  if (badProjectile) {
    removeBrawlProjectile(badProjectile.projectile);
    damageBrawlPlayer(12, "You guessed wrong and ate the throw.");
    return;
  }

  brawlState.combo = 0;
  updateBrawlHud();
  setBrawlStatus("WHIFF", "No target in range. Reset your feet and read the next side.", "#ffb347");
  playBrawlTone("whiff");
}

function finishBrawlGame(reason) {
  brawlState.running = false;
  brawlState.paused = false;
  stopBrawlLoop();
  clearBrawlEnemies();
  clearBrawlProjectiles();
  setBrawlStatus("DOWN", reason, "#ff8ea8");
  showBrawlOverlay(
    "Fight Over",
    `Score ${brawlState.score}. Wave ${brawlState.wave}. Best answer is another round. Press SPACE or Start Fight.`
  );
  playGameOverTone();
}

function startBrawlGame() {
  hideBrawlOverlay();
  stopBrawlLoop();
  clearBrawlEnemies();

  brawlState.running = true;
  brawlState.paused = false;
  brawlState.health = brawlState.maxHealth;
  brawlState.score = 0;
  brawlState.combo = 0;
  brawlState.wave = 1;
  brawlState.kills = 0;
  brawlState.elapsed = 0;
  brawlState.lastFrameTime = 0;
  brawlState.spawnTimer = 0;
  brawlState.dangerMultiplier = 1;
  brawlState.invulnerabilityTimer = 0;
  brawlState.lastSpawnSide = Math.random() < 0.5 ? "left" : "right";
  clearBrawlProjectiles();
  setBrawlPlayerMove("idle", 0);
  updateBrawlHud();
  setBrawlStatus(
    "FIGHT",
    "Punch side rushers, launch jumpers, sweep sliders, and reflect thrown steel back into the pack.",
    "#7ef9ff"
  );
  spawnBrawlEnemy();
  brawlState.animationFrameId = requestAnimationFrame(runBrawlLoop);
}

function toggleBrawlPause() {
  if (!brawlState.running) {
    return;
  }

  brawlState.paused = !brawlState.paused;

  if (brawlState.paused) {
    stopBrawlLoop();
    setBrawlStatus("PAUSED", "Press P to jump back into the fight.", "#ffd36b");
    showBrawlOverlay("Paused", "Press P to continue or Back to Menu to switch games.");
    return;
  }

  hideBrawlOverlay();
  brawlState.lastFrameTime = 0;
  setBrawlStatus("FIGHT", "Back in. Read the height, then commit hard.", "#7ef9ff");
  brawlState.animationFrameId = requestAnimationFrame(runBrawlLoop);
}

function resetBrawlMode() {
  brawlState.running = false;
  brawlState.paused = false;
  brawlState.health = brawlState.maxHealth;
  brawlState.score = 0;
  brawlState.combo = 0;
  brawlState.wave = 1;
  brawlState.kills = 0;
  brawlState.elapsed = 0;
  brawlState.lastFrameTime = 0;
  brawlState.spawnTimer = 0;
  brawlState.dangerMultiplier = 1;
  brawlState.invulnerabilityTimer = 0;
  stopBrawlLoop();
  clearBrawlEnemies();
  clearBrawlProjectiles();
  setBrawlPlayerMove("idle", 0);
  updateBrawlHud();
  setBrawlStatus(
    "Ready",
    "Use left and right for side rushers and thrown weapons, up for high dives, and down for low sweeps.",
    ""
  );
  showBrawlOverlay(
    "Neon Brawl",
    "Press SPACE or Start Fight to begin. Read the side, height, and weapon tell, then answer with the right counter."
  );
}

function runBrawlLoop(timestamp) {
  if (!brawlState.running || brawlState.paused || activeView !== "brawl") {
    brawlState.animationFrameId = null;
    return;
  }

  if (!brawlState.lastFrameTime) {
    brawlState.lastFrameTime = timestamp;
  }

  const deltaTime = Math.min(0.05, (timestamp - brawlState.lastFrameTime) / 1000);
  const metrics = getBrawlArenaMetrics();
  brawlState.lastFrameTime = timestamp;
  brawlState.elapsed += deltaTime;
  brawlState.spawnTimer += deltaTime * 1000;
  brawlState.invulnerabilityTimer = Math.max(0, brawlState.invulnerabilityTimer - deltaTime);
  brawlState.dangerMultiplier = 1 + brawlState.elapsed * 0.05 + (brawlState.wave - 1) * 0.18;

  const maxEnemies = Math.min(6, 3 + Math.floor(brawlState.wave / 3));
  const spawnInterval = Math.max(220, 860 - brawlState.elapsed * 24 - (brawlState.wave - 1) * 62);

  while (brawlState.spawnTimer >= spawnInterval && brawlState.enemies.length < maxEnemies) {
    spawnBrawlEnemy();
    if (brawlState.wave >= 3 && Math.random() < 0.2 && brawlState.enemies.length < maxEnemies) {
      spawnBrawlEnemy({ side: brawlState.lastSpawnSide === "left" ? "right" : "left" });
    }
    brawlState.spawnTimer -= spawnInterval;
  }

  for (let enemyIndex = brawlState.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
    const enemy = brawlState.enemies[enemyIndex];
    const config = brawlEnemyCatalog[enemy.type] || brawlEnemyCatalog.striker;
    const direction = enemy.side === "left" ? 1 : -1;

    if (enemy.state === "approach") {
      enemy.x += direction * enemy.speed * deltaTime;
      const engageX = enemy.side === "left" ? metrics.centerX - enemy.engageDistance : metrics.centerX + enemy.engageDistance;

      if ((enemy.side === "left" && enemy.x >= engageX) || (enemy.side === "right" && enemy.x <= engageX)) {
        enemy.state = "windup";
        enemy.attackTimer = config.windupMs / 1000;
      }
    } else if (enemy.state === "windup") {
      enemy.attackTimer -= deltaTime;

      if (enemy.attackTimer <= 0) {
        if (config.category === "projectile") {
          createBrawlProjectile(enemy);
          enemy.state = "retreat";
          enemy.speed = config.retreatSpeed * brawlState.dangerMultiplier;
        } else {
          enemy.state = "lunge";
          enemy.speed = config.lungeSpeed * brawlState.dangerMultiplier;
        }
      }
    } else if (enemy.state === "lunge") {
      enemy.x += direction * enemy.speed * deltaTime;

      if (Math.abs(enemy.x - metrics.centerX) <= 46) {
        removeBrawlEnemy(enemy);
        damageBrawlPlayer(18, "An attacker broke through your center line.");
        continue;
      }
    } else if (enemy.state === "retreat") {
      enemy.x += (enemy.side === "left" ? -1 : 1) * enemy.speed * deltaTime;

      if ((enemy.side === "left" && enemy.x <= -110) || (enemy.side === "right" && enemy.x >= metrics.width + 110)) {
        removeBrawlEnemy(enemy);
        continue;
      }
    }

    const distance = Math.abs(enemy.x - metrics.centerX);
    enemy.threatened = distance <= 176 || enemy.state === "windup" || enemy.state === "lunge";
    syncBrawlEnemyElement(enemy);
  }

  for (let projectileIndex = brawlState.projectiles.length - 1; projectileIndex >= 0; projectileIndex -= 1) {
    const projectile = brawlState.projectiles[projectileIndex];
    projectile.x += projectile.velocityX * deltaTime;
    projectile.element.style.left = `${projectile.x}px`;
    projectile.element.style.top = `${projectile.y}px`;

    const distance = Math.abs(projectile.x - metrics.centerX);

    if (!projectile.reflected && distance <= 40) {
      removeBrawlProjectile(projectile);
      damageBrawlPlayer(14, "A thrown weapon slipped through your guard.");
      continue;
    }

    if (projectile.reflected) {
      const sourceEnemy = brawlState.enemies.find((enemy) => enemy.id === projectile.sourceId);

      if (sourceEnemy && Math.abs(sourceEnemy.x - projectile.x) <= 48) {
        removeBrawlProjectile(projectile);
        defeatBrawlEnemy(sourceEnemy, sourceEnemy.side, "reflect");
        continue;
      }
    }

    if (projectile.x <= -80 || projectile.x >= metrics.width + 80) {
      removeBrawlProjectile(projectile);
    }
  }

  updateBrawlHud();

  if (brawlState.running && !brawlState.paused) {
    brawlState.animationFrameId = requestAnimationFrame(runBrawlLoop);
  } else {
    brawlState.animationFrameId = null;
  }
}

document.addEventListener("pointerdown", resumeArcadeAudio, { passive: true });
document.addEventListener("keydown", (event) => {
  resumeArcadeAudio();

  if (activeView === "rhythm") {
    if (event.code === "Space") {
      event.preventDefault();

      if (!rhythmState.running) {
        startRhythmGame();
      }
      return;
    }

    if (event.code === "KeyP") {
      event.preventDefault();
      toggleRhythmPause();
      return;
    }

    const key = event.key.toUpperCase();
    const laneIndex = laneConfig.findIndex((lane) => lane.key === key);

    if (laneIndex === -1) {
      return;
    }

    event.preventDefault();
    flashRhythmLane(laneIndex);

    if (!rhythmState.running || rhythmState.paused) {
      return;
    }

    const target = findClosestRhythmNote(laneIndex);

    if (!target) {
      applyRhythmPenalty("empty", laneIndex, `${key} was a ghost tap.`);
      return;
    }

    if (target.distance > RHYTHM_MISS_WINDOW) {
      applyRhythmPenalty("early", laneIndex, `${key} fired too early for the line.`);
      return;
    }

    scoreRhythmHit(target.noteIndex, target.distance);
    return;
  }

  if (activeView === "echo") {
    if (event.code === "Space") {
      event.preventDefault();

      if (!echoState.running) {
        startEchoGame();
      }
      return;
    }

    if (event.code === "KeyP") {
      event.preventDefault();
      toggleEchoPause();
      return;
    }

    const padIndex = echoPadConfig.findIndex((pad) => pad.key === event.key);

    if (padIndex !== -1) {
      event.preventDefault();
      handleEchoInput(padIndex);
    }
    return;
  }

  if (activeView === "brawl") {
    if (event.code === "Space") {
      event.preventDefault();

      if (!brawlState.running) {
        startBrawlGame();
      }
      return;
    }

    if (event.code === "KeyP") {
      event.preventDefault();
      toggleBrawlPause();
      return;
    }

    const moveMap = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      KeyA: "left",
      KeyD: "right",
      KeyW: "up",
      KeyS: "down"
    };

    const moveName = moveMap[event.code];

    if (moveName) {
      event.preventDefault();
      performBrawlMove(moveName);
    }
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const viewName = button.dataset.view;
    resumeArcadeAudio();
    showView(viewName);
  });
});

menuButtonEl.addEventListener("click", returnToMenu);

musicButtonEl.addEventListener("click", () => {
  resumeArcadeAudio();
  setMusicEnabled(!musicState.enabled);
});

typingEls.input.addEventListener("input", handleTypingInput);
typingEls.input.addEventListener("paste", (event) => {
  event.preventDefault();
  setTypingStatus("No Paste", "This mode tracks real typing speed, so pasting is disabled.", "#ffb347");
  playUiFailTone();
});
typingEls.newText.addEventListener("click", () => setupTypingRound(true));
typingEls.reset.addEventListener("click", () => setupTypingRound(false));

echoEls.start.addEventListener("click", () => {
  resumeArcadeAudio();
  startEchoGame();
});

echoEls.replay.addEventListener("click", () => {
  resumeArcadeAudio();
  replayEchoSequence(true);
});

brawlEls.start.addEventListener("click", () => {
  resumeArcadeAudio();
  startBrawlGame();
});

brawlEls.reset.addEventListener("click", () => {
  resetBrawlMode();
});

brawlMoveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    resumeArcadeAudio();
    performBrawlMove(button.dataset.brawlMove);
  });
});

buildRhythmBoard();
buildEchoBoard();
updateMusicButton();
resetRhythmMode();
resetEchoMode();
resetBrawlMode();
setupTypingRound(true);
showView("menu");

window.__arcadeTest = {
  showView,
  startRhythmGame,
  clearRhythmNotes,
  spawnRhythmNote(laneIndex, y = getRhythmHitLineY()) {
    const note = spawnRhythmNote(laneIndex);
    note.y = y;
    positionRhythmNote(note);
    return { laneIndex: note.laneIndex, key: note.key };
  },
  setRhythmHealth(value) {
    rhythmState.health = Math.max(0, Math.min(rhythmState.maxHealth, value));
    updateRhythmHud();
  },
  getRhythmState() {
    return {
      running: rhythmState.running,
      paused: rhythmState.paused,
      score: rhythmState.score,
      combo: rhythmState.combo,
      bestCombo: rhythmState.bestCombo,
      health: rhythmState.health,
      notes: rhythmState.notes.map((note) => ({
        laneIndex: note.laneIndex,
        key: note.key,
        y: note.y
      }))
    };
  },
  startEchoGame,
  setEchoSequence(sequence, options = {}) {
    clearEchoTimers();
    echoState.running = true;
    echoState.paused = false;
    echoState.showing = false;
    echoState.playerTurn = true;
    echoState.sequence = [...sequence];
    echoState.playerIndex = 0;
    echoState.round = options.round ?? sequence.length;
    echoState.score = options.score ?? 0;
    echoState.lives = options.lives ?? echoState.maxLives;
    echoState.streak = options.streak ?? 0;
    echoState.tempoMs = options.tempoMs ?? echoState.baseTempoMs;
    hideEchoOverlay();
    updateEchoHud();
  },
  getEchoState() {
    return {
      running: echoState.running,
      paused: echoState.paused,
      showing: echoState.showing,
      playerTurn: echoState.playerTurn,
      sequence: [...echoState.sequence],
      playerIndex: echoState.playerIndex,
      round: echoState.round,
      score: echoState.score,
      lives: echoState.lives,
      streak: echoState.streak,
      tempoMs: echoState.tempoMs
    };
  },
  pressEchoPad(index) {
    handleEchoInput(index);
  },
  getTypingText() {
    return typingState.text;
  },
  startBrawlGame,
  clearBrawlEnemies,
  clearBrawlProjectiles,
  stopBrawlLoop,
  setBrawlState(options = {}) {
    clearBrawlProjectiles();
    brawlState.running = options.running ?? true;
    brawlState.paused = options.paused ?? false;
    brawlState.health = options.health ?? brawlState.maxHealth;
    brawlState.score = options.score ?? 0;
    brawlState.combo = options.combo ?? 0;
    brawlState.wave = options.wave ?? 1;
    brawlState.kills = options.kills ?? 0;
    brawlState.elapsed = options.elapsed ?? 0;
    brawlState.dangerMultiplier = options.dangerMultiplier ?? 1;
    brawlState.invulnerabilityTimer = options.invulnerabilityTimer ?? 0;
    hideBrawlOverlay();
    updateBrawlHud();
  },
  spawnBrawlEnemy(options = {}) {
    const enemy = createBrawlEnemy(options.side || "left", options.type || options.height || "mid", options);
    return {
      id: enemy.id,
      type: enemy.type,
      side: enemy.side,
      height: enemy.height,
      x: enemy.x
    };
  },
  spawnBrawlProjectile(options = {}) {
    const projectile = createBrawlProjectile(
      {
        id: options.sourceId || `source-${Date.now()}`,
        side: options.side || "left",
        height: options.height || "mid"
      },
      options
    );
    return {
      id: projectile.id,
      sourceId: projectile.sourceId,
      x: projectile.x,
      y: projectile.y,
      reflected: projectile.reflected
    };
  },
  performBrawlMove,
  getBrawlState() {
    return {
      running: brawlState.running,
      paused: brawlState.paused,
      health: brawlState.health,
      score: brawlState.score,
      combo: brawlState.combo,
      wave: brawlState.wave,
      dangerMultiplier: brawlState.dangerMultiplier,
      projectiles: brawlState.projectiles.map((projectile) => ({
        id: projectile.id,
        sourceId: projectile.sourceId,
        sourceSide: projectile.sourceSide,
        x: projectile.x,
        y: projectile.y,
        reflected: projectile.reflected
      })),
      enemies: brawlState.enemies.map((enemy) => ({
        id: enemy.id,
        type: enemy.type,
        side: enemy.side,
        height: enemy.height,
        state: enemy.state,
        x: enemy.x
      }))
    };
  }
};
