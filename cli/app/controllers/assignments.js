import Ember from 'ember';

var AssignmentsController = Ember.ArrayController.extend({
    due:(function() {
        var context = this;

        setTimeout(function(){
            var total = context.get('totalDue')+context.get('totalOverdue');
            if(total == 0){
                $('.nothing-due').removeClass('hidden');
                $('.day-divider').addClass('hidden');

            }else{
                $('.nothing-due').addClass('hidden');
                $('.day-divider').removeClass('hidden');

            }
        }, 5);
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',false).sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.archived'),
    totalDue: function() {
        return this.get('due.length');
    }.property('model.@each.due_date', 'model.@each.archived'),
    totalOverdue: function() {
        return this.get('overdue.length');
    }.property('model.@each.due_date', 'model.@each.archived'),
    overdue:(function() {
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',true).filterBy('hidden',false).sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.archived'),
    actions: {
        removeAssignment: function(assignment) {
            var context = this;
            trackEvent('Assignment Completed');
            this.store.find('setReminder',{'assignment': assignment.get('id')}).then(function(setReminders){
                removeSetReminders(setReminders);
                assignment.set('completed', true);
                assignment.set('date_completed', Date.now());
                assignment.save();
                context.send('invalidateModel');
            });
        },
        getLatest: function() {
            this.send('invalidateModel');
        }
    }
});

export default AssignmentsController;
