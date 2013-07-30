var emailApp = emailApp || {};

var EmailView = Backbone.View.extend({
    model: new EmailModel(),

    tagName:'li',

    events: {
        'click #delete_btn' : 'sendDeleteToServer',
		'click .view' : 'toggleEmail'
    },
    //Init function
    initialize: function() {
        this.template = _.template($('#email_template').html());
    },
    //New update
	updateIsRead: function(){
		this.model.set('isRead', true);
		this.$('.isRead').html('<img src="images/read.png" class="mail_icon"/>');
	},
	//Render function
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
		if(this.model.get('isRead') === 'true') {
			/*inject open mail icon*/
			this.$('.isRead').html('<img src="images/read.png" class="mail_icon"/>');
		} else {
			/*inject closed mail icon*/
			this.$('.isRead').html('<img src="images/unread.png" class="mail_icon"/>');
		}
        return this;
    },
    //If the email read or new
	toggleEmail: function() {
		this.updateIsRead();
		this.$('.body').toggle();
   },
	//Send new email to the server
    sendDeleteToServer: function(){
        console.log('OOOOOOOOOO');
        var from = this.$('.from').text();
        var to = this.$('.to').text();
        var subject = this.$('.subject').text();
        var sentDate = this.$('.sentDate').text();
        var isRead = this.$('.isRead').text();
        var body = this.$('.body').text();

        var dataToSend = this.model.toJSON();
        console.log('dataToSend' + dataToSend);


        var newEmailSend = $.ajax({
            url: "/deleteEmail",
            type: "DELETE",
            data: dataToSend,
            dataType: 'json',
            statusCode : {
                200: function(response){
                    console.log(response);
                },
                403: function(response){
                    console.log(response);
                },
                400: function(response){
                    console.log(response);
                }

            }
        });
        emailApp.emailCollection.remove(this.model);

    }
});