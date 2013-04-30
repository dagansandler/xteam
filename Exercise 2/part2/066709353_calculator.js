

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
	if (!isNaturalNumber(item) && itam != 0) {
		alert("Shame on you! this is Not a natural number!");
		return "false";
	}
	else {
		return parseInt(item);
	}
}

var Calculator = (function () {

	var Calculator = function() {
		this.currentValue = 0;
	};
	
	Calculator.prototype.add = function(item){
		this.currentValue+=item;
		return this.currentValue;
	}
	
	Calculator.prototype.multiply = function(item){
		this.currentValue*=item;
		return this.currentValue;
	};
	
	Calculator.prototype.clear = function(){
		this.currentValue = 0;
		return this.currentValue;
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


