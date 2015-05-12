import Ember from 'ember';

/* global CustomUI */

var CoursesRoute = Ember.Route.extend({
    model: function() {
        CustomUI.setTitle('My Courses');
        return this.store.find('course');
    }
});

export default CoursesRoute;
