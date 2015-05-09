define('whats-due-cordova/routes/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomFunctions.updateAssignments(this);
            CustomUI.setTitle('Recently Completed');
            return this.store.find('assignment');
        },
        afterModel: function afterModel() {
            CustomUI.putBackable();
        }
    });

    exports['default'] = CompletedAssignmentsRoute;

});