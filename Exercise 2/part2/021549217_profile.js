
/* *********** Genereal Profile Section *************** */
/* login function. takes the form and extracts the values */
function login(form) {
    var username = form.username.value;
    var password = form.password.value;
    if(username === "admin" && password === "admin") {
        document.getElementById("profileContent").style.display = 'none';
        document.getElementById("login_form").style.display = 'none';
        document.getElementById("logged_in").innerHTML = "<span>Welcome, " + username + "!</span>";
        document.getElementById("logged_in").style.display = 'block';
        document.getElementById("calculatorContent").style.display = 'block';
    }
}

/* *********** Caculator Section *************** */
/*calculator object definition*/
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

/*check if the string we get is a natural number*/
function isNaturalNumber (str) {
	var pattern = /^(0|([1-9]\d*))$/;
	return pattern.test(str);
}

/*checks for valid input in the calculator and parses the input if legal*/
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

var myCalc = new Calculator();

/*handle add action*/
function addHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("result").value = myCalc.add(toAdd);
	}    
}

/*handle multiply action*/
function multiplyHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("result").value = myCalc.multiply(toAdd);
	}    
}

/*handle clear action*/
function clearHandler(item){
	document.getElementById("result").value = myCalc.clear();
}