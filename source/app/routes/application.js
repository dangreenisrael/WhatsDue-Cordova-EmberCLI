import Ember from 'ember';
import ENV from 'whats-due-cordova/config/environment';
/* global device, localforage, PushNotification, CustomFunctions*/
export default Ember.Route.extend({

    pushNotifications: function(){
        if (ENV.environment === 'development') {
            return;
        }

        /* Pause loading while waiting for cordova to load */
        while (typeof device === "undefined"){}

        var push = PushNotification.init(
            {
                android: {
                    senderID: "577888563057",
                    forceShow: true
                },
                ios: {
                    alert: true,
                    badge: true,
                    sound: true
                }
            });

        push.on('registration', function(data) {
            var postData = {
                "uuid":      device.uuid,
                "platform":  device.platform,
                "pushId":    data.registrationId
            };
            Ember.$.ajax({
                url: ENV.host+"/"+ENV.namespace+"/students",
                type: 'POST',
                data: postData,
                success: function (response) {
                    localforage.setItem('studentId', response.student.id);
                    CustomFunctions.dealWithUser(response.student);
                },
                error: function(response){
                    console.log(response);
                }
            });
        });

        push.on('error', function() {
            this.sendAction('errorMessage', "We couldn't sign you up for push notifications");
        });
    }.on('init'),
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

