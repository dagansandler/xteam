var emailApp = emailApp || {};

var EmailModel = Backbone.Model.extend({

    defaults: {
        from: '',
        to: '',
        sentDate: '',
        subject: '',
        body: '',
        isRead:''
    }

});

//emailApp.emailModel = new EmailModel();
