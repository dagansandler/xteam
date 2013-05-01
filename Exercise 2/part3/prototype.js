/*
"Good code is its own best documentation. As you're about to add a comment, ask yourself,
'How can I improve the code so that this comment isn't needed?'
Improve the code and then document it to make it even clearer."
-- Steve McConnell, software engineer and author, from "Code Complete".
*/

//Object A
var A = (function() {
	
	var A = function() {//Constructor
		var A_var = "A";//for each instance A_var is private (no sharing A_var);
		this.goo = function() {
			A_var = "AA";
		};
		this.getA = function() {
			return A_var;
		};
	};
	return A;
})();

//Object B
var B = (function() {
	var B = function(){//Constructor
		this.varB = "B";
	};
	B.prototype = new A();//make A as B's prototype (B inherit from A)
	return B;
})();

//Object C
var C = (function() {
	var C = function(){ //Constructor
		this.varC = "C";
	};
	C.prototype = new B();//make B as C's prototype (C inherit from B)
	return C;
})();

//Object D
var D = (function() {
	var D = function(){//Constructor
		this.varD = "D";
	};
	D.prototype = new C();//make C as D's prototype (D inherit from C)
	return D;
})();

var a = new A();//new instance of A
var b = new B();//new instance of B
var c = new C();//new instance of C
var d = new D();//new instance of D


