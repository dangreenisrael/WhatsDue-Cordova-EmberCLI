import Ember from 'ember';
/* global CustomUI */

var CompletedAssignmentsView = Ember.View.extend({
    contentDidChange: function() {
        CustomUI.putBackable();
    }.observes('controller.filteredData')
});

export default CompletedAssignmentsView;
