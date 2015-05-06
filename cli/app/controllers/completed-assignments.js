import Ember from 'ember';

var CompletedAssignmentsController = Ember.ArrayController.extend({
    filteredData: (function() {
        return this.get('model').filterBy('completed',true).sortBy('date_completed')
    }).property('model.@each.archived'),
    sortAscending:  false,
    actions: {
        unRemoveAssignment: function(assignment) {
            var context = this;
            this.store.find('reminder').then( function(reminders) {
                reminders.get('content').forEach(function(reminder){
                    setReminder(assignment, reminder, context);
                });
                assignment.set('completed', false);
                assignment.set('date_completed', null);
                assignment.set('times_changed',assignment.get('times_changed')+1);
                assignment.save();
            });
        }
    }
});

export default CompletedAssignmentsController;
