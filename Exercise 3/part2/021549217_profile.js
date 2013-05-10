
/* *********** Genereal Profile Section *************** */
$(document).ready(function () {
    $("a.button").hover(function() {
        $(this).addClass("hoveredButton");
    }, function() {
        $(this).removeClass("hoveredButton");
    });
    $("a.button").mousedown(function() {
        $(this).addClass("activeButton");
    }).bind('mouseup mouseleave', function() {
        $(this).removeClass("activeButton");
    });
    $("input[type=text], input[type=password], textarea").focusin(function() {
        $(this).addClass("focusedInput");
    }).bind('focusout', function() {
        $(this).removeClass("focusedInput");
    });
    
    $("tr").hover(function() {
        $(this).addClass("hoveredTableRow");
    }, function() {
        $(this).removeClass("hoveredTableRow");
    });
    $("#myId, #myUsername").click(function () {
        $("#myId, #myUsername").toggle();
    });
    $("#login_form input[name=username]").focus().bind('focusout keyup', function() {
        if($(this).val() !== 'admin') {
            var t = $(this);
            setTimeout(function() {
                t.focus();
            },1);
        } else {
            setTimeout(function() {
                if($("#login_form input[name=password]").val() !== 'admin') {
                    $("#login_form input[name=password]").focus().bind('focusout', function() {
                        if($(this).val() !== 'admin') {
                            var t = $(this);
                            setTimeout(function() {
                                t.focus();
                            },1);
                        }
                    });
                }
            },1);
        }
    });
});


/* login function. takes the form and extracts the values */
function login() {
    var username = $("#login_form input[name=username]").val();
    var password = $("#login_form input[name=password]").val();
    if(username === "admin" && password === "admin") {
        $("#profileContent").hide();
        $("#login_form").hide();
        $("#logged_in").html("<span>Welcome, " + username + "!</span>");
        $("#logged_in").show();
        $("#calculatorContent").show();
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
function addHandler() {
    var item = $('#numberInput').val().replace(/^0+/, '');
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		$("#result").val(myCalc.add(toAdd));
	}    
}

/*handle multiply action*/
function multiplyHandler(item){
    var item = $('#numberInput').val().replace(/^0+/, '');
	var toAdd = inputChecker(item);
	if (toAdd != "false") {
		$("#result").val(myCalc.multiply(toAdd));
	}    
}

/*handle clear action*/
function clearHandler(){
	$("#result").val(myCalc.clear());
}