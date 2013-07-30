var emailApp = emailApp || {};


//EmailModel extends the backbone model
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

