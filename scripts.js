var userName;

// hlavná funkcia
function startProgram(){

    userName = prompt("Ako sa voláš?", "Jano");

    alert("Ahoj " + userName);

    var isAdmin = confirm("Si admin?");
    alert("Admin status: " + isAdmin);

    // funkcia s parametrami
    showMessage(userName, "Vitaj v programe");

    // funkcia s return
    var result = sum(5,3);
    alert("Súčet je: " + result);

    // operátory
    var x = 10;
    var y = 3;

    alert("Odčítanie: " + (x - y));
    alert("Zvyšok po delení: " + (x % y));

    // if else
    if(x > y){
        alert("x je väčšie ako y");
    } else{
        alert("x nie je väčšie");
    }

    // while cyklus
    var i = 0;
    while(i < 3){
        alert("While cyklus: " + i);
        i++;
    }

    // for cyklus
    for(var j = 0; j < 3; j++){
        alert("For cyklus: " + j);
    }

    document.getElementById("output").innerHTML =
    "Program bol spustený používateľom " + userName;
}


// funkcia s parametrami
function showMessage(from, text){
    from = "**" + from + "**";
    alert(from + ": " + text);
}


// funkcia s return
function sum(a,b){
    return a + b;
}