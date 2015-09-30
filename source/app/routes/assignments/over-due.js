import Ember from 'ember';

var AssignmentsRoute = Ember.Route.extend({
    model: function() {
        return this.store.peekAll('assignment');
    }
});

export default AssignmentsRoute;
