/**
 * Created by dan on 2014-05-15.
 */
var CustomFunctions = {
    setStore: function(context){
        this.store = context.store;
    },
    store: false,
    test: false,
    site: function(){
        if (this.test == true) {
            //var site = "http://stage.whatsdueapp.com/student";
            return "http://test.whatsdueapp.com/app_dev.php/student";
        } else {
            return "http://admin.whatsdueapp.com/student";
        }
    },
    /*
     Analytics
     */
    trackEvent: function(event, firstOption, firstValue, secondOption, secondValue, thirdOption, thirdValue) {
        firstOption = firstOption || null;
        firstValue = firstValue || null;
        secondOption = secondOption || null;
        secondValue = secondValue || null;
        thirdOption = thirdOption || null;
        thirdValue = thirdValue || null;
        var options = {};
        if (firstOption != null) {
            options[firstOption] = firstValue;
            if (secondOption != null) {
                options[secondOption] = secondValue;
                if (thirdOption != null) {
                    options[thirdOption] = thirdValue;
                }
            }
        }
        if (typeof cordovaLoaded != 'undefined') {
            Localytics.tagEvent(event, options, 0);
        } else {
            console.log('tracked' + event);

        }
    },
    /** Bringing In Data from the server **/

    // This is for getting assignment info
    updateAssignments: function() {
        var courseList = function(courses){
            CustomFunctions.getUpdates('/assignments', 'assignment', {
                'courses': "[" + courses + "]"
            });
            CustomFunctions.getUpdates('/messages', 'message', {
                'courses': "[" + courses + "]"
            });
        };
        CustomFunctions.getSetting('course_list', courseList);
    },

    updateCourses: function() {
        var headers = {};   
        this.getUpdates("/all/courses", 'course', headers);
    },
    updateCourseList: function(){
        var course_list = [];
        this.store.find('course').then(function(courses){
            courses.get('content').forEach(function (course) {
                course_list.push( course.get('id') );
            });
            CustomFunctions.setSetting('course_list', course_list.toString());
        });
    },
    addNotification: function(title, message, date) {
        for (i = 0; i < 20; i++) {
            if (typeof cordovaLoaded != 'undefined') {
                window.plugin.notification.local.add({
                    title: title,
                    message: message,
                    date: date
                });
                break;
            } else {
            }
        }
    },

    setSetting(key, value){
        var settingExists = this.store.hasRecordForId('setting', key);
        if (settingExists) {
            // Update Record
            this.store.find('setting', key).then(
                function (record) {
                    record.set('value', value);
                    record.save();
                })
        } else{
            // Create Record
            this.store.createRecord('setting', {
                id: key,
                value: value
            }).save();
        }
    },
    getSetting(key, callback){
        var store = this.store;
        store.find('setting').then(function(){
            var settingExists = store.hasRecordForId('setting', key);
            if (settingExists) {
                store.find('setting', key).then(
                    function (record) {
                        var value = record.get('value');
                        callback(value);
                    });
            } else{
                callback(null)
            }
        });
    },
    /** This gets ALL different types of updates - DON'T fucking touch this **/
    getUpdates: function(url, model, headers) {
        var store = this.store;
        url = this.site()+url;

        this.store.find('setting', 'timestamp_' + model).then(
            function (timestamp) {
                headers.timestamp = timestamp;
                $.ajax({
                    url: url,
                    type: 'GET',
                    headers: headers,
                    success: function (resp) {
                        var response = resp[model];
                        var newTimestamp = resp['meta']['timestamp'];
                        CustomFunctions.setSetting("timestamp_" + model, newTimestamp - 60);
                        $.each(response, function (i, record) {
                            // First see if it exists and try to update it
                            if (store.hasRecordForId(model, record.id)) {
                                store.find(model, record.id).then(
                                    function (thisRecord) {
                                        if (model == 'assignment') {
                                            var assignment = record;
                                            thisRecord.set('assignment_name', assignment.assignment_name);
                                            thisRecord.set('archived', assignment.archived);
                                            thisRecord.set('due_date', assignment.due_date);
                                            thisRecord.set('description', assignment.description);
                                            thisRecord.set('last_modified', assignment.last_modified);

                                        } else if (model == 'course') {
                                            thisRecord.set('course_name', record.course_name);
                                            thisRecord.set('course_description', record.course_description);
                                            thisRecord.set('archived', record.archived);
                                            thisRecord.set('course_code', record.course_code);
                                            thisRecord.set('last_modified', record.last_modified);
                                        }
                                        thisRecord.save().then(function (record) {
                                            CustomUI.swipeRemove();
                                            CustomUI.sliderSize();
                                            if (model == 'assignment') {
                                                /* Remove Old Reminders */
                                                store.find('setReminder', {'assignment': record.get('id')}).then(function (setReminders) {
                                                    CustomFunctions.removeSetReminders(setReminders);
                                                    /* Set New Reminders */
                                                    store.find('reminder').then(function (reminders) {
                                                        reminders.get('content').forEach(function (reminder) {
                                                            CustomFunctions.setReminder(record, reminder);
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                    });
                            } else {
                                // If its new, add it
                                if (model == 'assignment') {
                                    store.find('course', record.course_id).then(function (course) {
                                        record.course_id = course;
                                        var assignment = store.createRecord(model, record);
                                        assignment.save().then(function (assignment) {

                                            /* Set reminders */
                                            store.find('reminder').then(function (reminders) {
                                                reminders.get('content').forEach(function (reminder) {
                                                    CustomFunctions.setReminder(assignment, reminder);
                                                });
                                            });
                                            CustomUI.swipeRemove();
                                            CustomUI.sliderSize();
                                        });
                                    });
                                }
                                else if (model == 'course') {
                                    // Don't add new courses anymore
                                }
                                else {
                                    var newRecord = store.createRecord(model, record);
                                    newRecord.save();
                                }
                            }
                        });
                    }
                });
            });
    },

    /** Start editing again **/

    setReminder: function(assignment, reminder) {
        var duedate_seconds = moment(assignment.get('due_date')).format('X');
        var seconds_before = reminder.get('seconds_before');
        var alarm_date = new Date((duedate_seconds - seconds_before) * 1000);
        var reminder_id = CustomFunctions.primaryKey('setReminders');

        /* If the reminder is going to be set in the future, set it*/
        if (!(moment(alarm_date).isBefore(new Date()))) {
            var message = assignment.get('assignment_name') + " is due in " + reminder.get('time_before');

            if (typeof cordovaLoaded != 'undefined') {
                assignment.get('course_id').then(function (course) {
                    window.plugin.notification.local.add({
                        id: reminder_id,
                        title: course.get('course_name'),
                        message: message,
                        repeat: 'weekly',
                        date: alarm_date
                    });
                });

            } else {
                console.log(reminder_id + ": " + message);
            }

            /* Record the reminder so that we can unset it if it's removed*/
            var reminderRecord = this.store.createRecord('setReminder', {
                id: reminder_id,
                alarm_date: alarm_date,
                assignment: assignment,
                reminder: reminder
            });
            reminderRecord.save().then(
            );
        }
    },

    removeSetReminders: function (setReminders) {
        setReminders.forEach(function (setReminder) {
            var reminderId = setReminder.get('id');
            if (typeof cordovaLoaded != 'undefined') {
                window.plugin.notification.local.cancel(reminderId, function () {
                    // The notification has been canceled
                });
            } else {
                console.log("Canceled ID# "+reminderId);
            }
            setReminder.destroyRecord();
        });
    },

    primaryKey: function(name) {
        window.localStorage.setItem(name, Number(window.localStorage.getItem(name)) + 1);
        return window.localStorage.getItem(name);
    },

    /* Location Info Class */

    LocationInfo: function(data) {
        var user = [];
        user.city = data.city;
        user.country = data.country;
        user.region = data.region;
        return user;
    },
    countInArray: function(haystack, needle) {
        var count = 0;
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] === needle) {
                count++;
            }
        }
        return count;
    }
};