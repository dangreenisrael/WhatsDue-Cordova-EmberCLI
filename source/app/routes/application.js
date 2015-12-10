import Ember from 'ember';
import ENV from 'whats-due-cordova/config/environment';
/* global device, localforage, PushNotification*/


export default Ember.Route.extend({
    initializeUser: function(){
        if (ENV.environment === 'development') {
            /* jshint ignore:start */
            (function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" "); for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f)}})(document,window.mixpanel||[]);
            window.mixpanel.init("38749de545164d92aac16ff263eb5898");
            /* jshint ignore:end */
        }
    }.on('init'),
    actions: {
        addCourse: function(course_code) {
            let route = this;
            var updateModel = function(){
                route.transitionTo('blankRoute').then(function(){
                    route.transitionTo('assignments.due');
                });
            };
            course_code = course_code.toUpperCase();
            this.store.createRecord('course',{
                course_code: course_code,
                course_name: "Joining Course ..."
            }).save().then(function(record){
                let error = record.get('error');
                if (error){
                    record.unloadRecord();
                    route.errorMessage(error);
                    window.mixpanel.track('Course not Added', {reason: error});
                } else{
                    window.mixpanel.track("Course Added");
                    let courseName = record.get('course_name');
                    updateModel();
                    if (window.cordova){
                        navigator.notification.alert(
                            "All of your tasks will appear here. \n\n" +
                            "When you finish a task, just tap on it and mark it as done!"
                            ,
                            function(){},
                            "You just joined " + courseName,
                            "Got It");
                    }
                }
            }).catch(function(error){
                console.log(error);
                route.errorMessage("Are you connected to the internet?");
                window.mixpanel.track("Course Not Added", {reason: "unknown"});
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
            alert(message);
        }
    },
    errorMessage: function(message){
        alert(message);
    }
});

