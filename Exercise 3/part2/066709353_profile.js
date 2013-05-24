/*
"Good code is its own best documentation. As you're about to add a comment, ask yourself,
'How can I improve the code so that this comment isn't needed?'
Improve the code and then document it to make it even clearer."
-- Steve McConnell, software engineer and author, from "Code Complete".
*/

/* ---------------- My Profile JavaScript, Jquery file ------------------- */

var isAdminAdmin = false; // Indicate wether the username and the password is 'admin' 

$(document).ready(function () {
	
	/*
	For prevent DHTML in gran33_profile.html (extract methods to here, no js in the HTML file).
	*/
	$("#send").click(function (){	
		if(isAdminAdmin)	
		{
			cleanScreen();
		}
	});
	
	$("#clean").click(function() {
		clearHandler();
	});
	
	$("#add").click(function() {
		var input = $("#numberInput").val();
		input = input.replace(/^0+/, '');
		addHandler(input);
	});
	
	$("#multi").click(function() {
		var input = $("#numberInput").val();
		input = input.replace(/^0+/, '');
		multiplyHandler(input);
	});
	
	/*
	2.2 - ‘username’ and ‘password’
	*/
	$("#username").focus().bind("focusout keyup ", function(){ // keeps the focus on the username input area
		if($("#username").val() !== "admin") // if the input is different from 'admin' unable the links, quote etc.
		{
			makeUnable("#username");
			
		} else {
			setTimeout(function(){
				$("#password").focus().bind("focusout keyup ", function(){ // keeps the focus on the password input area
					if($("#password").val() !== "admin") 
					{
						makeUnable("#password");
						
					} else { // all good :) username and password are 'admin'
						isAdminAdmin = true;
						enableLinks();
					}
				});
			},1);
		}
		
	});
	
	/*
	2.3 - Hovering websites table:
	*/
	$("tr").hover(function () { // Make the table rows orange
		$(this).addClass("onRow");
	},function () {
		$(this).removeClass("onRow");
	});
	
	/*
	2.4 - ID or username:
	*/
	$("#id, #username_git").click(function () { // On click event change the id to the github username and vice versa
		if (isAdminAdmin)
		{
			$("#id, #username_git").toggle();
		}
	});
	
	/*
	2.5 - Toggling personal info:
	*/
	$(".listInfo").click(function () { // Expend/Reduce the list with my extra details.
		if (isAdminAdmin)
		{
			$(this).children(".toExpand").toggle();
		}
	});
	
	/*
	2.6 - Image vs Octocat:
	*/
	$("#profilePic").hover(function () { // When mouse over the profile picture the picture will change to Bart Simpson
		$(this).addClass("leftTilt");
		$(this).removeClass("rightTilt");
		$(this).find("#image").attr("src", "066709353/images/bart_simpson.jpg");
		$(this).find("#captionText").text("Not Today!");
	}, function () {
		$(this).addClass("rightTilt");
		$(this).removeClass("leftTilt");
		$(this).find("#image").attr("src", "066709353/images/gran33_bitstrip.jpeg");
		$(this).find("#captionText").text("Let's Party!");
	});
	
	/*
	2.7 - Famous quote:
	*/
	$("#quote").click(function () {
		if (isAdminAdmin)
		{
			if (!($("#anotherQuote").is(":visible") || $("#anotherQuoteFull").is(":visible"))) // if one of the new quotes are visible don't allow the click action
			{
				$("#anotherQuote").show();
				$(this).disable = true;
				setTimeout(function() { // The 3 sec delay
					if($("#anotherQuote").is(":visible")){ 
						$("#anotherQuote").hide();
						$("#anotherQuoteFull").show();
						$(this).disable = false;
					}	
				}, 3000);
			}
		}
	});
	
	$("#anotherQuote, #anotherQuoteFull").click(function () // If the user click again during the 3 second delay, hide the new quote no matter what
	{
		$("#anotherQuote, #anotherQuoteFull").hide();
	});
	
});

/* ----------------------------------------------------------------------- */




/* ------------------------ Help functions ------------------------------- */
/*
Make links ("a" objects) disable 
*/
function disableLinks() {
    $("a").each(function(){ // For each 'a' object change the browser default behavior
        if($(this).attr("href") !== undefined) {
            $(this).bind('click', function(e) { // Bind new function on click. Don't allow the default browser behavion, do nothing when links are click
                e.preventDefault();
            });
        }
    });
};

/*
Make links ("a" objects) enable 
*/
function enableLinks() {
    $("a").each(function() { // For each 'a' object return to the browser default behavior
        if($(this).attr("href") !== undefined) {
            $(this).unbind('click'); // Unbing the 'disableLinks' bind function above
        }
    });
};

/*
Refactoring method. Reduce duplication of code.
*/
function makeUnable(toFocus) {
	isAdminAdmin = false;
	disableLinks();
	setTimeout(function() {
		$(toFocus).focus();
	},1);
}
/* ----------------------------------------------------------------------- */



