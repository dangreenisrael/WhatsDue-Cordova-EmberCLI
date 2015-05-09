define('whats-due-cordova/routes/enrolled', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var EnrolledRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI.setTitle('My Courses');
            return this.store.find('course');
        }
    });

    exports['default'] = EnrolledRoute;

});