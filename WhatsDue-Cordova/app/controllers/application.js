import Ember from 'ember';
/* global CustomFunctions */

var ApplicationController = Ember.Controller.extend({
    actions: {
        reset: function() {
            //localStorage.removeItem('courses');
            //localStorage.removeItem("timestamp_assignment");
            //localStorage.removeItem("timestamp_course");
            //deleteAll(this, 'assignment');
            //deleteAll(this, 'course');
        }
    },
    init: function() {
        if (localStorage.getItem('timestamp_course')==null){
            localStorage.setItem('timestamp_course',0);
        }
        if (localStorage.getItem('timestamp_assignment')==null){
            localStorage.setItem('timestamp_assignment',0);
        }


        Ember.$.ajax({
            url: 'http://ipinfo.io/json',
            type: 'GET',
            context: this,
            success: function (data) {
                var locationInfo = CustomFunctions.LocationInfo(data);
                console.log(locationInfo);
                CustomFunctions.trackEvent('App Opened', "City", locationInfo.city, "Region", locationInfo.region, "Country", locationInfo.country);
            }
        });

        var context = this;

        /*
         * Deal with duplicate reminders
         */

        this.store.find('reminder', {seconds_before: 86400}).then( function(records){
                /* Find Duplicates */
                var totalRecords = records.get('length');
                var counter = 0;
                /* Destroy duplicate reminders */
                records.forEach(function(reminder){
                    counter = counter+1;
                    if (counter < totalRecords){
                        console.log(counter);
                        context.store.find('setReminder',{'reminder': reminder.get('id')}).then(function(setReminders){
                            CustomFunctions.removeSetReminders(setReminders);
                            reminder.destroyRecord();
                        });
                    }
                });
            });

        /*
         *  This deals with the iOS 64 Reminder limit & Default Reminders
         */
        //var cordovaInitiated = setInterval(function() {
        //        if (cordovaLoaded) {
        //
        //
        //
        //            /*First Run*/
        //            if (localStorage.getItem('course_code_update') !== 'updated'){
        //                var reminder = context.store.createRecord('reminder', {
        //                    id: CustomFunctions.primaryKey('reminders'),
        //                    seconds_before: 86400 // 1 day
        //                });
        //                reminder.save();
        //                context.store.find('assignment', {completed: false}).then(function (assignments) {
        //                    assignments.get('content').forEach(function (assignment) {
        //                        CustomFunctions.setReminder(assignment, reminder, context);
        //                    });
        //                });
        //            }
        //
        //            window.plugin.notification.local.cancelAll(function () {
        //                context.store.find('reminder');
        //                context.store.find('assignment').then(function(){
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
        //                            window.plugin.notification.local.add({
        //                                id: reminderId,
        //                                date: date,
        //                                message: message,
        //                                title: title
        //                            });
        //                        });
        //                    });
        //            });
        //
        //            clearInterval(cordovaInitiated);
        //        }
        //    },
        //    5);


        /*
         * First Run
         */

        if (localStorage.getItem('course_code_update') !== 'updated'){
            /*
             * Delete non-active course
             */
            this.get('store').find('course', { enrolled: false }).then(function(record){
                record.content.forEach(function(rec) {
                    Ember.run.once(this, function() {
                        rec.deleteRecord();
                        rec.save();
                    });
                }, this);
            });


            // Mark the update as completed
            localStorage.setItem('course_code_update', 'updated');
        }

        if (localStorage.getItem('courses') == null){
            this.transitionToRoute('enrolled').then(function(){
            });
        }



        /*
         * This is for the back button;
         */

        goHome = function(){
          context.transitionToRoute('assignments');
        };


        setInterval(function(){
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

var goHome;

export default ApplicationController;
