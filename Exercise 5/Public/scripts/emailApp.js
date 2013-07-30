var emailApp = emailApp || {};

(function($) {
    $(document).ready(function() {

        $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
            options.url = 'http://localhost:8080' + options.url;
        });
        var socket = io.connect('http://localhost');


        socket.on('got_email', function (data) {
            //New mail arrived
            console.log(data);
			if(data.from && data.to) {
                //Create new EmailModel
				var newEmailArrived = new EmailModel({
					from: data.from,
					to: data.to,
					sentDate: data.sentDate,
					subject: data.subject,
					body: data.body,
					isRead: 'false'
				});
                //Add the new email to the collection for fire the add event
				emailApp.emailCollection.add(newEmailArrived, {at:0});
			}
        });

        //Handel click event for send new email
        $('#add_email').click(function(){
            //Build the AJAX data
            var myDate = new Date();
            var now = (myDate.getDate()) + '/' + (myDate.getMonth()+1) + '/' + myDate.getFullYear() + ' ' + myDate.getHours()+ ':' + myDate.getMinutes() + ':' + myDate.getSeconds();
            var email = new EmailModel({from:$('#from').val(), to:$('#to').val(), subject:$('#subject').val(), body:$('#body').val(), sentDate: now, isRead:'false'});
            var action = {action: 'sendNewMail'};
            var emailJSON = email.toJSON();
            var dataToSend = $.extend(action, emailJSON);

            var newEmailSend = $.ajax({//sends an AJAX POST request for send the new email
                url: "/sendEmail",
                type: "POST",
                data: dataToSend,
                dataType: 'json',
                statusCode : {
                    200: function(response){
                        console.log(response);
                    },
                    403: function(response){
                        console.log(response);
                    },
                    400: function(response){
                        console.log(response);
                    }

                }
            });
            console.log(emailApp.emailCollection.toJSON());
			$('#new_email')[0].reset();
            return false;
        });
        //create singelton for the collection view
        new EmailContainerView();

    });

})(jQuery);