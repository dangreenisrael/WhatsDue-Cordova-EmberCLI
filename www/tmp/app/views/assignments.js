import Ember from 'ember';

var AssignmentsView = Ember.View.extend({
    contentDidChange: function() {
        swipeRemove();
    }.observes('controller.filteredData'),
    afterRender: function(){
        sliderSize();
    }
});

export default AssignmentsView;
