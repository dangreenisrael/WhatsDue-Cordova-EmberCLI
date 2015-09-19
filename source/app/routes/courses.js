import Ember from 'ember';

var CoursesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('course');
    }
});

export default CoursesRoute;
