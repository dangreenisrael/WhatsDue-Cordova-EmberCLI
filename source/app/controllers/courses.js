import Ember from 'ember';
/* global CustomFunctions */

var CoursesController = Ember.ArrayController.extend({
    model:[],
    filteredData: (function() {
        this.set('sortProperties', 'admin_id');
        return this.get('model').filterBy('enrolled', true).sortBy('admin_id', 'course_name');
    }).property('model.@each.enrolled'),
    actions: {
        addCourse: function(course_code) {
            var controller = this;
            var store = this.store;
            course_code = course_code.toUpperCase();
            this.set('course_code', "");
            var addCourse = Ember.$('#addCourse');
            addCourse.find('button').addClass('disabled');

            Ember.$.ajax({
                url: CustomFunctions.site()+"/courses/"+course_code,
                type: 'GET',
                success: function (resp) {
                    console.log(resp.course);

                    /*
                     * Enroll without break old version - rewrite in August 2015
                     */
                    Ember.$.ajax({
                        url: CustomFunctions.site() + "/courses/" + resp.course.id + "/enrolls",
                        type: 'POST',
                        data: {"primaryKey": window.localStorage.getItem('primaryKey')},
                        success: function () {
                            if (!store.hasRecordForId('course',resp.course.id)) {
                                store.recordForId('course', resp.course.id).unloadRecord(); // Quirk when deleting and re-adding
                                var course = store.createRecord('course',resp.course);
                                course.save();
                                CustomFunctions.getUpdates('/assignments', 'assignment', {
                                    'courses': "[" + course.get('id') + "]",
                                    'sendAll': true
                                }, true);
                                CustomFunctions.updateCourseList();
                                controller.set('course_code', "");
                                CustomFunctions.trackEvent("Course Added", "Course", course.get('course_name'), "Instructor", course.get('instructor_name'), "School", course.get('school_name'));
                            }
                        }
                    });
                },
                error: function (resp){
                    console.log(resp);
                    if (resp.statusText === "Course Not Found"){
                        alert("Course Code is Wrong");
                        addCourse.removeClass('disabled');

                    }else{
                        alert("Are you connected to the Internet?");
                    }
                }
            });
        },
        removeCourse: function(course) {
            var context = this;
            Ember.$.ajax({
                url: CustomFunctions.site()+"/courses/"+course.get('id') +"/unenrolls",
                type: 'POST',
                data: {"primaryKey":localStorage.getItem('primaryKey')},
                success: function () {
                    context.store.find('assignment',{'course_id':course.get('id')}).then(function(assignments){
                        assignments.content.forEach(function(assignment) {
                            this.store.find('setReminder',{'assignment': assignment.get('id')}).then(function(setReminders){
                                CustomFunctions.removeSetReminders(setReminders);
                                console.log('destroyed Reminder');
                            });
                            assignment.destroyRecord();
                            console.log('destroyed Assignment');
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
