/*
A very simple JavaScript file to show our proof of concept :)
*/

$(document).ready(function() {
	$('#one').click(function() {
		console.log("click button one");
		$.ajax({url: "/test/one", success: function(result) {
			$('#ajaxOne').html(result);
		}});
	});
	$('#two').click(function() {
		$.ajax({url:"/test/two", success: function(result) {
			$('#ajaxTwo').html(result);
		}});
	});
	$('#three').click(function() {
		$.ajax({url:"/test/three", success: function(result) {
			$('#ajaxThree').html(result);
		}});
	});
	
	$('#clear').click(function() {
		$(".ajaxRes").html('');
	});
	
});