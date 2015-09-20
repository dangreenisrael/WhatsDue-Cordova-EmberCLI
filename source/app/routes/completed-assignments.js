import Ember from 'ember';
/* global CustomUI */
var CompletedAssignmentsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('assignment');
    }
});

export default CompletedAssignmentsRoute;
