import Ember from 'ember';

var AssignmentsRoute = Ember.Route.extend({
    model: function() {
        updateAssignments(this);
        setTitle('Assignments Due');
        return this.store.find('assignment');
    },
    actions: {
        invalidateModel: function() {
            swipeRemove();
            this.refresh();
        }
    },
    afterModel: function() {
        sliderSize();
    }
});

export default AssignmentsRoute;
