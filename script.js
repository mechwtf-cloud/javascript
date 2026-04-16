const keys = ["W", "A", "S", "D", "Q", "E"];
let combo = [];
let index = 0;
let score = 0;
let started = false;

const comboEl = document.getElementById("combo");
const infoEl = document.getElementById("info");
const scoreEl = document.getElementById("score");

function newCombo() {
  combo = [];
  for (let i = 0; i < 3; i++) {
    combo.push(keys[Math.floor(Math.random() * keys.length)]);
  }
  comboEl.textContent = combo.join(" ");
  index = 0;
}

document.addEventListener("keydown", (e) => {
  console.log("KEY PRESSED:", e.code); // 👈 DEBUG

  if (!started && e.code === "Space") {
    e.preventDefault();
    started = true;
    score = 0;
    scoreEl.textContent = score;
    infoEl.textContent = "Go!";
    newCombo();
    return;
  }

  if (!started) return;

 let key;

if (e.key === "Control") key = "CTRL";
else if (e.key === "Shift") key = "SHIFT";
else key = e.key.toUpperCase();

  if (key === combo[index]) {
    index++;

    if (index === combo.length) {
      score++;
      scoreEl.textContent = score;
      newCombo();
    }
  } else {
    infoEl.textContent = "Wrong! Press SPACE to restart";
    started = false;
    comboEl.textContent = "Press SPACE";
  }
});
