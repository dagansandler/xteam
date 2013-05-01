

function cleanScreen(username, password) {
	
	if(username === "admin" && password === "admin") {
		document.getElementById("AfterForum").style.display = 'none';
		document.getElementById("MyForm").style.display = 'none';
		document.getElementById("calculator").style.display='block';
		document.getElementById("connected").style.display='block';
	}
	
}

function isNaturalNumber (str) {
	var pattern = /^(0|([1-9]\d*))$/;
	return pattern.test(str);
}

function inputChecker(item) {
	if (item === '') {
		return 0;
	}
		
	if (!isNaturalNumber(item)) {
		alert("Shame on you! this is Not a natural number!");
		return "false";
	}
	else {
		return parseInt(item);
	}
}

var Calculator = (function () {

	var currentValue;

	var Calculator = function() {
		currentValue = 8;
	};
	
	Calculator.prototype.add = function(item){
		currentValue+=item;
		return currentValue;
	};
	
	Calculator.prototype.multiply = function(item){
		currentValue*=item;
		return currentValue;
	};
	
	Calculator.prototype.clear = function(){
		currentValue = 0;
		return currentValue;
	};
	
	return Calculator;
	
})();

var myCalc = new Calculator();

function addHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("calculatorResult").value = myCalc.add(toAdd);
	}    
}

function multiplyHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("calculatorResult").value = myCalc.multiply(toAdd);
	}    
}

function clearHandler(item){
	
	document.getElementById("calculatorResult").value = myCalc.clear();
}


