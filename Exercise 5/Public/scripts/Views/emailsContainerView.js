var emailApp = emailApp || {};

var EmailContainerView = Backbone.View.extend({
    model: emailApp.emailCollection,
    el: $('#emails_container'),

    //Init function, called for each EmailContainerView instance
    initialize: function() {
        this.model.fetch();
        this.render();
        this.model.on('add', this.render, this);
        this.model.on('remove', this.render, this);
       // this.bind('remove', this.onModelRemoved, this);
    },
    //render function for the View
    render: function(){
        var self = this;
        self.$el.html('');
        //for each one of the EmailView show on screen
        _.each(this.model.toArray(), function(email, i){
			var mailModel = (new EmailView({model: email}));
			if(mailModel.model.get('to') !== '') {
				self.$el.append(mailModel.render().$el);
			}
        });

        return this;
    },
    //Called when the email want to be deleted
    onModelRemoved: function (model, collection, options){
        console.log('MODEL:' + model);

    }
});