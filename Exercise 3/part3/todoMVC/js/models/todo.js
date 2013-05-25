/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Model
	// ----------

	// Our basic **Todo** model has `title`, `order`, and `completed` attributes.
	app.Todo = Backbone.Model.extend({
		// Default attributes for the todo
		// and ensure that each todo created has `title` and `completed` keys.
		defaults: {
			title: '',
			owner: '',
			time: '',
			selected: false, /* Added: True if the current model content is 
								shown on the extended view, false otherwise */
			completed: false
		},

		// Toggle the `completed` state of this todo item.
		toggle: function () {
			this.save({
				completed: !this.get('completed')
			});
		},
		
		/* Toggle selected attribute */
		toggleShow: function () {
			this.set('selected', !this.get('selected'));
		}
	});
})();
