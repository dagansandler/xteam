function rps(item1, item2) {
	var oroginalItem1 = item1.toUpperCase();;
	var oroginalItem2 = item2.toUpperCase();;
	
	item1 = generateIfNeeded(item1);
	item2 = generateIfNeeded(item2);
	
	
	document.getElementById("result1").innerHTML = "Item1:" + item1;
	document.getElementById("result2").innerHTML = "Item2:" + item2;
	

	var winner = whoIsTheWinner(item1, item2);
	
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
