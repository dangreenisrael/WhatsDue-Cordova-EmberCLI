import Ember from 'ember';

/* global CustomUI */

var EnrolledRoute = Ember.Route.extend({
    model: function model() {
        CustomUI.setTitle('My Courses');
        return this.store.find('course');
    }
});

export default EnrolledRoute;