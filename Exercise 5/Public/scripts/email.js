$(document).ready(function() {
	/*handle compose actions*/
	$('#compose_btn').click(function() {
		$('#compose_btn').hide();
		$('#new_email').fadeIn('fast');
	});
	$('#add_email').click(function() {
		$('#new_email').hide();
		$('#compose_btn').fadeIn('fast');
	});
	$('#cancel_compose').click(function() {
		$('#new_email')[0].reset();
		$('#new_email').hide();
		$('#compose_btn').fadeIn('fast');
	});
	
	/*handle e-mail interaction*/
	$('li').click(function() {
		$(".content").show();
	});
	
});