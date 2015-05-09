import Ember from 'ember';
/* global CustomFunctions */
/* global CustomUI */
var CompletedAssignmentsRoute = Ember.Route.extend({
    model: function model() {
        CustomFunctions.updateAssignments(this);
        CustomUI.setTitle('Recently Completed');
        return this.store.find('assignment');
    },
    afterModel: function afterModel() {
        CustomUI.putBackable();
    }
});

export default CompletedAssignmentsRoute;