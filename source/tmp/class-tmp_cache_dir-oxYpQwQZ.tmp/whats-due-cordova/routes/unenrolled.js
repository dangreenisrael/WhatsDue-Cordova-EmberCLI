define('whats-due-cordova/routes/unenrolled', ['exports', 'ember', 'customFunctions', 'customUI'], function (exports, Ember, CustomFunctions, CustomUI) {

    'use strict';

    var UnenrolledRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomFunctions['default'].updateCourses(this);
            CustomUI['default'].setTitle('Add Courses');
            return this.store.find('course');
        }
    });

    exports['default'] = UnenrolledRoute;

});