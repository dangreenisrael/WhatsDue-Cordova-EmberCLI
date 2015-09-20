import Ember from 'ember';
/* global CustomFunctions */
/* global cordovaLoaded */
/* global cordova */

var CoursesController = Ember.ArrayController.extend({
    model:[],
    filteredData: function() {
        this.set('sortProperties', 'admin_id');
        return this.get('model').filterBy('enrolled', true).sortBy('admin_id', 'course_name');
    }.property('model.@each.enrolled'),
    disabled: 'disabled',
    disableAddCourse: function(){
        if (this.get('course_code').length < 6){
            this.set('disabled', 'disabled');
        } else{
            this.set('disabled', null);
        }
    }.observes('course_code'),
    actions: {
        addCourse: function(course_code) {
            var controller = this;
            var store = this.store;
            course_code = course_code.toUpperCase();
            this.set('course_code', "");
            var addCourse = Ember.$('#addCourse');
            addCourse.find('button').addClass('disabled');

            Ember.$.ajax({
                url: CustomFunctions.site() + "/courses/"+course_code + "/enroll",
                type: 'PUT',
                success: function (resp) {
                    CustomFunctions.updateCourseList();
                    if(cordovaLoaded === true){
                        cordova.plugins.Keyboard.close();
                    }
                    if (!store.hasRecordForId('course',resp.course.id)) {
                        store.recordForId('course', resp.course.id).unloadRecord(); // Quirk when deleting and re-adding
                        var course = store.createRecord('course',resp.course);
                        course.save();
                        CustomFunctions.getUpdates('/assignments', 'assignment', {
                            'courses': "[" + course.get('id') + "]",
                            'sendAll': true
                        }, true);

                        //CustomFunctions.updateCourseList();
                        controller.set('course_code', "");
                        CustomFunctions.trackEvent("Course Added", "Course", course.get('course_name'), "Instructor", course.get('instructor_name'), "School", course.get('school_name'));
                    } else{
                        navigator.notification.alert(
                            'It looks like you\'re already in that course',
                            null,
                            'Woops');
                    }
                },
                error: function (resp){
                    if (resp.statusText === "Course Not Found"){
                        navigator.notification.alert(
                            'Looks like you typed in the wrong course code',
                            null,
                            'Woops');
                        addCourse.removeClass('disabled');

                    }else{
                        navigator.notification.alert(
                            'Something went wrong, are you connected to the internet?',
                            null,
                            'Woops');
                    }
                }
            });

        },
        removeCourse: function(course) {
            var context = this;
            Ember.$.ajax({
                url: CustomFunctions.site()+"/courses/"+course.get('id') + "/unenroll",
                type: 'PUT',
                data: {"primaryKey":localStorage.getItem('primaryKey')},
                success: function () {
                    context.store.find('assignment',{'course_id':course.get('id')}).then(function(assignments){
                        assignments.content.forEach(function(assignment) {
                            assignment.destroyRecord();
                        }, context);
                    });
                    course.destroyRecord().then(function(){
                        CustomFunctions.updateCourseList();
                    });
                    CustomFunctions.trackEvent('Course Removed', 'Course Name', course.get('course_name'));
                },
                error: function(){
                    alert("Are you connected to the Internet?");
                    CustomFunctions.trackEvent('Course Remove Failed');
                }
            });
        }
    }
});

export default CoursesController;
