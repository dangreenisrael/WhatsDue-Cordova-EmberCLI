import Ember from 'ember';
/* global CustomFunctions */
/* global cordovaLoaded */
/* global cordova */

var RemindersController = Ember.Controller.extend({
    init: function() {
    },
    actions: {
        add: function(){
            var newReminders = Ember.$('#new-reminder');
            var time = parseInt(newReminders.find('.time').val());
            var timeFrame = newReminders.find('.time-frame').val();
            var seconds = 0;
            if (timeFrame === "days") {
                seconds = time * 86400;
            } else if (timeFrame === "hours") {
                seconds = time * 3600;
            }
            if(( time >0) && (this.get('model.length') < 3) ) {
                CustomFunctions.createReminders(seconds);
            }
            /* Fix Keyboard */
            if(typeof cordovaLoaded !== "undefined"){
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
