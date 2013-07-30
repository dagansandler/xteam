var emailApp = emailApp || {};

var EmailCollection = Backbone.Collection.extend({
    model: EmailModel,
    url: '/emails',

//    comparator: function(item){
//        console.log(item.get('sentDate'));
//        return -item.get('sentDate');
//    }
});

emailApp.emailCollection = new EmailCollection();
    
