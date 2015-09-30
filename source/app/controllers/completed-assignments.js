import Ember from 'ember';
/* global CustomFunctions */

var CompletedAssignmentsController = Ember.Controller.extend({
    filteredData: (function() {
        return this.get('model').filterBy('completed',true).sortBy('date_completed');
    }).property('model.@each.completed'),
    sortAscending:  false,
    actions: {
        unRemoveAssignment: function(assignment) {
            let store = this.store;
            assignment.set('completed', false);
            assignment.set('date_completed', null);
            assignment.save().then(function(record){
               store.unloadRecord(record);
            });
        }
    }
});

export default CompletedAssignmentsController;
