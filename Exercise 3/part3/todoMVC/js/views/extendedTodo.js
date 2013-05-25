var app = app || {};

(function ($) {
	'use strict';

	/* Todo Item View */
	/* -------------- */

	/* The DOM element for a todo item... */
	app.ExtendedTodo = Backbone.View.extend({
		
		/* Cache the template function for a single item */
		template: _.template($('#extended-item-template').html()),

		/* The DOM events specific to an item */
		events: {
		},
		/* listen to change, destroy and updateListeners */
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.hideView);
			this.listenTo(this, 'updateListeners', this.updateListeners);
			/*this.listenTo(this.model, 'visible', this.toggleVisible);*/
		},

		/* Re-render the titles of the todo item */
		render: function () {
			if(this.model.get('selected') === true) {
				this.$el.html(this.template(this.model.toJSON()));
				this.$el.show(); /* show the extendedView if needed */
			} else {
				this.$el.hide(); /* hide the extended if needed */
			}
			return this;
		},
		
		hideView: function() {
			this.$el.hide('fast');
		}
		,
		/*
		If the content of the model is switch to a new content, 
		bind a new model to the relevant event.
		*/
		updateListeners: function() { 
			this.stopListening(null, 'change');
			this.stopListening(null, 'destroy');
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.hideView);
		}
		
	});
})(jQuery);