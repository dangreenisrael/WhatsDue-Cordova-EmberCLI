var pushNotification = window.plugins.pushNotification;
var cordovaLoaded = false;
var baseURL;
var studentId;
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
    // function, we must explicitly call 'cordovaApp.receivedEvent(...);'
    onDeviceReady: function() {
        cordovaApp.receivedEvent('deviceready');
        console.log('Device Ready');
        cordovaLoaded = true;

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        //pushNotification.register(cordovaApp.successHandler, cordovaApp.errorHandler,{"senderID":"577888563057","ecb":"cordovaApp.onNotificatioLoaded});
        if ( device.platform == 'android' || device.platform == 'Android'){
            pushNotification.register(
                cordovaApp.successHandler,
                cordovaApp.errorHandler,
                {
                    "senderID":"577888563057",
                    "ecb":"cordovaApp.onNotificationGCM"
                });
        } else {
            pushNotification.register(
                cordovaApp.tokenHandler,
                cordovaApp.errorHandler,
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
            "pushId":    result
        };
        console.log(postData);
        $.ajax({
            url: baseURL+"/students",
            type: 'POST',
            data: postData,
            success: function (response) {
                console.log(postData);
                console.log(response);
                localforage.setItem('studentId', response.student.id);
                CustomFunctions.dealWithUser(response.student);
                studentId = response.student.id;
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
        console.log(error);
        navigator.notification.alert(
            "We couldn't register your device for push notifications.\n\nPlease contact us through the website.",
            null,
            'Oy Gevalt');
    },
    /* These are for Android Push Notifications*/
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                console.log(baseURL);

                var postData = {
                    "uuid":      device.uuid,
                    "platform":  device.platform,
                    "pushId":    e.regid
                };
                $.ajax({
                    url: baseURL+"/students",
                    type: 'POST',
                    data: postData,
                    success: function (response) {
                        localforage.setItem('studentId', response.student.id);
                        CustomFunctions.dealWithUser(response.student);
                        studentId = response.student.id;
                        console.log(studentId);
                    }
                });
                break;
            case 'message':
                console.log(e);
                var data = e.payload;
                //if (data.assignmentId){
                //    // This deals with updated assignments
                //    //var updatedAssignment = new CustomEvent('updatedAssignment');
                //    //window.dispatchEvent(updatedAssignment);
                //    function alertDismissed() {
                //        window.location.hash = '/';
                //    }
                //    navigator.notification.alert(
                //        data.message,  // message
                //        alertDismissed,         // callback
                //        data.title,            // title
                //        'OK'                  // buttonName
                //    );
                //}
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
cordovaApp.initialize();
