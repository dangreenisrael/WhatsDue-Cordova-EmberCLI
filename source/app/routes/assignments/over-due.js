import Ember from 'ember';

var AssignmentsRoute = Ember.Route.extend({
    model: function() {
        return this.store.findAll('assignment');
    }
});

export default AssignmentsRoute;
