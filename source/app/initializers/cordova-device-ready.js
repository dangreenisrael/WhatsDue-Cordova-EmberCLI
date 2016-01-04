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
    document.addEventListener('deviceready', function() {
        if (window.cordova){
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
                        window.user = response.student;
                        App.advanceReadiness();
                        initializeCordova();
                    },
                    error: function (response) {
                        let error = "Problem registering device with server" + window.user.id + response;
                        window.trackJs.track(error);
                    }
                });
            });
            push.on('error', function () {
                alert('We need you to allow push notifications for WhatsDue to work');
                var postData = {
                    "uuid": device.uuid,
                    "platform": "No Push - "+device.platform,
                    "pushId": "No Push"
                };
                Ember.$.ajax({
                    url: studentUrl,
                    type: 'POST',
                    data: postData,
                    success: function (response) {
                        window.user = response.student;
                        App.advanceReadiness();
                        initializeCordova();
                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            });
        } else{
            console.log('no cordova');
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