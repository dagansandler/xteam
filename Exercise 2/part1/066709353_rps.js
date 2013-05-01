/*
"Good code is its own best documentation. As you're about to add a comment, ask yourself,
'How can I improve the code so that this comment isn't needed?'
Improve the code and then document it to make it even clearer."
-- Steve McConnell, software engineer and author, from "Code Complete".
*/

//Main function as describe in the assignment
function rps(item1, item2) {
	//conver the input to uppercase
	var oroginalItem1 = item1.toUpperCase();;
	var oroginalItem2 = item2.toUpperCase();;
	
	//input check and generate random item in case the orignal one is illegal
	item1 = generateIfNeeded(item1);
	item2 = generateIfNeeded(item2);
	
	//display on screen
	document.getElementById("result1").innerHTML = "Item1:" + item1;
	document.getElementById("result2").innerHTML = "Item2:" + item2;
	
	//get the winner
	var winner = whoIsTheWinner(item1, item2);
	
	//display the winner on screen
	document.getElementById("winner").innerHTML = winner;
	
	return winner;
	
}

function generateIfNeeded(item1) {
	var item11 = item1.toUpperCase();

	var _rock = "ROCK";
	var _paper = "PAPER";
	var _scissors = "SCISSORS";
	
	//item1 legaly check, if not, generate random
	if (item11 === undefined || item11 ==='' || (item11 != _rock &&	item11 != _paper &&	item11 != _scissors)) {
		item11 = Math.ceil((Math.random()*3));//form 0 to 1 -> 1, from 1 to 2 -> 2, from 2 to 3 -> 3.
		if (item11 === 0) { //very very rare option that the random number will be 0, i that case, make item11 equal to 1.
			item11 = 1;
		}
		item11 = numberToRPS(item11);
	}
	
	return item11;
}
//help method, convert from number to rock, paper, scissors.
function numberToRPS(number) {

	if (number === 1){
		return 'ROCK';
	}
	else if (number === 2) {
		return 'PAPER';
	}
	else if (number === 3) {
		return 'SCISSORS';
	}
}

//This function deside who is the winner
function whoIsTheWinner(item1, item2) {
	var _rock = "ROCK";
	var _paper = "PAPER";
	var _scissors = "SCISSORS";
	
	var _winner = 0;
	switch (item1) {
	
	case _rock:
		if (item2 === _paper) {//rock vs. paper
			return _paper;
		}
		else if (item2 === _scissors) {//rock vs. scissors
			return _rock;
		}
	break;
	case _paper:
		if (item2 === _rock) {//paper vs. rock
			return _paper;
		}
		else if (item2 === _scissors) {//paper vs. scissors
			return _scissors;
		}
	break;
	case _scissors:
		if (item2 === _rock) {//scissors vs. rock
			return _rock;
		}
		else if (item2 === _paper) {//scissors vs. paper
			return _scissors;
		}
	
	break;
	
	default:
	break;
		
	}
	if (_winner === 0) {
	     return "TIE";   
	}


}
