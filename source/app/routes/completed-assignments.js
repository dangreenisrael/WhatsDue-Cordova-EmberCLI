import Ember from 'ember';
/* global CustomFunctions */
/* global CustomUI */
var CompletedAssignmentsRoute = Ember.Route.extend({
    model: function() {
        CustomFunctions.updateAssignments(this);
        CustomUI.setTitle('Recently Completed');
        return this.store.find('assignment');
    },
    afterModel: function() {
        CustomUI.putBackable();
    }
});

export default CompletedAssignmentsRoute;
