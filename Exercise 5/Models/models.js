(function () {
    var server = false, models;
    if (typeof exports !== 'undefined') {
        _ = require('underscore')._;
        Backbone = require('backbone');

        models = exports;
        server = true;
    } else {
        models = this.models = {};
    }

    //
    //models
    //
    
    models.User = Backbone.Model.extend({
		// Default attributes for the user
		//username, password, password confirmation, first name, last name, age
		defaults: {
			username: '',
			password: '',
			firstname: '',
			lastname: '',
			age: 0
		}
	});
    
    models.Email = Backbone.Model.extend({});

})();