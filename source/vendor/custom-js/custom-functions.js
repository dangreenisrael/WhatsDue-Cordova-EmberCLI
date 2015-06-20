/**
 * Created by dan on 2014-05-15.
 */
var CustomFunctions = {
    setStore: function(context){
        this.store = context.store;
    },
    consumerId: 515,
    test: true,
    site: function(){
        if (this.test == true) {
            //var site = "http://stage.whatsdueapp.com/student";
            return "http://127.0.0.1/app_dev.php/student";
        } else {
            function ignoreError()
            {
                return true
            }
            window.onerror=ignoreError();
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
        if (cordovaLoaded === true) {
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
    setSetting: function(key, value){
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
    getSetting: function(key, callback){
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
                headers.timestamp = timestamp.get('value');
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
                                        });
                                    });
                            } else {
                                //// If its new, add it
                                if (model == 'assignment') {
                                    store.find('course', record.course_id).then(function (course) {
                                        record.course_id = course;
                                        var assignment = store.createRecord(model, record);
                                        assignment.save().then(function (assignment) {

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


    share: function(message) {
        if (cordovaLoaded === true) {
            cordova.plugins.socialsharing.share(message + "\n\nSent via ",
                null,
                null, //'http://whatsdueapp.com/img/logo-text-white.png',
                'http://whatsdueapp.com')
        } else {
            console.log(message);
        }
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