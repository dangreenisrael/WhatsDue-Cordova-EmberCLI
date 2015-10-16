import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        addCourse: function(course_code) {
            this.transitionTo('courses');
            let route = this;
            course_code = course_code.toUpperCase();
            this.store.createRecord('course',{
                course_code: course_code,
                course_name: "Joining Course ..."
            }).save().then(function(record){
                let error = record.get('error');
                if (error){
                    record.unloadRecord();
                    route.errorMessage(error);
                }
            }).catch(function(){
                route.errorMessage("Are you connected to the internet?");
            });
            this.controllerFor('courses').set('course_code', "");
        },
        removeCourse: function(course){
            course.destroyRecord();
            this.store.unloadAll('assignment');
        },
        checkConnection: function(){
            this.transitionTo('assignments');
        },
        transitionPage: function(destination, title){
            this.transitionTo(destination);
            this.controllerFor('application').set('pageTitle', title);
            this.set('menuOpen', 'menuOpen');
        }
    },
    errorMessage: function(message){
        if (navigator.notification){
            navigator.notification.alert(
                message,
                null,
                'Whoops');
        } else{
            alert(message);
        }
    }
});

