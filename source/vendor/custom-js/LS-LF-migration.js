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
    getAssignments: function(){
        var assignments = localStorage.getItem('whatsdue-assignment');
        if (assignments!= null){
            return (JSON.parse(assignments)).assignment.records;
        }
    },
    runMigration: function(){
        var store = CustomFunctions.store;
        // Add each course
        Ember.$.each(this.getCourses(), function(index, course) {
            store.createRecord('course', course).save().then(
                function(course){
                    // Add assignments for each course
                    Ember.$.each(Migration.getAssignments(), function(index, assignment) {
                        if (course.id === assignment.course_id){
                            console.log(course);
                            assignment.course_id = course;
                            store.createRecord('assignment', assignment).save();
                        }
                    });
                }
            );
        });
        CustomFunctions.updateCourseList();
    }
};


