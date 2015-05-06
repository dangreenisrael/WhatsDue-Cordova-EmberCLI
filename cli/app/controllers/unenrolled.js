import Ember from 'ember';

var UnenrolledController = Ember.ArrayController.extend({
    model:[],
    filteredData: (function() {
        return this.get('model').filterBy('enrolled', false);
    }).property('model.@each.enrolled'),
    actions: {
        addCourse: function(course) {
            var context = this;
            if (cordovaLoaded){
                cordova.plugins.Keyboard.close();
            }
            $.ajax({
                url: site+"/courses/"+course.get('id')+"/enrolls",
                type: 'POST',
                data: {"primaryKey":localStorage.getItem('primaryKey')},
                success: function (response) {
                    course.set('enrolled', true);
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
                    //
                    context.transitionToRoute('enrolled').then(function(){
                        trackEvent('Course Added', 'Course Name', course.get('course_name'), 'Username', course.get('admin_id'));
                    });
                },
                error: function(){
                    alert("Are you connected to the Internet?");
                    trackEvent('Course Adding Failed');
                }
            });
        },
        sendSyllabi: function(){
            trackEvent("Missing Syllabus");
            var subject=encodeURIComponent('Syllabus Request - '+getSchool());
            var body=encodeURIComponent('My class is: ');
            var location = "mailto:aaron@whatsdueapp.com?subject="+subject+"&body="+body;
            this.transitionToRoute('assignments');
        }
    }
});

export default UnenrolledController;
