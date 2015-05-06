import Ember from 'ember';

var CompletedAssignmentsRoute = Ember.Route.extend({
    model: function() {
        updateAssignments(this);
        setTitle('Recently Completed');
        return this.store.find('assignment');
    },
    afterModel: function() {
        putBackable();
    }
});

export default CompletedAssignmentsRoute;
