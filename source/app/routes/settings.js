import Ember from 'ember';

/* global moment*/
/* global datePicker */
/* global CustomFunctions */

export default Ember.Route.extend({
    model: function(){
        return this.store.findAll('student').then(function(records){
            return records.get('firstObject');
        });
    },
    actions: {
        toggleAge: function(model){
            model.toggleProperty('over12');
            model.save();
        },
        save: function(){
            this.currentModel.save();
        },
        setRole: function(model, role){
            model.set('role', role);
            model.save();
            CustomFunctions.setUserProperty('Role', role);
        },
        datePicker: function(){
            var student = this.currentModel;
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
    saveTime: function(){
        var student = this.currentModel;
        var hours = student.get('hours');
        var minutes = student.get('minutes');
        var local = moment().hours(hours).minutes(minutes);
        student.set('notification_time_local', local.format('HHmm'));
        student.set('notification_time_utc', local.utcOffset('UTC').format('HHmm'));
        student.save();
    },
    beforeModel: function(){
        this.controllerFor('application').set('loading', 'loading');
    },
    afterModel: function(){
        this.controllerFor('application').set('loading', null);
    }
});