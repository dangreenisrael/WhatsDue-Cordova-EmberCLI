import Ember from 'ember';
import CustomFunctions from 'customFunctions';
import CustomUI from 'customUI';

var UnenrolledRoute = Ember.Route.extend({
    model: function model() {
        CustomFunctions.updateCourses(this);
        CustomUI.setTitle('Add Courses');
        return this.store.find('course');
    }
});

export default UnenrolledRoute;