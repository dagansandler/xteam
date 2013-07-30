$(document).ready(function() {
    $("#register_form").ketchup();
    $("#login_form").ketchup();
	
	$('#forgot').click(function() {
		$(this).html("too bad, mate!");
	});
	
	$(".tab").click(function() {
		var X=$(this).attr('id');
		if(X==='signup') {
			$("#login").removeClass('select');
			$("#signup").addClass('select');
			$("#loginbox").hide();
			$("#signupbox").fadeIn('fast');
		} else {
			$("#signup").removeClass('select');
			$("#login").addClass('select');
			$("#signupbox").hide();
			$("#loginbox").fadeIn('fast');
		}
	});
	
    var regRequest;
    var loginRequest;
    $("#register_btn")
        .on('click',function() {
            var username = $('#reg_username').val();
            var password = $('#reg_password').val();
            var firstname = $('#firstname').val();
            var lastname = $('#lastname').val();
            var age = $('#age').val();

            regRequest = $.ajax({
                url: "/welcome.html",
                type: "POST",
                //contentType: "text/plain",
                //dataType:"json",
                data: {
                    'action' : 'register',
                    'username': username,
                    'password': password,
                    'firstname': firstname,
                    'lastname': lastname,
                    'age': age
                },
                statusCode : {
                    200: function(response){
                        status200Helper(response);
                    },
                    403: function(response){
                        status403HelperRegister(response);
                    }

                }
            });


            regRequest.done(function (response, textStatus, jqXHR){
                $("#server_answer").text('response:' + response + '\ntextStatus:' + textStatus + '\njqXHR:' + jqXHR);
            });

            regRequest.fail(function (jqXHR, textStatus, errorThrown){
                $("#server_answer").text("fail register");

                //console.log(data1)
            });
            return false;

        });


    $("#login_btn").on('click',function() {
        var username = $('#login_username').val();
        var password = $('#login_password').val();

        //Sends AJAX to the nodeJS server
        loginRequest = $.ajax({
            url: "/welcome.html",
            type: "POST",
            data: {
                'action' : 'login',
                'username': username,
                'password': password
            },
            statusCode : {
                200: function(response){
                    status200Helper(response);
                },
                403: function(response){
                    status403HelperLogin(response);
                }

            }
        });

        loginRequest.done(function (response, textStatus, jqXHR){
            $("#server_answer").text(response);

        });

        loginRequest.fail(function (jqXHR, textStatus, errorThrown){
            $("#server_answer").text("fail login");

        });
        return false;
    });

});

function status200Helper(response){
    window.location.assign('/email.html');

}

function status403HelperRegister(response){
    $("#server_answer").text("username can't be used");
}


function status403HelperLogin(response){
    $("#server_answer").text("incorrect password");
}

// 	$('#register_form').attr('action'),
// [{'username':$('#reg_username').val(),
//  'password':$('#reg_password').val(),
//  'firstname':$('#firstname').val(),
//  'lastname':$('#lastname').val(),
//  'age':$('#age').val()}],
// function(jsonData) {
// 	console.log(jsonData);
// },
// 'json');


/*.submit(function(){
 //alert($("#register_form").serialize());
 var a = $.parseJSON($("#register_form").serialize());
 console.log(a);
 //alert(a.);
 });
 */

//GIL
// $("#login-btn").on('click', function () {
// 		//assuming all the fields are valid!!!!!
// 		var request;  		// variable to hold request
// 	// capturing info of the user from  register form elements:
// 		var username = $('#username').val();
// 		var password = $('#password').val();
//
// 		// fire the request to /tests/ajaxTest
// 		$.ajax({ url: "",
// 					type: "POST",
// 					data: {	'action': 'login',
// 								'username': username,
// 								'password':	password
// 					},
// 					success: function(data) {//on success
// 								switch (data) {
// 									case 'user doesnt exist': //the user is'nt in the db..
// 										alert('Sorry, no such user!');
// 									//TODO
// 									break;
// 									case 'bad password': //bad password!
// 										//TODO - user was succesfuly register... what to do now?
// 										alert('bad password!');
// 										break;
// 									case 'internal problem':	//something happand
// 										//TODO -error in register. what to do?
// 										alert('problem in server....');
// 										break;
// 									default: //all good!
// 										window.location.assign('/mail.html');
// 									break;
// 								}
// 					},
// 					fail: function (jqXHR,textStatus,errorThrown){ // when the ajax call fails
// 								// log the error to the console
// 								console.error('The following error occured: '+textStatus,errorThrown);
// 					}
// 				});
// 	});
//
