import Ember from 'ember';

/* global moment*/
/* global datePicker */
/* global CustomFunctions */
export default Ember.Controller.extend({
    init: function() {
    }.on('init'),
    student: function(){
      return this.get('model');
    }.property(),
    studentActive: function(){
        var role = this.get('model.role');
        if (role === 'student'){
            return 'active';
        } else{
            return 'not-active';
        }
    }.property('model.role'),
    parentActive: function(){
        var role = this.get('model.role');
        if (role === 'parent'){
            return 'active';
        } else{
            return 'not-active';
        }
    }.property('model.role'),
    //save: function(){
    //    this.get('student').save();
    //}.observes('student.first_name', 'student.last_name'),
    actions: {
        save: function(){
            this.get('student').save();
        },
        toggleAge: function(model){
            model.toggleProperty('over12');
            model.save();
        },
        saveNotifications: function () {
            this.get('model').toggleProperty('notifications');
            this.save();
        },
        saveUpdateNotifications: function () {
            this.get('model').toggleProperty('notification_updates');
            this.save();
        },
        setRole: function(model, role){
            model.set('role', role);
            model.save();
            CustomFunctions.setUserProperty('Role', role);
        },
        datePicker: function(){
            var student = this.get('model');
            var initialTime = new Date();
            initialTime.setHours(student.get('hours'));
            initialTime.setMinutes(student.get('minutes'));
            initialTime.setSeconds(0);
            var options = {
                date: initialTime,
                mode: 'time',
                androidTheme: 3,
                minuteInterval: 15
            };
            function onSuccess(datetime) {
                datetime = moment(datetime);
                student.set('notification_time_local', datetime.format('HHmm'));
                student.set('notification_time_utc', datetime.utcOffset('UTC').format('HHmm'));
                student.save();
            }
            datePicker.show(options, onSuccess);
        }
    },
    save: function(){
        var student = this.get('student');
        var hours = student.get('hours');
        var minutes = student.get('minutes');
        var local = moment().hours(hours).minutes(minutes);
        student.set('notification_time_local', local.format('HHmm'));
        student.set('notification_time_utc', local.utcOffset('UTC').format('HHmm'));
        student.save();
    }
});