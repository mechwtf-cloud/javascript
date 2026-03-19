function generateSquares() {
    const count = document.getElementById("count").value;
    const output = document.getElementById("output");

    output.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const div = document.createElement("div");
        div.classList.add("box");

        // random farba
        div.style.backgroundColor = getRandomColor();
        div.textContent = i;

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

        div.style.backgroundColor = "#111827";
        div.style.color = "#22c55e";

        // rastúca veľkosť textu
        div.style.fontSize = (10 + i * 2) + "px";

        div.textContent = i;

        output.appendChild(div);
    }
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}