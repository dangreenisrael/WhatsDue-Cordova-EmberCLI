import Ember from 'ember';
/* global CustomFunctions */

export default Ember.Route.extend({
    model: function() {
        return this.store.findAll('assignment');
    },
    afterModel() {
            this.transitionTo('assignments.due');
    },
    actions: {
        removeAssignment: function(assignment) {
            assignment.set('completed', true);
            assignment.set('date_completed', Date.now());
            assignment.save();
            var putData = {
                assignment: {
                    completed:       true,
                    completed_date:  Date.now()
                }
            };
            Ember.$.ajax({
                url: CustomFunctions.site()+"/assignments/"+assignment.get('id'),
                type: 'PUT',
                data: JSON.stringify(putData),
                contentType: "application/json"
            });
            CustomFunctions.trackEvent('Assignment Completed');
        }
    }
});