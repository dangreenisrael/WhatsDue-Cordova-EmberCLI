import Ember from 'ember';
/* global CustomUI */

var AssignmentsRoute = Ember.Route.extend({
    model: function() {
        CustomUI.setTitle('Assignments Due');
        return this.store.find('assignment');
    }
});

export default AssignmentsRoute;
