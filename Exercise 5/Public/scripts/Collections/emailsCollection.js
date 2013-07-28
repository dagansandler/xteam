var emailApp = emailApp || {};

var EmailCollection = Backbone.Collection.extend({
    model: emailApp.emailModel
});

emailApp.emailCollection = new EmailCollection();
    
