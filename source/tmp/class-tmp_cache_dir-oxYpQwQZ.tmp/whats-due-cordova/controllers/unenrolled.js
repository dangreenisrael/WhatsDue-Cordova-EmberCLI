define('whats-due-cordova/controllers/unenrolled', ['exports', 'ember', 'customFunctions'], function (exports, Ember, CustomFunctions) {

    'use strict';

    var UnenrolledController = Ember['default'].ArrayController.extend({
        model: [],
        filteredData: (function () {
            return this.get('model').filterBy('enrolled', false);
        }).property('model.@each.enrolled'),
        actions: {
            addCourse: function addCourse(course) {
                var context = this;
                //if (cordovaLoaded){
                //    cordova.plugins.Keyboard.close();
                //}
                Ember['default'].$.ajax({
                    url: CustomFunctions['default'].site + '/courses/' + course.get('id') + '/enrolls',
                    type: 'POST',
                    data: { primaryKey: localStorage.getItem('primaryKey') },
                    success: function success() {
                        course.set('enrolled', true);
                        course.save();

                        CustomFunctions['default'].getUpdates('/assignments', context, 'assignment', {
                            courses: '[' + course.get('id') + ']',
                            sendAll: true
                        }, true);

                        // Add course to local storage;
                        var courses = localStorage.getItem('courses');
                        if (courses !== null) {
                            courses = courses + ',' + course.get('id');
                            localStorage.setItem('courses', courses);
                        } else {
                            localStorage.setItem('courses', course.get('id'));
                        }
                        //
                        context.transitionToRoute('enrolled').then(function () {
                            CustomFunctions['default'].trackEvent('Course Added', 'Course Name', course.get('course_name'), 'Username', course.get('admin_id'));
                        });
                    },
                    error: function error() {
                        alert('Are you connected to the Internet?');
                        CustomFunctions['default'].trackEvent('Course Adding Failed');
                    }
                });
            }
        }
    });

    exports['default'] = UnenrolledController;

});