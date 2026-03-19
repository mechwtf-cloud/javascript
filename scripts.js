function welcomeUser(){

var name = prompt("Ako sa voláš?");

if(name != null){

alert("Ahoj " + name);

}

}


function checkAge(){

var age = prompt("Koľko máš rokov?");

if(age >= 18){

alert("Máš prístup");

}

else{

alert("Si príliš mladý");

}

}


function showNumbers(){

for(var i = 1; i <= 5; i++){

alert("Číslo: " + i);

}

}


function sumNumbers(){

var a = Number(document.getElementById("a").value);
var b = Number(document.getElementById("b").value);

var result = a + b;

document.getElementById("result").innerHTML = "Výsledok: " + result;

}


function changeText(){

var text = document.getElementById("text");

text.innerHTML = "Text sa zmenil!";

}


function changeColor(){

var r = Math.floor(Math.random()*255);
var g = Math.floor(Math.random()*255);
var b = Math.floor(Math.random()*255);

document.body.style.background = "rgb("+r+","+g+","+b+")";

}