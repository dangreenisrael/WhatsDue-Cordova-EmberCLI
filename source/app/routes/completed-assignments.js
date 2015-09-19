import Ember from 'ember';
/* global CustomUI */
var CompletedAssignmentsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('assignment');
    },
    afterModel: function() {
        CustomUI.putBackable();
    }
});

export default CompletedAssignmentsRoute;
