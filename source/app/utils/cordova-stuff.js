/**
 * Created by Dan on 10/11/2015.
 */
import ENV from 'whats-due-cordova/config/environment';
import Ember from 'ember';
export default function () {

    let onSuccess = function () {
        console.log('Success');
    };
    let onFail = function (reason) {
        console.log('Failed: ' + reason);
    };


    window.mixpanel.init(ENV.mixpanelId, onSuccess, onFail);
    window.mixpanel.track('App Opened');
    window.mixpanel.identify(window.user.id.toString(), onSuccess, onFail);
    window.mixpanel.people.set({
        "$created": window.user.signup_date,
        "$last_login": new Date(),
        'System ID': window.user.id,
        '$first_name': window.user.first_name,
        '$last_name': window.user.last_name,
        'Parent\'s Email': window.user.parent_email,
        'Role': window.user.role,
        'Over 12': window.user.over12
    }, onSuccess, onFail);

    window.mixpanel.people.setPushId(
        window.pushId,
        onSuccess, onFail
    );

    window.flushMixpanel = setTimeout(function(){
        window.mixpanel.flush();
    }, 5000);


    window.addEventListener('native.keyboardshow', keyboardShowHandler);

    var activeInput;

    function keyboardShowHandler() {
        /*
         iPhone 4 hack
         */
        Ember.$('#contentContainer').css({
            'overflow-y': 'scroll',
            '-webkit-overflow-scrolling': 'touch'
        });
        activeInput = Ember.$(':focus');
    }

    window.addEventListener('native.keyboardhide', keyboardHideHandler);

    function keyboardHideHandler() {
        activeInput.blur();
    }



    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);

    window.initializeBranch = function(){
        alert('starting branch');
        window.branch.init(ENV.branchKey, function(err, data) {
            alert(err, data);
            if (!err && data.data) {
                var parsed_data = JSON.parse(data.data);
                window.trackJs.track("Branch:" + parsed_data);
                var courseCode = parsed_data['course_code'];
                if (courseCode) {
                    window.addCourse(courseCode);
                }
            }
        });
    };



    function onResume() {
        window.initializeBranch();
    }
    function onPause() {
        window.mixpanel.flush();
        window.branch.logout();
    }

    // TODO: handle back button
    //document.addEventListener("backbutton", onBackKeyDown, false);
    //function onBackKeyDown() {
    //    controller.sendAction("transitionPage", "assignments", "Assignments");
    //}

    /* Deep linking hack */
    window.handleOpenURL = function(url) {
        console.log(url);
    };

    /* Universal stuff only on cordova */
    window.alert = function (message) {
        navigator.notification.alert(
            message,
            null,
            'Whoops');
    };


    /* add course universally */
    window.addCourse = function(courseCode){
        let element = Ember.$('#addCourseProgrammatically');
        element.children('input').val(courseCode);
        element.children('input').trigger('keyup');
        element.trigger('click');
    };


    window.trackJs.configure({
        userId: window.user.id.toString()+" - "+window.user.firstName+" "+window.user.lastName
    });


    // Log Emberjs errors to TrackJS
    Ember.onerror = function(error){
        if(window.trackJs) {
            window.trackJs.track(error);
        }
        // Optional pass error through to embers error logger
        Ember.Logger.assert(false, error);
        return true;
    };
    // Log Ember promise errors
    Ember.RSVP.on('error', function(error) {
        if(window.trackJs) {
            window.trackJs.track(error);
        }
        // Optional pass error through to embers error logger
        Ember.Logger.assert(false, error);
        return true;
    });

}