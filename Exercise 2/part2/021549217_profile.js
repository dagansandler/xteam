
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

var myCalc = new Calculator();

function addHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("result").value = myCalc.add(toAdd);
	}    
}

function multiplyHandler(item){
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		document.getElementById("result").value = myCalc.multiply(toAdd);
	}    
}

function clearHandler(item){
	document.getElementById("result").value = myCalc.clear();
}