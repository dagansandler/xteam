var emailApp = emailApp || {};

(function($) {

    //emailApp.emailAppView = new EmailAppView();


   // var email2 = new EmailModel({from:'ran2', to:'Hadass2', subject:'xxx2', body:'yyy2'});
  //  var emails = new EmailCollection();
  //  emailApp.emailsCollections = emails;
   // console.log(emails.toJSON());


    $(document).ready(function() {

        $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
            options.url = 'http://localhost:8080' + options.url;
        });
        var socket = io.connect('http://localhost');


        socket.on('got_email', function (data) {
            console.log(data);
            var newEmailArrived = new EmailModel({
                from: data.from,
                to: data.to,
                sentDate: data.date,
                subject: data.subject,
                body: data.body,
                isRead: 'false'
            });

            emailApp.emailCollection.add(newEmailArrived, {at:0});
        });

        $('#delete_btn').click(function(){
            console.log(this);
        });

        $('#new_email').click(function(){

            var myDate = new Date();
           // $.formar.date
            var now = (myDate.getDate()) + '/' + (myDate.getMonth()+1) + '/' + myDate.getFullYear() + '/' + myDate.getHours()+ '/' + myDate.getMinutes() + '/' + myDate.getSeconds();
            var email = new EmailModel({from:$('#from').val(), to:$('#to').val(), subject:$('#subject').val(), body:$('#body').val(), sentDate: now, isRead:'false'});
            //emailApp.emailCollection.add(email);
            //emails.render();
            var action = {action: 'sendNewMail'};
            var emailJSON = email.toJSON();
            var dataToSend = $.extend(action, emailJSON);
            var newEmailSend = $.ajax({
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
            return false;
        });

        new EmailContainerView();

    });

})(jQuery);