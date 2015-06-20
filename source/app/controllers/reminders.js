import Ember from 'ember';

/* global moment*/

export default Ember.Controller.extend({
    init: function() {

    }.on('init'),
    hours: function(){
        return this.get('model').get('notification_time_local').substring(0, 2);
    }.property(),
    minutes: function(){
        return this.get('model').get('notification_time_local').substring(2, 4);
    }.property(),
    actions: {
        save: function () {
           this.save();
        }
    },
    save: function(){
        var hours = this.get('hours');
        var minutes = this.get('minutes');
        var local = moment().hours(hours).minutes(minutes);
        this.get('model').set('notification_time_local', local.format('HHmm'));
        this.get('model').set('notification_time_utc', local.utcOffset('UTC').format('HHmm'));
        this.get('model').save();
        console.log('save');
    },
    watchElements: function(){
        this.save();
    }.observes('model.notifications','model.notification_updates', 'hours', 'minutes')
});