var emailApp = emailApp || {};

var EmailContainerView = Backbone.View.extend({
    model: emailApp.emailsContainer,
    el: $('#emails_container'),

    render: function(){
        var self = this;
        _.each(this.model, function(email, i){
           self. $el.append(new EmailView)
        });

        return this;
    }



});