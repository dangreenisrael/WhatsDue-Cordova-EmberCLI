import Ember from 'ember';

var EnrolledRoute = Ember.Route.extend({
    model: function() {
        setTitle('My Courses');
        return this.store.find('course');
    }
});

export default EnrolledRoute;
