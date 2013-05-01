/*
"Good code is its own best documentation. As you're about to add a comment, ask yourself,
'How can I improve the code so that this comment isn't needed?'
Improve the code and then document it to make it even clearer."
-- Steve McConnell, software engineer and author, from "Code Complete".
*/

//this method clean the profile screen (excluding the header) and show the calculator
function cleanScreen(username, password) {
	
	if(username === "admin" && password === "admin") {
		document.getElementById("AfterForum").style.display = 'none';
		document.getElementById("MyForm").style.display = 'none';
		document.getElementById("calculator").style.display='block';
		document.getElementById("connected").style.display='block';
	}
	
}

//check if str is natural number
function isNaturalNumber (str) {
	var pattern = /^(0|([1-9]\d*))$/;
	return pattern.test(str);
}

//checks the input by invoke  isNaturalNumber method above
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

//Calculator object- include private variable currentValue, and 3 public methods: add, multiply, clear
//We used the module pattern
var Calculator = (function () {

	var Calculator = function() {
		var currentValue; //for each instance on calcultor the variable caurrentValue is his own variable (no variable sharing)
		currentValue = 0;
		
		this.add = function(item){
		currentValue+=item;
		return currentValue;
		};
	
		this.multiply = function(item){
			currentValue*=item;
			return currentValue;
		};
		
		this.clear = function(){
			currentValue = 0;
			return currentValue;
		};
	};
	return Calculator;
	
})();

//instance of Calculator
var myCalc = new Calculator();

//handler to be access from the HTML file
function addHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("calculatorResult").value = myCalc.add(toAdd);
	}    
}

//handler to be access from the HTML file
function multiplyHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("calculatorResult").value = myCalc.multiply(toAdd);
	}    
}

//handler to be access from the HTML file
function clearHandler(item){
	document.getElementById("calculatorResult").value = myCalc.clear();
}


