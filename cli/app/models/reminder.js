import DS from 'ember-data';

var Reminder = DS.Model.extend({
    seconds_before:     DS.attr('number'),
    set_reminders:      DS.hasMany('setReminders'),
    time_before: function(){
        var timeAgo = (moment().format('X'))-this.get('seconds_before');
        return moment(timeAgo, 'X').fromNow();
    }.property('seconds_before')
});

export default Reminder;
