/**
 * Created by Dan on 09/11/2015.
 */
import isOnCordova from  'whats-due-cordova/utils/is-on-cordova';
import initializeCordova from 'whats-due-cordova/utils/cordova-stuff' ;
import ENV from 'whats-due-cordova/config/environment';
import Ember from 'ember';

/* global PushNotification, device */
export function initialize(App) {
    let studentUrl = ENV.host + "/" + ENV.namespace + "/students";
    App.deferReadiness();

    let handlePush = function(){
        var push = PushNotification.init(
            {
                android: {
                    senderID: "577888563057", forceShow: true
                },
                ios: {
                    alert: true, badge: true, sound: true
                }
            }
        );
        return new Ember.RSVP.Promise(function(resolve, reject){
            push.on('registration', function (data) {
                window.pushId = data.registrationId;
                var postData = {
                    "uuid": device.uuid,
                    "platform": device.platform,
                    "pushId": window.pushId
                };
                Ember.$.ajax({
                    url: studentUrl,
                    type: 'POST',
                    data: postData,
                    success: function (response) {
                        resolve(response.student);

                    },
                    error: function (reason) {
                        reject (reason);
                    }
                });
            });
            push.on('error', function () {
                alert('We need you to allow push notifications for WhatsDue to work');
                var postData = {
                    "uuid": device.uuid,
                    "platform": "No Push - "+device.platform,
                    "pushId": device.uuid
                };
                Ember.$.ajax({
                    url: studentUrl,
                    type: 'POST',
                    data: postData,
                    success: function (response) {
                        let message = "User did not allow push" + response.student.id;
                        window.trackJs.track(message);
                        resolve(response);

                    },
                    error: function (reason) {
                        reject (reason);
                    }
                });
            });
        });
    };

    document.addEventListener('deviceready', function() {
        let success = function(student){
            window.user = student;
            App.advanceReadiness();
            initializeCordova();
        };

        let fail = function(reason){
            let error = "Problem registering device with server " + device.uuid + reason;
            window.trackJs.track(error);
            console.log(reason);

        };
        if (window.cordova){
            let startItUp = function(){
                if (navigator.onLine){
                    handlePush().then(success, fail);
                } else{
                    navigator.notification.alert(
                        "Please check your internet connection and hit OK",
                        startItUp,
                        'No Internet');
                }
            };
            startItUp();
        } else{
            console.log('Testing in browser');
            var postData = {
                "uuid": Math.random(),
                "platform": "Dummy Device",
                "pushId":  Math.random()
            };
            window.uuid = postData.uuid;
            Ember.$.ajax({
                url: studentUrl,
                type: 'POST',
                data: postData,
                success: function (response) {
                    window.user = response.student;
                    App.advanceReadiness();
                },
                error: function (response) {
                    console.log(response);
                }
            });
        }
    }, false);
    if(!isOnCordova()){
        document.dispatchEvent(new Event('deviceready'));
    }
}

export default {
    name: 'cordova-device-ready',
    initialize: initialize
};