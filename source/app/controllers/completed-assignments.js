import Ember from 'ember';
/* global CustomFunctions */

var CompletedAssignmentsController = Ember.Controller.extend({
    filteredData: (function() {
        return this.get('model').filterBy('completed',true).sortBy('date_completed');
    }).property('model.@each.completed'),
    sortAscending:  false,
    actions: {
        unRemoveAssignment: function(assignment) {
            assignment.set('completed', false);
            assignment.set('date_completed', null);
            assignment.set('times_changed',assignment.get('times_changed')+1);
            assignment.save();
            var putData = {
                assignment: {
                    completed:       false,
                    completed_date:  null
                }
            };
            Ember.$.ajax({
                url: CustomFunctions.site()+"/assignments/"+assignment.get('id'),
                type: 'PUT',
                data: JSON.stringify(putData),
                contentType: "application/json"
            });
        }
    }
});

export default CompletedAssignmentsController;
