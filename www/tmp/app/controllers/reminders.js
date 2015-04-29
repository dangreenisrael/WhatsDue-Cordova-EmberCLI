import Ember from 'ember';

var RemindersController = Ember.ObjectController.extend({
    init: function() {
    },
    actions: {
        add: function () {
            var newReminders = $('#new-reminder');
            var time = parseInt(newReminders.find('.time').val());
            var context = this;
            if(( time >0) && (this.get('model.length') <= 3) ) {
                var timeFrame = newReminders.find('.time-frame').val();
                var seconds = 0;
                if (timeFrame == "days") {
                    seconds = time * 86400;
                } else if (timeFrame = "hours") {
                    seconds = time * 3600;
                }

                /* Prevent Duplicates */
                this.store.find('reminder', {seconds_before: seconds}).then(function(total){
                   if (total.get('length') == 0){
                       var reminder = context.store.createRecord('reminder', {
                           id: primaryKey('reminders'),
                           seconds_before: seconds
                       });
                       reminder.save().then(
                           putBackable()
                       );
                       $('input').val("");
                       context.store.find('assignment',{completed:false}).then( function(assignments) {
                           assignments.get('content').forEach(function(assignment){
                               setReminder(assignment, reminder, context);
                           });
                       });
                   } else{
                       if (cordovaLoaded){
                           navigator.notification.alert(
                               'This reminder is already set',  // message
                               null,                            // callback
                               'Duplicate Reminer',             // title
                               'OK'                             // buttonName
                           );
                       }
                   }
                });
            }

            /* Fix Keyboard */
            if(cordovaLoaded==true){
                setTimeout(function(){
                    cordova.plugins.Keyboard.close();
                    $('input').blur();
                }, 1)

            }
        },
        remove: function(reminder){
            this.store.find('setReminder',{'reminder': reminder.get('id')}).then(function(setReminders){
                removeSetReminders(setReminders);
                reminder.destroyRecord();
            });
        }
    },
    totalRecords: function() {
        return (this.get('model.length'));
    }.property('[]'),
    maxxedOut: function() {
        return (this.get('model.length') >= 3 );
    }.property('[]'),
    empty: function(){
        return (this.get('model.length') == 0 );
    }.property('[]')
});

export default RemindersController;
