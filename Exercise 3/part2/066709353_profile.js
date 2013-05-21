$(document).ready(function () {
	
	//2.1
	$("#username").focus();
	
	//2.2
	
	
	//2.3
	$("tr").hover(function () {
		$(this).addClass("onRow");
	},function () {
		$(this).removeClass("onRow");
	});
	
	//2.4
	$("#id, #username_git").click(function () {
		$("#id, #username_git").toggle();
	});
	
	//2.5
	$(".listInfo").click(function () {
		$(this).children(".toExpand").toggle();
	});
	
	//2.6
	$("#profilePic").hover(function () {
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
	
	//2.7
	$("#footer").click(function () {
		$(this).children("#anotherQuote").toggle();
		setTimeout(function() {
			$("#anotherQuote").hide();
			$("#anotherQuoteFull").show();
		}, 3000);
	});
});



