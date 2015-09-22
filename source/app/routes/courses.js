import Ember from 'ember';

var CoursesRoute = Ember.Route.extend({
    model: function() {
        return this.store.findAll('course');
    }
});

export default CoursesRoute;
