const btn = document.getElementById("startBtn");
const output = document.getElementById("output");

btn.onclick = startProgram;

function startProgram(){

    let name = prompt("Name?");
    let age = prompt("Age?");

    if(age >= 18){
        output.textContent = name + " is an adult";
    }else{
        output.textContent = name + " is under 18";
    }

}
