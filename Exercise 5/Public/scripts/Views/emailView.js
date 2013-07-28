var emailApp = emailApp || {};

var EmailView = Backbone.View.extend({
    model: new EmailModel(),

    tagName:'li',

    initialize: function() {
        this.template = _.template($('#email_template').html());
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});