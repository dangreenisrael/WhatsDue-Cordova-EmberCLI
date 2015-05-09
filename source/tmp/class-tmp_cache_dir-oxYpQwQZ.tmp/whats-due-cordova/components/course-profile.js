define('whats-due-cordova/components/course-profile', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CourseProfileComponent = Ember['default'].Component.extend({
        actions: {
            toggleCourse: function toggleCourse() {
                this.sendAction('toggleCourse');
            }
        }
    });

    exports['default'] = CourseProfileComponent;

});