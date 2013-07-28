var emailApp = emailApp || {};

var EmailCollection = Backbone.Collection.extend({
    model: EmailModel,
    url: '/emails'
});

emailApp.emailCollection = new EmailCollection();
    
