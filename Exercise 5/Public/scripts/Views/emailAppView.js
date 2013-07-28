/*global Backbone, jQuery, _, ENTER_KEY */
var emailApp = emailApp || {};

var EmailAppView = Backbone.View.extend({
    model: new Tweet(),
    initialize: function(){
        this.template = _.template($('#email_template'));
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }


});

//emailApp.emailModel = new EmailAppView();

//(function ($) {
//	'use strict';
//
//	// The Application
//	// ---------------
//
//	// Our overall **AppView** is the top-level piece of UI.
//    emailApp.EmailAppView = Backbone.View.extend({
//
//		// Instead of generating a new element, bind to the existing skeleton of
//		// the App already present in the HTML.
//		//el: '#emailapp'
//
//
//	});
//
//	//
//})(jQuery);
