/**
 * Created by dan on 2014-05-13.
 */
App.CourseAdapter = DS.LSAdapter.extend({
    namespace: 'whatsdue-courses'
});

App.AssignmentAdapter = DS.LSAdapter.extend({
    namespace: 'whatsdue-assignment'
});

App.ReminderAdapter = DS.LSAdapter.extend({
    namespace: 'whatsdue-reminder'
});

App.Course = DS.Model.extend({
    course_name:         DS.attr('string'),
    course_code:         DS.attr('string'),
    instructor_name:     DS.attr('string'),
    admin_id:            DS.attr('string'),
    last_modified:       DS.attr('number'),
    created_at:          DS.attr('number'),
    school_name:         DS.attr('string',  {defaultValue: "IDC Herzliya"}),
    enrolled:            DS.attr('boolean', {defaultValue: true}),
    archived:            DS.attr('boolean', {defaultValue: false}),
    assignments:         DS.hasMany('assignment'),
    hidden: function(){
        if (this.get('archived') == true){
            return "hidden";
        }
        else{
            return " ";
        }
    }.property('archived')
});

App.Assignment = DS.Model.extend({
    assignment_name:    DS.attr('string'),
    description:        DS.attr('string',{defaultValue: " "}),
    created_at:         DS.attr('number'),
    due_date:           DS.attr('string'),
    last_modified:      DS.attr('number'),
    archived:           DS.attr('boolean'),
    last_updated:       DS.attr('number', {defaultValue: null}),
    date_completed:     DS.attr('number', {defaultValue: null}),
    enrolled:           DS.attr('boolean', {defaultValue: true}),
    completed:          DS.attr('boolean', {defaultValue: false}),
    course_id:          DS.belongsTo('course', {async:true}),
    set_reminders:      DS.hasMany('setReminders'),
    overdue: function(){
        return moment().isAfter(this.get('due_date'));
    }.property('due_date'),
    hidden: function(){
        return  moment(this.get('due_date')).isBefore(moment().add(-3,'days'));
    }.property('due_date'),
    daysAway: function(){
        return moment(this.get('due_date')).calendar();
    }.property('due_date'),
    timeDue: function(){
        return moment(this.get('due_date')).format('h:mm A');
    }.property('due_date'),
    fromNow: function() {
      return moment(this.get('due_date')).fromNow()
    }.property('due_date'),
    urgencyLabel: function() {
        var now = moment();
        var gap = moment(this.get('due_date'));
        gap = gap.diff(now, 'hours')
        if((gap <= 24) && (gap >= 1)){
            return "orange";
        }
        else if (gap <= 0){
            return "red";
        }
        else{
            return "white";
        }
    }.property('due_date')
});

App.Message = DS.Model.extend({
    username:           DS.attr('string'),
    body:               DS.attr('string'),
    updated_at:         DS.attr('number'),
    course_id:          DS.belongsTo('course', {async:true}),
    date: function(){
        return moment(this.get('updated_at'),"X").format('MMM Do, hh:mm A');
    }.property('updated_at')
});

App.Reminder = DS.Model.extend({
    seconds_before:     DS.attr('number'),
    set_reminders:      DS.hasMany('setReminders'),
    time_before: function(){
        var timeAgo = (moment().format('X'))-this.get('seconds_before');
        return moment(timeAgo, 'X').fromNow();
    }.property('seconds_before')
});

App.SetReminder = DS.Model.extend({
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
