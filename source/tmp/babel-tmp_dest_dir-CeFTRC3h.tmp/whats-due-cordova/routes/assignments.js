import Ember from 'ember';
/* global CustomUI */

console.log(CustomUI);
var AssignmentsRoute = Ember.Route.extend({
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

export default AssignmentsRoute;