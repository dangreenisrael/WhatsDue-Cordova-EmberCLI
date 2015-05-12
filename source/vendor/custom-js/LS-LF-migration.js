/**
 * Created by Dan on 5/12/15.
 */

var Migration = {
    getCourses: function(){
        var courses = localStorage.getItem('whatsdue-courses');
        if (courses!= null){
            return (JSON.parse(courses)).course.records;
        }
    },
    getAssignments: function(course){
        var assignments = localStorage.getItem('whatsdue-assignment');
        if (assignments!= null){
            return (JSON.parse(assignments)).assignment.records;
        }
    },
    runMigration: function(){
        var store = CustomFunctions.store;
        // Add each course
        Ember.$.each(this.getCourses(), function(index, course) {
            var newCourse = store.createRecord('course', course).save();
            // Add assignments for each course
            Ember.$.each(Migration.getAssignments(), function(index, assignment) {
                if (course.id === assignment.course_id){
                    assignment.course_id = newCourse;
                    store.createRecord('assignment', assignment).save();
                }
            });

        });
        CustomFunctions.updateCourseList();
    }
};