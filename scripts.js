function generateSquares() {
    const count = document.getElementById("count").value;
    const output = document.getElementById("output");

    output.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const div = document.createElement("div");
        div.classList.add("box");

        // gradient farba
        div.style.background = getGradient();
        div.textContent = "🍔"; // emoji namiesto čísla

        // delay animácie
        div.style.animationDelay = (i * 0.05) + "s";

        output.appendChild(div);
    }
}

function generateNumbers() {
    const count = document.getElementById("count").value;
    const output = document.getElementById("output");

    output.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const div = document.createElement("div");
        div.classList.add("box");

        div.style.background = "#020617";
        div.style.border = "2px solid #3b82f6";
        div.style.color = "#38bdf8";

        // rastúci font + glow efekt
        div.style.fontSize = (12 + i * 2) + "px";
        div.style.boxShadow = `0 0 ${i}px #3b82f6`;

        div.textContent = i;

        div.style.animationDelay = (i * 0.05) + "s";

        output.appendChild(div);
    }
}

function getGradient() {
    const colors = [
        ["#ff6a00", "#ee0979"],
        ["#00c6ff", "#0072ff"],
        ["#7f00ff", "#e100ff"],
        ["#00ff87", "#60efff"]
    ];

    const random = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(135deg, ${random[0]}, ${random[1]})`;
}