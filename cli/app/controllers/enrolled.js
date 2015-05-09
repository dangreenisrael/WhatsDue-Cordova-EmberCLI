import Ember from 'ember';

var EnrolledController = Ember.ArrayController.extend({
    model:[],
    filteredData: (function() {
        this.set('sortProperties', 'admin_id');
        return this.get('model').filterBy('enrolled', true).sortBy('admin_id', 'course_name');
    }).property('model.@each.enrolled'),
    actions: {
        addCourse: function(course_code) {
            var context = this;
            course_code = course_code.toUpperCase();
            var addCourse = $('#addCourse');
            addCourse.find('button').addClass('disabled');

            $.ajax({
                url: site+"/courses/"+course_code,
                type: 'GET',
                success: function (resp) {
                    console.log(resp.course);

                    /*
                     * Enroll without break old version - rewrite in August 2015
                     */
                    $.ajax({
                        url: site + "/courses/" + resp.course.id + "/enrolls",
                        type: 'POST',
                        data: {"primaryKey": localStorage.getItem('primaryKey')},
                        success: function (response) {
                            if (!context.store.hasRecordForId('course',resp.course.id)) {
                                var course = context.store.createRecord('course',resp.course);
                                course.save();

                                getUpdates('/assignments', context, 'assignment', {
                                    'courses': "[" + course.get('id') + "]",
                                    'sendAll': true
                                }, true);

                                // Add course to local storage;
                                var courses = localStorage.getItem('courses');
                                if (courses !== null) {
                                    courses = courses + "," + course.get('id');
                                    localStorage.setItem('courses', courses);
                                } else{
                                    localStorage.setItem('courses', course.get('id'));
                                }
                                context.set('course_code', "");
                            }

                        }
                    });

                },
                error: function (resp){
                    console.log(resp);
                    if (resp.statusText == "Course Not Found"){
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
            $.ajax({
                url: site+"/courses/"+course.get('id') +"/unenrolls",
                type: 'POST',
                data: {"primaryKey":localStorage.getItem('primaryKey')},
                success: function (response) {

                    context.store.find('assignment',{'course_id':course.get('id')}).then(function(assignments){
                        assignments.content.forEach(function(assignment) {
                            Ember.run.once(context, function() {
                                this.store.find('setReminder',{'assignment': assignment.get('id')}).then(function(setReminders){
                                    removeSetReminders(setReminders);
                                    assignment.destroyRecord();
                                });
                            });
                        }, context);
                        course.destroyRecord();
                    });

                    trackEvent('Course Removed', 'Course Name', course.get('course_name'))
                    // Remove Course from local storage
                    var courses = localStorage.getItem('courses');

                    courses = courses.split(',');

                    if (courses.length <= 1) {
                        localStorage.removeItem('courses');
                    } else{
                        // Find and remove courseId from array
                        var i = courses.indexOf(course.get('id'));
                        if(i != -1) {
                            courses.splice(i, 1);
                        }
                        var serialized = courses.toString();
                        localStorage.setItem('courses', serialized);
                    }

                },
                error: function(){
                    alert("Are you connected to the Internet?");
                    trackEvent('Course Remove Failed');
                }
            });

        }
    }
});

export default EnrolledController;