import Ember from 'ember';
import CustomFunctions from 'customFunctions';

var UnenrolledController = Ember.ArrayController.extend({
    model:[],
    filteredData: (function() {
        return this.get('model').filterBy('enrolled', false);
    }).property('model.@each.enrolled'),
    actions: {
        addCourse: function(course) {
            var context = this;
            //if (cordovaLoaded){
            //    cordova.plugins.Keyboard.close();
            //}
            Ember.$.ajax({
                url: CustomFunctions.site+"/courses/"+course.get('id')+"/enrolls",
                type: 'POST',
                data: {"primaryKey":localStorage.getItem('primaryKey')},
                success: function () {
                    course.set('enrolled', true);
                    course.save();

                    CustomFunctions.getUpdates('/assignments', context, 'assignment', {
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
                        CustomFunctions.trackEvent('Course Added', 'Course Name', course.get('course_name'), 'Username', course.get('admin_id'));
                    });
                },
                error: function(){
                    alert("Are you connected to the Internet?");
                    CustomFunctions.trackEvent('Course Adding Failed');
                }
            });
        }
    }
});

export default UnenrolledController;
