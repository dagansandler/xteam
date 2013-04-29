var rps = function(item1, item2) {
    /*variable declarations*/
    var r, result = 0,
        rpsArray = ['rock', 'paper', 'scissors'],
        results = ['Oh no! It\'s a tie!', 'Player 1 won!', 'Player 2 won!'];
    /*player 1 input check*/
    if (item1 === undefined || rpsArray.indexOf(item1) === -1) {
        r = Math.floor(Math.random() * 3);
        item1 = rpsArray[r];
        /*console.log("item1 was undefined and set to " + item1);*/
    }
    /*player 2 input check*/
    if (item2 === undefined || rpsArray.indexOf(item2) === -1) {
        r = Math.floor(Math.random() * 3);
        item2 = rpsArray[r];
        /*console.log("item2 was undefined and set to " + item2);*/
    }
    /*game logic*/
    switch (item1) {
    case 'rock':
        if (item2 === 'paper') {
            result = 2;
        } else if (item2 === 'scissors') {
            result = 1;
        }
        break;
    case 'paper':
        if (item2 === 'rock') {
            result = 1;
        } else if (item2 === 'scissors') {
            result = 2;
        }
        break;
    case 'scissors':
        if (item2 === 'paper') {
            result = 1;
        } else if (item2 === 'rock') {
            result = 2;
        }
        break;
    default:
        break;
    }
    /*output*/
    document.open();
    document.write("<p>Player 1 chose: <img src='images/" + item1 + ".jpg' width=200px/></p>");
    document.write("<p>Player 2 chose: <img src='images/" + item2 + ".jpg' width=200px/></p>");
    document.write("<p>" + results[result] + "</p>");
    document.close();
};