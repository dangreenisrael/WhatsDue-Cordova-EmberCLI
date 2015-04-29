/**
 * Created by dan on 2014-05-17.
 */

App.CourseProfileComponent = Ember.Component.extend({
    actions: {
        toggleCourse: function() {
            this.sendAction('toggleCourse');
        }
    }
});
