import Ember from 'ember';
/* global CustomUI */

/**
 * Created by dan on 2014-05-14.
 */

var EnrolledView = Ember.View.extend({
    contentDidChange: (function () {
        CustomUI.putBackable();
        console.log('loaded');
    }).observes('controller.filteredData'),
    afterRender: function afterRender() {
        CustomUI.makeSpinnable();
        var addCourse = Ember.$('#addCourse');
        addCourse.find('input').val('');
        CustomUI.putBackable();
    }
});

export default EnrolledView;