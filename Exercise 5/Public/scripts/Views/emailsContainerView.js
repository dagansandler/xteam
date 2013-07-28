var emailApp = emailApp || {};

var EmailContainerView = Backbone.View.extend({
    model: emailApp.emailCollection,
    el: $('#emails_container'),

    initialize: function() {
        this.model.on('add', this.render, this);
        this.model.on('remove', this.render, this);
    },

    render: function(){

        this.model.fetch({
            success:function(users){
                console.log(users);
            }


        })


        var self = this;
        self.$el.html('');
        _.each(this.model.toArray(), function(email, i){
           self.$el.append((new EmailView({model: email})).render().$el);
        });

        return this;
    }



});