import Ember from 'ember';

/**
 * Created by dan on 2014-05-17.
 */

var CourseProfileComponent = Ember.Component.extend({
    actions: {
        toggleCourse: function() {
            this.sendAction('toggleCourse');
        }
    }
});

export default CourseProfileComponent;
