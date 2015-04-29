import Ember from 'ember';

var UnenrolledRoute = Ember.Route.extend({
    model: function() {
        updateCourses(this);
        setTitle('Add Courses');
        return this.store.find('course');
    }
});

export default UnenrolledRoute;
