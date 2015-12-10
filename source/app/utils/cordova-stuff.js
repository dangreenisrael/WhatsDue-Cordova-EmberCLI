/**
 * Created by Dan on 10/11/2015.
 */
import ENV from 'whats-due-cordova/config/environment';
import Ember from 'ember';
/* global device, PushNotification, localforage */
export default function () {
    let onSuccess = function () {
        console.log('Success');
    };

    let onFail = function (reason) {
        console.log('Failed: ' + reason);
    };

    window.mixpanel.init(ENV.mixpanelId, onSuccess, onFail);
    window.mixpanel.track('App Opened');

    let mixpanelUser = function (user) {
        console.log(user);
        window.mixpanel.people.identify(user.id, onSuccess, onFail);
        window.mixpanel.people.set({
            "$created": user.signup_date,
            "$last_login": new Date(),
            'System ID': user.id,
            '$first_name': user.first_name,
            '$last_name': user.last_name,
            'Parent\'s Email': user.parent_email,
            'Role': user.role,
            'Over 12': user.over12
        });
    };

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
        }
    );

    push.on('registration', function (data) {

        var postData = {
            "uuid": device.uuid,
            "platform": device.platform,
            "pushId": data.registrationId
        };
        console.log(postData);
        Ember.$.ajax({
            url: ENV.host + "/" + ENV.namespace + "/students",
            type: 'POST',
            data: postData,
            success: function (response) {
                localforage.setItem('studentId', response.student.id);
                window.user = response.student;
                window._trackJs = {
                    userId: response.student.id
                };
                window.mixpanel.people.setPushId(
                    data.registrationId,
                    mixpanelUser(response.student),
                    function () {
                        console.log(response);
                    }
                );
            },
            error: function (response) {
                console.log(response);
            }
        });
    });

    push.on('error', function () {
        //controller.sendAction('errorMessage', "We couldn't sign you up for push notifications");
    });

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
        Ember.run.later(this, function(){
            window.branch.init(ENV.branchKey, function(err, data) {
                if (!err && data.data) {
                    var parsed_data = JSON.parse(data.data);
                    console.log(parsed_data);
                    var courseCode = parsed_data['course_code'];
                    if (courseCode) {
                        window.addCourse(courseCode);
                    }
                }
            });
        }, 500);
    };

    function onResume() {
        window.initializeBranch();
    }
    function onPause() {
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

}