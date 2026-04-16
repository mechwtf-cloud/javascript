const keys = ["A", "S", "D", "F", "J", "K", "L"];
let combo = [];
let index = 0;
let score = 0;
let started = false;

function newCombo() {
  combo = [];
  for (let i = 0; i < 3; i++) {
    combo.push(keys[Math.floor(Math.random() * keys.length)]);
  }
  document.getElementById("combo").textContent = combo.join(" ");
  index = 0;
}

document.addEventListener("keydown", (e) => {
  let key = e.key.toUpperCase();

  if (!started && key === " ") {
    started = true;
    score = 0;
    newCombo();
    document.getElementById("info").textContent = "Go!";
    return;
  }

  if (!started) return;

  if (key === combo[index]) {
    index++;
    if (index === combo.length) {
      score++;
      document.getElementById("score").textContent = score;
      newCombo();
    }
  } else {
    document.getElementById("info").textContent = "Wrong! Restarting...";
    started = false;
    document.getElementById("combo").textContent = "Press SPACE";
  }
});
