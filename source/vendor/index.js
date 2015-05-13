/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var pushNotification = window.plugins.pushNotification;
var cordovaApp = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'cordovareceivedEvent(...);'
    onDeviceReady: function() {
        cordovareceivedEvent('deviceready');
        console.log('Device Ready');

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        //pushNotification.register(cordovasuccessHandler, cordovaerrorHandler,{"senderID":"577888563057","ecb":"cordovaonNotificatioLoaded});
        if ( device.platform == 'android' || device.platform == 'Android'){
            pushNotification.register(
                cordovasuccessHandler,
                cordovaerrorHandler,
                {
                    "senderID":"577888563057",
                    "ecb":"cordovaonNotificationGCM"
                });
        } else {
            pushNotification.register(
                cordovatokenHandler,
                cordovaerrorHandler,
                {
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb":"onNotificationAPN"
                });
        }
    },
    tokenHandler: function (result) {
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
        console.log('device token = ' + result);
        console.log('device UUID = ' + device.uuid);
        console.log('device name = ' + device.platform);
        var postData = {
            "uuid":      device.uuid,
            "platform":  device.platform,
            "pushId":    result,
            "school":    getSchool()
        };
        //console.log(postData);
        $.ajax({
            url: site+"/students",
            type: 'POST',
            data: postData,
            success: function (response) {
                console.log(response);
                CustomFunctions.setSetting("primaryKey", response.primaryKey);
            },
            error: function(response){
                console.log(response)
            }
        });

    },
    successHandler: function(result) {
        console.log('Success Handler = '+result)
     },
    errorHandler:function(error) {
        alert('Error Handler = '+error);
    },
    /* These are for Push Notifications*/
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                    var postData = {
                    "uuid":      device.uuid,
                    "platform":  device.platform,
                    "pushId":    e.regid
                    };
                    //console.log(postData);
                    $.ajax({
                        url: site+"/students",
                        type: 'POST',
                        data: postData,
                        success: function (response) {
                            CustomFunctions.setSetting("primaryKey", response.primaryKey);
                        }
                    });
                break;

            case 'message':
                console.log(e);
                var data = e.payload;
                if (data.assignmentId){
                    // This deals with updated assignments
                    var updatedAssignment = new CustomEvent('updatedAssignment');
                    window.dispatchEvent(updatedAssignment);
                    function alertDismissed() {
                        window.location.hash = '/';
                    }
                    navigator.notification.alert(
                        data.message,  // message
                        alertDismissed,         // callback
                        data.title,            // title
                        'OK'                  // buttonName
                    );
                }
                break;

            case 'error':
                console.log('GCM error = '+e.msg);
                break;

            default:
                console.log('An unknown GCM event has occurred');
                break;
        }
    },
    onNotificationAPN: function (event) {
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}
    
};
cordovainitialize();

export default undefined;
