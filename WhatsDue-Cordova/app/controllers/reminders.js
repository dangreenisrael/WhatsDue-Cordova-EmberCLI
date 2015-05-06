import Ember from 'ember';
/* global CustomFunctions */
/* global CustomUI */
/* global cordovaLoaded */
/* global cordova */

var RemindersController = Ember.Controller.extend({
    init: function() {
    },
    actions: {
        add: function () {
            var newReminders = Ember.$('#new-reminder');
            var time = parseInt(newReminders.find('.time').val());
            var context = this;
            if(( time >0) && (this.get('model.length') < 3) ) {
                var timeFrame = newReminders.find('.time-frame').val();
                var seconds = 0;
                if (timeFrame === "days") {
                    seconds = time * 86400;
                } else if (timeFrame = "hours") {
                    seconds = time * 3600;
                }
                /* Prevent Duplicates */
                this.store.find('reminder', {seconds_before: seconds}).then(function(){
                       if (cordovaLoaded){
                           navigator.notification.alert(
                               'This reminder is already set',  // message
                               null,                            // callback
                               'Duplicate Reminer',             // title
                               'OK'                             // buttonName
                           );
                       } else {
                           alert('Duplicate');
                       }
                }, function() {
                    // on rejection
                    var reminder = context.store.createRecord('reminder', {
                        id: CustomFunctions.primaryKey('reminders'),
                        seconds_before: seconds
                    });
                    reminder.save().then(
                        CustomUI.putBackable()
                    );
                    Ember.$('input').val("");
                    context.store.find('assignment',{completed:false}).then( function(assignments) {
                        assignments.get('content').forEach(function(assignment){
                            CustomFunctions.setReminder(assignment, reminder, context);
                        });
                    });
                });


            }

            /* Fix Keyboard */
            if(cordovaLoaded===true){
                setTimeout(function(){
                    cordova.plugins.Keyboard.close();
                    Ember.$('input').blur();
                }, 1);

            }
        },
        remove: function(reminder){
            console.log(reminder);
            this.store.find('setReminder',{'reminder': reminder.get('id')}).then(function(setReminders){
                CustomFunctions.removeSetReminders(setReminders);
                reminder.destroyRecord();
            }, function(){
                reminder.destroyRecord();
            });
        }
    },
    totalRecords: function() {
        return (this.get('model.length'));
    }.property('model.@each'),
    maxxedOut: function() {
        return (this.get('model.length') >= 3 );
    }.property('model.@each'),
    empty: function(){
        return (this.get('model.length') === 0 );
    }.property('model.@each')
});

export default RemindersController;
