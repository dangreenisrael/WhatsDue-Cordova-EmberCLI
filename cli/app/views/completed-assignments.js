import Ember from 'ember';

var CompletedAssignmentsView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
    }.observes('controller.filteredData')
});

export default CompletedAssignmentsView;
