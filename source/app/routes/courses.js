import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        return this.store.findAll('course');
    },
    actions: {
        addCourse: function(course_code, model) {
            let route = this;
            course_code = course_code.toUpperCase();
            this.store.createRecord('course',{
                course_code: course_code,
                course_name: "Enrolling in Course ..."
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
        }
    },
    errorMessage: function(message){
        if (navigator.notification){
            navigator.notification.alert(
                message,
                null,
                'Woops');
        } else{
            alert(message);
        }
    },
    beforeModel: function(){
        this.controllerFor('application').set('loading', 'loading');
    },
    afterModel: function(){
        this.controllerFor('application').set('loading', null);
    }
});