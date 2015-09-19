import Ember from 'ember';
/* global CustomUI */

export default Ember.View.extend({
    contentDidChange: function() {
        CustomUI.putBackable();
    }.observes('controller.filteredData'),
    afterRender: function(){
        CustomUI.makeSpinnable();
        var addCourse = Ember.$('#addCourse');
        addCourse.find('input').val("");
        CustomUI.putBackable();
    }
});


