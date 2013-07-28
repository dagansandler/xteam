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

        $('#new_email').submit(function(ev){
            var email = new EmailModel({from:$('#from').val(), to:$('#to').val(), subject:$('#subject').val(), body:$('#body').val()});
            emailApp.emailCollection.add(email);
            //emails.render();
            console.log(emailApp.emailCollection.toJSON());
            return false;
        });

        new EmailContainerView();

    });

})(jQuery);