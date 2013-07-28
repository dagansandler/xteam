var emailApp = emailApp || {};

$(function($) {

    emailApp.emailAppView = new EmailAppView();


   // var email2 = new EmailModel({from:'ran2', to:'Hadass2', subject:'xxx2', body:'yyy2'});
    var emails = new EmailCollection();
    emailApp.emailsContainer = emails;
   // console.log(emails.toJSON());


    $(document).ready(function() {
        $('#new_email').submit(function(ev){
            var email = new EmailModel({from:$('#from').val(), to:$('#to').val(), subject:$('#subject').val(), body:$('#body').val()});
            emails.add(email);
            console.log(emails.toJSON());
            return false;
        })


    });

})(jQuery);