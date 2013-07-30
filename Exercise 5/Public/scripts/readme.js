$(document).ready(function() {
	$(".tab").click(function() {
		var X=$(this).attr('id');
		if(X==='about') {
			$(".select").removeClass('select');
			$("#about").addClass('select');
			$(".expanded").hide();
			$("#aboutbox").fadeIn('fast').addClass('expanded');
		} else if(X==='user') {
			$(".select").removeClass('select');
			$("#user").addClass('select');
			$(".expanded").hide();
			$("#userbox").fadeIn('fast').addClass('expanded');
		} else {
			$(".select").removeClass('select');
			$("#tester").addClass('select');
			$(".expanded").hide();
			$("#testerbox").fadeIn('fast').addClass('expanded');			
		}
	});
});