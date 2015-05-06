import Ember from 'ember';
/* global CustomFunctions */

var AssignmentsController = Ember.ArrayController.extend({
    due:(function() {
        var context = this;

        setTimeout(function(){
            var total = context.get('totalDue')+context.get('totalOverdue');
            if(total === 0){
                Ember.$('.nothing-due').removeClass('hidden');
                Ember.$('.day-divider').addClass('hidden');

            }else{
                Ember.$('.nothing-due').addClass('hidden');
                Ember.$('.day-divider').removeClass('hidden');

            }
        }, 5);
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',false).sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalDue: function() {
        return this.get('due.length');
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalOverdue: function() {
        return this.get('overdue.length');
    }.property('model.@each.due_date', 'model.@each.completed'),
    overdue:(function() {
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',true).filterBy('hidden',false).sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    actions: {
        removeAssignment: function(assignment) {
            console.log('removed');
            CustomFunctions.trackEvent('Assignment Completed');
            this.store.find('setReminder',{'assignment': assignment.get('id')}).then(function(setReminders){
                CustomFunctions.removeSetReminders(setReminders);
            });
            assignment.set('completed', true);
            assignment.set('date_completed', Date.now());
            assignment.save();
            this.send('invalidateModel');
        },
        getLatest: function() {
            this.send('invalidateModel');
        }
    }
});

export default AssignmentsController;
