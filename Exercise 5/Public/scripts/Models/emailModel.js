var emailApp = emailApp || {};

var EmailModel = Backbone.Model.extend({
    defaults: {
        from: '',
        to: '',
        sentDate: '',
        subject: '',
        body: ''
    }

});

emailApp.emailModel = new EmailModel();
