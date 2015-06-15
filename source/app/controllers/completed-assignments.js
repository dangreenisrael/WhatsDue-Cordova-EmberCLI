import Ember from 'ember';
/* global CustomFunctions */

var CompletedAssignmentsController = Ember.ArrayController.extend({
    filteredData: (function() {
        return this.get('model').filterBy('completed',true).sortBy('date_completed');
    }).property('model.@each.completed'),
    sortAscending:  false,
    actions: {
        unRemoveAssignment: function(assignment) {
            var context = this;
            assignment.set('completed', false);
            assignment.set('date_completed', null);
            assignment.set('times_changed',assignment.get('times_changed')+1);
            assignment.save();
        }
    }
});

export default CompletedAssignmentsController;
