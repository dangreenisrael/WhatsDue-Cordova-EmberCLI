/**
 * Created by dan on 2014-05-15.
 */
var CustomFunctions = {
    setStore: function(context){
        this.store = context.store;
    },
    setApplicationController: function(context){
        this.applicationController = context;
    },

    test: true,
    site: function(){
        if (this.test == true) {
            return "http://test.whatsdueapp.com/app_dev.php/student";
            //return "http://192.168.1.100/app_dev.php/student";
        } else {
            function ignoreError()
            {
                return true
            }
            window.onerror=ignoreError();
            return "https://admin.whatsdueapp.com/student";
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
            mixpanel.track(event);
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
                callback(0)
            }
        });
    },
    /** This gets ALL different types of updates - DON'T fucking touch this **/
    getUpdates: function(url, model, headers) {
        var store = this.store;
        url = this.site()+url;
        var update = function (timestamp) {
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
                                        thisRecord.set('assignment_name',   assignment.assignment_name);
                                        thisRecord.set('archived',          assignment.archived);
                                        thisRecord.set('due_date',          assignment.due_date);
                                        thisRecord.set('description',       assignment.description);
                                        thisRecord.set('last_modified',     assignment.last_modified);
                                        thisRecord.set('time_visible',      assignment.time_visible);

                                    } else if (model == 'course') {
                                        thisRecord.set('course_name',       record.course_name);
                                        thisRecord.set('course_description',record.course_description);
                                        thisRecord.set('archived',          record.archived);
                                        thisRecord.set('course_code',       record.course_code);
                                        thisRecord.set('last_modified',     record.last_modified);
                                    }
                                    thisRecord.save();
                                });
                        } else {
                            //// If its new, add it
                            if (model == 'assignment') {
                                store.find('course', record.course_id).then(function (course) {
                                    record.course_id = course;
                                    var assignment = store.createRecord(model, record);
                                        assignment.save();
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
        };
        this.getSetting('timestamp_'+model , update);
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
    },
    dealWithUser: function(user){
        console.log(user.id);
        mixpanel.identify(user.id);
        mixpanel.people.set({
            "$created":         user.signup_date,
            "$last_login":      new Date(),
            'System ID':        user.id,
            '$first_name':      user.first_name,
            '$last_name':       user.last_name,
            'Parent\'s Email':  user.parent_email,
            'Role':             user.role,
            'Over 12':          user.over12
        });
    },
    setUserProperty: function(property, value){
        var json = {};
        json[property]=value;
        mixpanel.people.set(json);
    }
};