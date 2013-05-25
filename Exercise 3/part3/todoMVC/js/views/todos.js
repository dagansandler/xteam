/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
	'use strict';

	// Todo Item View
	// --------------

	// The DOM element for a todo item...
	app.TodoView = Backbone.View.extend({
		//... is a list tag.
		tagName:  'li',

		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),

		// The DOM events specific to an item.
		events: {
			'click .toggle': 'toggleCompleted',
			'dblclick label.title': 'edittitle',
			'dblclick label.todoOwner': 'editowner',
			'click .destroy': 'clear',
			'click .show': 'showExtended',
			'keypress .edit': 'updateOnEnter',
			'blur .edit': 'close'
		},

		// The TodoView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Todo** and a **TodoView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'visible', this.toggleVisible);
		},

		// Re-render the titles of the todo item.
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('completed', this.model.get('completed'));
			this.toggleVisible();
			this.$input = this.$('.edit.title');
			this.$owner = this.$('.edit.owner');
			return this;
		},

		toggleVisible: function () {
			this.$el.toggleClass('hidden', this.isHidden());
		},

		isHidden: function () {
			var isCompleted = this.model.get('completed');
			return (// hidden cases only
				(!isCompleted && app.TodoFilter === 'completed') ||
				(isCompleted && app.TodoFilter === 'active')
			);
		},

		// Toggle the `"completed"` state of the model.
		toggleCompleted: function () {
			this.model.toggle();
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edittitle: function () {
			this.$el.addClass('editingTitle');
			this.$input.focus();
		},
		
		editowner: function () {
			this.$el.addClass('editingOwner');
			this.$owner.focus();
		},

		// Close the `"editing"` mode, saving changes to the todo.
		close: function () {
			var value = this.$input.val().trim();
			var ownerValue = this.$owner.val().trim();

			if (value && ownerValue) {
				this.model.save({ title: value , owner: ownerValue });				
			} else {
				this.clear();
			}

			this.$el.removeClass('editingTitle');
			this.$el.removeClass('editingOwner');
		},

		// If you hit `enter`, we're through editing the item.
		updateOnEnter: function (e) {
			if (e.which === ENTER_KEY) {
				this.close();
			}
		},

		// Remove the item, destroy the model from *localStorage* and delete its view.
		clear: function () {
			/*this.model.trigger('destroy');*/
			this.model.destroy();
		},
		
		/*
		Handler when 's' is clicked.
		*/
		showExtended: function () {
			var m = this.model;
			app.Todos.models.forEach(function(e) {
				if(e !== m && e.get('selected') === true) {
					e.set('selected', false);
				}
			});
			
			this.model.toggleShow();
		}
	});
})(jQuery);
