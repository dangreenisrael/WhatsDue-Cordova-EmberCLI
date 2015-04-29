import DS from 'ember-data';

var SetReminder = DS.Model.extend({
    alarm_date:     DS.attr('string'),
    assignment:     DS.belongsTo('assignment'),
    reminder:       DS.belongsTo('reminder'),
    alarm_date_object: function(){
        return new Date(this.get('alarm_date'));
    }.property('alarm_date'),
    future: function(){
        return moment(this.get('alarm_date_object')).isAfter();
    }.property('alarm_date'),
    timestamp: function(){
        return moment(this.get('alarm_date_object')).format('X');
    }.property('alarm_date')
});

export default SetReminder;
