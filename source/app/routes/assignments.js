import Ember from 'ember';

var AssignmentsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('assignment');
    }
});

export default AssignmentsRoute;
