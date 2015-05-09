define('whats-due-cordova/routes/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    console.log(CustomUI);
    var AssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            //CustomFunctions.updateAssignments(this);
            CustomUI.setTitle('Assignments Due');
            return this.store.find('assignment');
        },
        actions: {
            invalidateModel: function invalidateModel() {
                console.log('invalidated');
                CustomUI.swipeRemove();
                this.refresh();
            }
        },
        afterModel: function afterModel() {}
    });

    exports['default'] = AssignmentsRoute;

});