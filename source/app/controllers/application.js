import Ember from 'ember';
/* global CustomFunctions */
/* global CustomUI */
/* global cordovaLoaded */
/* global Migration */
/* global cordova */


var ApplicationController = Ember.Controller.extend({
    actions: {
        test: function () {
            this.transitionToRoute('assignments');
        }
    },
    init: function () {
        /* Start store injection */
        CustomFunctions.setStore(this);
        /* End store injection */

        Ember.$.ajax({
            url: 'http://ipinfo.io/json',
            type: 'GET',
            context: this,
            success: function (data) {
                var locationInfo = CustomFunctions.LocationInfo(data);
                CustomFunctions.trackEvent('App Opened', "City", locationInfo.city, "Region", locationInfo.region, "Country", locationInfo.country);
            }
        });

        var context = this;

        /*
         * Deal with duplicate reminders
         */

        //this.store.find('reminder', {seconds_before: 86400}).then(function (records) {
        //    /* Find Duplicates */
        //    var totalRecords = records.get('length');
        //    var counter = 0;
        //    /* Destroy duplicate reminders */
        //    records.forEach(function (reminder) {
        //        counter = counter + 1;
        //        if (counter < totalRecords) {
        //            console.log(counter);
        //            context.store.find('setReminder', {'reminder': reminder.get('id')}).then(function (setReminders) {
        //                CustomFunctions.removeSetReminders(setReminders);
        //                reminder.destroyRecord();
        //            });
        //        }
        //    });
        //});

        /*
         *  This deals with the iOS 64 Reminder limit & Default Reminders
         */
        //var cordovaInitiated = setInterval(function () {
        //        if (cordovaLoaded === true) {
        //
        //            cordova.plugins.notification.local.cancelAll(function () {
        //                context.store.find('reminder');
        //                context.store.find('assignment').then(function () {
        //                    CustomUI.swipeRemove();
        //                });
        //                context.store.find('course');
        //                context.store.find('setReminder').then(
        //                    function (reminders) {
        //                        reminders.filterBy('future').sortBy('timestamp').forEach(function (item, index) {
        //                            if (index >= 60) {
        //                                return null;
        //                            }
        //                            var title = item.get('assignment').get('course_id').get('course_name');
        //                            var message = item.get('assignment').get('assignment_name') + " is due in " + item.get('reminder').get('time_before');
        //                            var reminderId = item.get('id');
        //                            var date = item.get('alarm_date_object');
        //                            // All notifications have been canceled
        //                            cordova.plugins.notification.local.schedule({
        //                                id: reminderId,
        //                                at: date,
        //                                text: message,
        //                                title: title
        //                            });
        //                        });
        //                    });
        //            });
        //            clearInterval(cordovaInitiated);
        //        }
        //    },
        //    5);

        /*
         * This is for the back button;
         */


        setInterval(function () {
            CustomFunctions.updateAssignments(context);
            CustomFunctions.updateCourses(context);
        }, 5000);

        /*
         *  This updates record on push notifications
         */
        window.addEventListener('updatedAssignment', function () {
            CustomFunctions.updateAssignments(context);
        });
    }
});
/**
 * Created by dan on 2014-05-13.
 */

export default ApplicationController;
