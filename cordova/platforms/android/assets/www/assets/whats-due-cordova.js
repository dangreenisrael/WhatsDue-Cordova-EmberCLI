/* jshint ignore:start */

/* jshint ignore:end */

define('whats-due-cordova/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  /**
   * Created by dan on 2014-05-13.
   */

  var ApplicationAdapter = DS['default'].LSAdapter.extend({
    namespace: 'whatsdue'
  });

  exports['default'] = ApplicationAdapter;

});
define('whats-due-cordova/adapters/assignment', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var AssignmentAdapter = DS['default'].LSAdapter.extend({
        namespace: 'whatsdue-assignment'
    });

    exports['default'] = AssignmentAdapter;

});
define('whats-due-cordova/adapters/course', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var CourseAdapter = DS['default'].LSAdapter.extend({
    namespace: 'whatsdue-courses'
  });

  exports['default'] = CourseAdapter;

});
define('whats-due-cordova/adapters/reminder', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var ReminderAdapter = DS['default'].LSAdapter.extend({
        namespace: 'whatsdue-reminder'
    });

    exports['default'] = ReminderAdapter;

});
define('whats-due-cordova/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'whats-due-cordova/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

    'use strict';

    var App;

    Ember['default'].MODEL_FACTORY_INJECTIONS = true;

    App = Ember['default'].Application.extend({
        modulePrefix: config['default'].modulePrefix,
        podModulePrefix: config['default'].podModulePrefix,
        Resolver: Resolver['default'],
        outputPaths: {
            app: {
                css: {
                    'themes/speech-bubbles': '/app/styles/speech-bubbles.less'
                }
            }
        }
    });

    loadInitializers['default'](App, config['default'].modulePrefix);

    exports['default'] = App;

});
define('whats-due-cordova/components/course-profile', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CourseProfileComponent = Ember['default'].Component.extend({
        actions: {
            toggleCourse: function toggleCourse() {
                this.sendAction('toggleCourse');
            }
        }
    });

    exports['default'] = CourseProfileComponent;

});
define('whats-due-cordova/controllers/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ApplicationController = Ember['default'].Controller.extend({
        actions: {
            reset: function reset() {}
        },
        init: function init() {
            if (localStorage.getItem('timestamp_course') == null) {
                localStorage.setItem('timestamp_course', 0);
            }
            if (localStorage.getItem('timestamp_assignment') == null) {
                localStorage.setItem('timestamp_assignment', 0);
            }

            Ember['default'].$.ajax({
                url: 'http://ipinfo.io/json',
                type: 'GET',
                context: this,
                success: function success(data) {
                    var locationInfo = CustomFunctions.LocationInfo(data);
                    console.log(locationInfo);
                    CustomFunctions.trackEvent('App Opened', 'City', locationInfo.city, 'Region', locationInfo.region, 'Country', locationInfo.country);
                }
            });

            var context = this;

            /*
             * Deal with duplicate reminders
             */

            this.store.find('reminder', { seconds_before: 86400 }).then(function (records) {
                /* Find Duplicates */
                var totalRecords = records.get('length');
                var counter = 0;
                /* Destroy duplicate reminders */
                records.forEach(function (reminder) {
                    counter = counter + 1;
                    if (counter < totalRecords) {
                        console.log(counter);
                        context.store.find('setReminder', { reminder: reminder.get('id') }).then(function (setReminders) {
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

            if (localStorage.getItem('course_code_update') !== 'updated') {
                /*
                 * Delete non-active course
                 */
                this.get('store').find('course', { enrolled: false }).then(function (record) {
                    record.content.forEach(function (rec) {
                        Ember['default'].run.once(this, function () {
                            rec.deleteRecord();
                            rec.save();
                        });
                    }, this);
                });

                // Mark the update as completed
                localStorage.setItem('course_code_update', 'updated');
            }

            if (localStorage.getItem('courses') == null) {
                this.transitionToRoute('enrolled').then(function () {});
            }

            /*
             * This is for the back button;
             */

            goHome = function () {
                context.transitionToRoute('assignments');
            };

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

    var goHome;

    exports['default'] = ApplicationController;

    //localStorage.removeItem('courses');
    //localStorage.removeItem("timestamp_assignment");
    //localStorage.removeItem("timestamp_course");
    //deleteAll(this, 'assignment');
    //deleteAll(this, 'course');

});
define('whats-due-cordova/controllers/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AssignmentsController = Ember['default'].ArrayController.extend({
        due: (function () {
            var context = this;

            setTimeout(function () {
                var total = context.get('totalDue') + context.get('totalOverdue');
                if (total === 0) {
                    Ember['default'].$('.nothing-due').removeClass('hidden');
                    Ember['default'].$('.day-divider').addClass('hidden');
                } else {
                    Ember['default'].$('.nothing-due').addClass('hidden');
                    Ember['default'].$('.day-divider').removeClass('hidden');
                }
            }, 5);
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalDue: (function () {
            return this.get('due.length');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalOverdue: (function () {
            return this.get('overdue.length');
        }).property('model.@each.due_date', 'model.@each.completed'),
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                console.log('removed');
                CustomFunctions.trackEvent('Assignment Completed');
                this.store.find('setReminder', { assignment: assignment.get('id') }).then(function (setReminders) {
                    CustomFunctions.removeSetReminders(setReminders);
                });
                assignment.set('completed', true);
                assignment.set('date_completed', Date.now());
                assignment.save();
                this.send('invalidateModel');
            },
            getLatest: function getLatest() {
                this.send('invalidateModel');
            }
        }
    });

    exports['default'] = AssignmentsController;

});
define('whats-due-cordova/controllers/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsController = Ember['default'].ArrayController.extend({
        filteredData: (function () {
            return this.get('model').filterBy('completed', true).sortBy('date_completed');
        }).property('model.@each.archived'),
        sortAscending: false,
        actions: {
            unRemoveAssignment: function unRemoveAssignment(assignment) {
                var context = this;
                this.store.find('reminder').then(function (reminders) {
                    reminders.get('content').forEach(function (reminder) {
                        CustomFunctions.setReminder(assignment, reminder, context);
                    });
                    assignment.set('completed', false);
                    assignment.set('date_completed', null);
                    assignment.set('times_changed', assignment.get('times_changed') + 1);
                    assignment.save();
                });
            }
        }
    });

    exports['default'] = CompletedAssignmentsController;

});
define('whats-due-cordova/controllers/enrolled', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var EnrolledController = Ember['default'].ArrayController.extend({
        model: [],
        filteredData: (function () {
            this.set('sortProperties', 'admin_id');
            return this.get('model').filterBy('enrolled', true).sortBy('admin_id', 'course_name');
        }).property('model.@each.enrolled'),
        actions: {
            addCourse: function addCourse(course_code) {
                var context = this;
                course_code = course_code.toUpperCase();
                var addCourse = Ember['default'].$('#addCourse');
                addCourse.find('button').addClass('disabled');

                Ember['default'].$.ajax({
                    url: CustomFunctions.site() + '/courses/' + course_code,
                    type: 'GET',
                    success: function success(resp) {
                        console.log(resp.course);

                        /*
                         * Enroll without break old version - rewrite in August 2015
                         */
                        Ember['default'].$.ajax({
                            url: CustomFunctions.site() + '/courses/' + resp.course.id + '/enrolls',
                            type: 'POST',
                            data: { primaryKey: localStorage.getItem('primaryKey') },
                            success: function success() {
                                if (!context.store.hasRecordForId('course', resp.course.id)) {
                                    context.store.recordForId('course', resp.course.id).unloadRecord(); // Quirk when deleting and readding
                                    var course = context.store.createRecord('course', resp.course);
                                    course.save();

                                    CustomFunctions.getUpdates('/assignments', context, 'assignment', {
                                        courses: '[' + course.get('id') + ']',
                                        sendAll: true
                                    }, true);

                                    // Add course to local storage;
                                    var courses = localStorage.getItem('courses');
                                    if (courses !== null) {
                                        courses = courses + ',' + course.get('id');
                                        localStorage.setItem('courses', courses);
                                    } else {
                                        localStorage.setItem('courses', course.get('id'));
                                    }
                                    context.set('course_code', '');
                                }
                            }
                        });
                    },
                    error: function error(resp) {
                        console.log(resp);
                        if (resp.statusText === 'Course Not Found') {
                            alert('Course Code is Wrong');
                            addCourse.removeClass('disabled');
                        } else {
                            alert('Are you connected to the Internet?');
                        }
                    }
                });
            },
            removeCourse: function removeCourse(course) {
                var context = this;
                Ember['default'].$.ajax({
                    url: CustomFunctions.site() + '/courses/' + course.get('id') + '/unenrolls',
                    type: 'POST',
                    data: { primaryKey: localStorage.getItem('primaryKey') },
                    success: function success() {
                        context.store.find('assignment', { course_id: course.get('id') }).then(function (assignments) {
                            assignments.content.forEach(function (assignment) {
                                this.store.find('setReminder', { assignment: assignment.get('id') }).then(function (setReminders) {
                                    CustomFunctions.removeSetReminders(setReminders);
                                    console.log('destroyed Reminder');
                                });
                                assignment.destroyRecord();
                                console.log('destroyed Assignment');
                            }, context);
                        });
                        course.destroyRecord();

                        CustomFunctions.trackEvent('Course Removed', 'Course Name', course.get('course_name'));
                        // Remove Course from local storage
                        var courses = localStorage.getItem('courses');
                        courses = courses.split(',');
                        if (courses.length <= 1) {
                            localStorage.removeItem('courses');
                        } else {
                            // Find and remove courseId from array
                            var i = courses.indexOf(course.get('id'));
                            if (i !== -1) {
                                courses.splice(i, 1);
                            }
                            var serialized = courses.toString();
                            localStorage.setItem('courses', serialized);
                        }
                    },
                    error: function error() {
                        alert('Are you connected to the Internet?');
                        CustomFunctions.trackEvent('Course Remove Failed');
                    }
                });
            }
        }
    });

    exports['default'] = EnrolledController;

});
define('whats-due-cordova/controllers/reminders', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var RemindersController = Ember['default'].Controller.extend({
        init: function init() {},
        actions: {
            add: function add() {
                var newReminders = Ember['default'].$('#new-reminder');
                var time = parseInt(newReminders.find('.time').val());
                var context = this;
                if (time > 0 && this.get('model.length') < 3) {
                    var timeFrame = newReminders.find('.time-frame').val();
                    var seconds = 0;
                    if (timeFrame === 'days') {
                        seconds = time * 86400;
                    } else if (timeFrame = 'hours') {
                        seconds = time * 3600;
                    }
                    /* Prevent Duplicates */
                    this.store.find('reminder', { seconds_before: seconds }).then(function () {
                        if (cordovaLoaded) {
                            navigator.notification.alert('This reminder is already set', // message
                            null, // callback
                            'Duplicate Reminer', // title
                            'OK' // buttonName
                            );
                        } else {
                            alert('Duplicate');
                        }
                    }, function () {
                        // on rejection
                        var reminder = context.store.createRecord('reminder', {
                            id: CustomFunctions.primaryKey('reminders'),
                            seconds_before: seconds
                        });
                        reminder.save().then(CustomUI.putBackable());
                        Ember['default'].$('input').val('');
                        context.store.find('assignment', { completed: false }).then(function (assignments) {
                            assignments.get('content').forEach(function (assignment) {
                                CustomFunctions.setReminder(assignment, reminder, context);
                            });
                        });
                    });
                }

                /* Fix Keyboard */
                if (cordovaLoaded === true) {
                    setTimeout(function () {
                        cordova.plugins.Keyboard.close();
                        Ember['default'].$('input').blur();
                    }, 1);
                }
            },
            remove: function remove(reminder) {
                console.log(reminder);
                this.store.find('setReminder', { reminder: reminder.get('id') }).then(function (setReminders) {
                    CustomFunctions.removeSetReminders(setReminders);
                    reminder.destroyRecord();
                }, function () {
                    reminder.destroyRecord();
                });
            }
        },
        totalRecords: (function () {
            return this.get('model.length');
        }).property('model.@each'),
        maxxedOut: (function () {
            return this.get('model.length') >= 3;
        }).property('model.@each'),
        empty: (function () {
            return this.get('model.length') === 0;
        }).property('model.@each')
    });

    exports['default'] = RemindersController;

});
define('whats-due-cordova/controllers/unenrolled', ['exports', 'ember', 'customFunctions'], function (exports, Ember, CustomFunctions) {

    'use strict';

    var UnenrolledController = Ember['default'].ArrayController.extend({
        model: [],
        filteredData: (function () {
            return this.get('model').filterBy('enrolled', false);
        }).property('model.@each.enrolled'),
        actions: {
            addCourse: function addCourse(course) {
                var context = this;
                //if (cordovaLoaded){
                //    cordova.plugins.Keyboard.close();
                //}
                Ember['default'].$.ajax({
                    url: CustomFunctions['default'].site + '/courses/' + course.get('id') + '/enrolls',
                    type: 'POST',
                    data: { primaryKey: localStorage.getItem('primaryKey') },
                    success: function success() {
                        course.set('enrolled', true);
                        course.save();

                        CustomFunctions['default'].getUpdates('/assignments', context, 'assignment', {
                            courses: '[' + course.get('id') + ']',
                            sendAll: true
                        }, true);

                        // Add course to local storage;
                        var courses = localStorage.getItem('courses');
                        if (courses !== null) {
                            courses = courses + ',' + course.get('id');
                            localStorage.setItem('courses', courses);
                        } else {
                            localStorage.setItem('courses', course.get('id'));
                        }
                        //
                        context.transitionToRoute('enrolled').then(function () {
                            CustomFunctions['default'].trackEvent('Course Added', 'Course Name', course.get('course_name'), 'Username', course.get('admin_id'));
                        });
                    },
                    error: function error() {
                        alert('Are you connected to the Internet?');
                        CustomFunctions['default'].trackEvent('Course Adding Failed');
                    }
                });
            }
        }
    });

    exports['default'] = UnenrolledController;

});
define('whats-due-cordova/helpers/assignment-divider', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/29/15.
     */
    var dueDays = [];
    var assignmentCount = 0;
    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (daysAway, totalDue) {
        assignmentCount++;
        var count = CustomFunctions.countInArray(dueDays, daysAway);
        dueDays.push(daysAway);

        if (totalDue === assignmentCount) {
            assignmentCount = 0;
            dueDays = [];
        }

        var escaped = Ember['default'].Handlebars.Utils.escapeExpression(daysAway);
        if (count === 0) {
            return new Ember['default'].Handlebars.SafeString('<div class="day-divider">' + escaped + '</div>');
        }
    });

});
define('whats-due-cordova/helpers/icon-device', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/29/15.
     */
    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (name, classes, id) {
        name = Ember['default'].Handlebars.Utils.escapeExpression(name);
        id = Ember['default'].Handlebars.Utils.escapeExpression(id);
        classes = Ember['default'].Handlebars.Utils.escapeExpression(classes);
        return new Ember['default'].Handlebars.SafeString('<img src="assets/icons/ios/' + name + '.png" id="' + id + '" class="' + classes + '"/>');
    });

});
define('whats-due-cordova/helpers/linkify-descriptions', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/30/15.
     */
    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (text) {
        if (typeof text === "undefined") {
            return Ember['default'].String.htmlSafe("");
        } else {
            var options = {
                callback: function callback(text, href) {
                    /* Make it open in the default browser */
                    var defaultBrowser = "onclick=\"window.open('" + href + "', '_system')\"";
                    return href ? "<span class=\"link\"" + defaultBrowser + " >" + text + "</a>" : text;
                }
            };
            return Ember['default'].String.htmlSafe(linkify(text, options));
        }
    });

});
define('whats-due-cordova/initializers/app-version', ['exports', 'whats-due-cordova/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('whats-due-cordova/initializers/ember-cli-fastclick', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var EmberCliFastclickInitializer = {
    name: 'fastclick',

    initialize: function initialize() {
      Ember['default'].run.schedule('afterRender', function () {
        FastClick.attach(document.body);
      });
    }
  };

  exports['default'] = EmberCliFastclickInitializer;

});
define('whats-due-cordova/initializers/export-application-global', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('whats-due-cordova/models/assignment', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Assignment = DS['default'].Model.extend({
        assignment_name: DS['default'].attr('string'),
        description: DS['default'].attr('string', { defaultValue: ' ' }),
        created_at: DS['default'].attr('number'),
        due_date: DS['default'].attr('string'),
        last_modified: DS['default'].attr('number'),
        archived: DS['default'].attr('boolean'),
        last_updated: DS['default'].attr('number', { defaultValue: null }),
        date_completed: DS['default'].attr('number', { defaultValue: null }),
        enrolled: DS['default'].attr('boolean', { defaultValue: true }),
        completed: DS['default'].attr('boolean', { defaultValue: false }),
        course_id: DS['default'].belongsTo('course', { async: true }),
        set_reminders: DS['default'].hasMany('setReminders'),
        overdue: (function () {
            return moment().isAfter(this.get('due_date'));
        }).property('due_date'),
        hidden: (function () {
            return moment(this.get('due_date')).isBefore(moment().add(-3, 'days'));
        }).property('due_date'),
        daysAway: (function () {
            return moment(this.get('due_date')).calendar();
        }).property('due_date'),
        timeDue: (function () {
            return moment(this.get('due_date')).format('h:mm A');
        }).property('due_date'),
        fromNow: (function () {
            return moment(this.get('due_date')).fromNow();
        }).property('due_date'),
        urgencyLabel: (function () {
            var now = moment();
            var gap = moment(this.get('due_date'));
            gap = gap.diff(now, 'hours');
            if (gap <= 24 && gap >= 1) {
                return 'orange';
            } else if (gap <= 0) {
                return 'red';
            } else {
                return 'white';
            }
        }).property('due_date')
    });

    exports['default'] = Assignment;

});
define('whats-due-cordova/models/course', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Course = DS['default'].Model.extend({
        course_name: DS['default'].attr('string'),
        course_code: DS['default'].attr('string'),
        instructor_name: DS['default'].attr('string'),
        admin_id: DS['default'].attr('string'),
        last_modified: DS['default'].attr('number'),
        created_at: DS['default'].attr('number'),
        school_name: DS['default'].attr('string', { defaultValue: 'IDC Herzliya' }),
        enrolled: DS['default'].attr('boolean', { defaultValue: true }),
        archived: DS['default'].attr('boolean', { defaultValue: false }),
        assignments: DS['default'].hasMany('assignment'),
        hidden: (function () {
            if (this.get('archived') === true) {
                return 'hidden';
            } else {
                return ' ';
            }
        }).property('archived')
    });

    exports['default'] = Course;

});
define('whats-due-cordova/models/message', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Message = DS['default'].Model.extend({
        username: DS['default'].attr('string'),
        body: DS['default'].attr('string'),
        updated_at: DS['default'].attr('number'),
        course_id: DS['default'].belongsTo('course', { async: true }),
        date: (function () {
            return moment(this.get('updated_at'), 'X').format('MMM Do, hh:mm A');
        }).property('updated_at')
    });

    exports['default'] = Message;

});
define('whats-due-cordova/models/reminder', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Reminder = DS['default'].Model.extend({
        seconds_before: DS['default'].attr('number'),
        set_reminders: DS['default'].hasMany('setReminders'),
        time_before: (function () {
            var timeAgo = moment().format('X') - this.get('seconds_before');
            return moment(timeAgo, 'X').fromNow();
        }).property('seconds_before')
    });

    exports['default'] = Reminder;

});
define('whats-due-cordova/models/set-reminder', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var SetReminder = DS['default'].Model.extend({
        alarm_date: DS['default'].attr('string'),
        assignment: DS['default'].belongsTo('assignment'),
        reminder: DS['default'].belongsTo('reminder'),
        alarm_date_object: (function () {
            return new Date(this.get('alarm_date'));
        }).property('alarm_date'),
        future: (function () {
            return moment(this.get('alarm_date_object')).isAfter();
        }).property('alarm_date'),
        timestamp: (function () {
            return moment(this.get('alarm_date_object')).format('X');
        }).property('alarm_date')
    });

    exports['default'] = SetReminder;

});
define('whats-due-cordova/objects/pollster', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/30/15.
     */

    var Pollster = Ember['default'].Object.extend({
        start: function start() {
            this.timer = setInterval(this.onPoll, 5000);
        },
        stop: function stop() {
            clearInterval(this.timer);
        },
        onPoll: function onPoll() {}
    });

    exports['default'] = Pollster;

    // This gets defined when its called

});
define('whats-due-cordova/router', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    exports['default'] = Router.map(function () {
        this.resource('enrolled', function () {});

        //this.resource('unenrolled', function(){
        //});

        this.resource('assignments', { path: '/' }, function () {});

        this.resource('completedAssignments', function () {});

        this.resource('support', function () {});

        this.resource('messages', function () {});

        this.resource('reminders', function () {});

        this.resource('welcome', function () {});
    });

});
define('whats-due-cordova/routes/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    console.log(CustomUI);
    var AssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            //CustomFunctions.updateAssignments(this);
            CustomUI.setTitle('Assignments Due');
            return this.store.find('assignment');
        },
        actions: {
            invalidateModel: function invalidateModel() {
                console.log('invalidated');
                CustomUI.swipeRemove();
                this.refresh();
            }
        },
        afterModel: function afterModel() {}
    });

    exports['default'] = AssignmentsRoute;

});
define('whats-due-cordova/routes/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomFunctions.updateAssignments(this);
            CustomUI.setTitle('Recently Completed');
            return this.store.find('assignment');
        },
        afterModel: function afterModel() {
            CustomUI.putBackable();
        }
    });

    exports['default'] = CompletedAssignmentsRoute;

});
define('whats-due-cordova/routes/enrolled', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var EnrolledRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI.setTitle('My Courses');
            return this.store.find('course');
        }
    });

    exports['default'] = EnrolledRoute;

});
define('whats-due-cordova/routes/messages', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var MessagesRoute = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find('message');
        }
    });

    exports['default'] = MessagesRoute;

});
define('whats-due-cordova/routes/reminders', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var RemindersRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI.setTitle('Reminders');
            this.store.find('setReminder');
            return this.store.find('reminder');
        }
    });

    exports['default'] = RemindersRoute;

});
define('whats-due-cordova/routes/support', ['exports', 'ember', 'customUI'], function (exports, Ember, CustomUI) {

    'use strict';

    var SupportRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI['default'].setTitle('Support');
        }
    });

    exports['default'] = SupportRoute;

});
define('whats-due-cordova/routes/unenrolled', ['exports', 'ember', 'customFunctions', 'customUI'], function (exports, Ember, CustomFunctions, CustomUI) {

    'use strict';

    var UnenrolledRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomFunctions['default'].updateCourses(this);
            CustomUI['default'].setTitle('Add Courses');
            return this.store.find('course');
        }
    });

    exports['default'] = UnenrolledRoute;

});
define('whats-due-cordova/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("\n                        What's Due\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("span class=\"whatsdue count\"></span");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "icon-device", ["assignments"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("\n                        Completed\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "icon-device", ["completed"], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("\n                        My Courses\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "icon-device", ["courses"], {});
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("\n                        Reminders\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "icon-device", ["reminders"], {});
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("\n                        Feedback & Support\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          inline(env, morph0, context, "icon-device", ["info"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"id","appHeader");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"id","page-title");
        var el3 = dom.createTextNode("\n        Assignments Due\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","content");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","contentContainer");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","left");
        dom.setAttribute(el3,"class","fastAnimate");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"id","menu");
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("ul");
        dom.setAttribute(el5,"id","leftMenu");
        var el6 = dom.createTextNode("\n\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                \n\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n        ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","middle");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","right");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","welcome");
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","share-modal");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","assignment-name");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","buttons");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","button share");
        var el4 = dom.createTextNode("\n            Share\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","button close");
        var el4 = dom.createTextNode("\n            Cancel\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","hidden");
        dom.setAttribute(el2,"class","message");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [2, 1]);
        var element2 = dom.childAt(element1, [1, 1, 1]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        var morph2 = dom.createMorphAt(element2,1,1);
        var morph3 = dom.createMorphAt(element2,3,3);
        var morph4 = dom.createMorphAt(element2,5,5);
        var morph5 = dom.createMorphAt(element2,7,7);
        var morph6 = dom.createMorphAt(element2,9,9);
        var morph7 = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        inline(env, morph0, context, "icon-device", ["menu", "pull-left", "menuToggle"], {});
        inline(env, morph1, context, "icon-device", ["menu", "pull-right hide", "menuToggle"], {});
        block(env, morph2, context, "link-to", ["assignments"], {"tagName": "li"}, child0, null);
        block(env, morph3, context, "link-to", ["completedAssignments"], {"tagName": "li"}, child1, null);
        block(env, morph4, context, "link-to", ["enrolled"], {"tagName": "li"}, child2, null);
        block(env, morph5, context, "link-to", ["reminders"], {"tagName": "li"}, child3, null);
        block(env, morph6, context, "link-to", ["support"], {"tagName": "li"}, child4, null);
        content(env, morph7, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/assignments', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","reveal");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","time");
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","from-now");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode(" ago\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","time-due");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","course");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","info");
          var el4 = dom.createTextNode("\n\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","title");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","description");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n                    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n                ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element5 = dom.childAt(fragment, [3]);
          var element6 = dom.childAt(element5, [1]);
          var element7 = dom.childAt(element5, [3]);
          var element8 = dom.childAt(element7, [1]);
          var element9 = dom.childAt(element7, [3]);
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(dom.childAt(element8, [1]),1,1);
          var morph2 = dom.createMorphAt(dom.childAt(element8, [3]),1,1);
          var morph3 = dom.createMorphAt(dom.childAt(element8, [5]),1,1);
          var morph4 = dom.createMorphAt(dom.childAt(element9, [1]),1,1);
          var morph5 = dom.createMorphAt(dom.childAt(element9, [3]),1,1);
          var morph6 = dom.createMorphAt(element7,5,5);
          inline(env, morph0, context, "assignment-divider", [get(env, context, "assignment.daysAway"), get(env, context, "totalDue")], {});
          element(env, element5, context, "bind-attr", [], {"class": ":slider :left-box"});
          element(env, element6, context, "action", ["removeAssignment", get(env, context, "assignment")], {});
          element(env, element7, context, "bind-attr", [], {"class": ":removable assignment.urgencyLabel"});
          content(env, morph1, context, "assignment.fromNow");
          content(env, morph2, context, "assignment.timeDue");
          content(env, morph3, context, "assignment.course_id.course_name");
          content(env, morph4, context, "assignment.assignment_name");
          inline(env, morph5, context, "linkify-descriptions", [get(env, context, "assignment.description")], {});
          inline(env, morph6, context, "input", [], {"class": "date-due", "type": "hidden", "value": get(env, context, "assignment.daysAway")});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","reveal");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","time");
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","from-now");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","time-due");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","course");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","info");
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","title");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","description");
          var el5 = dom.createTextNode("\n                            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, get = hooks.get, content = hooks.content, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3]);
          var element3 = dom.childAt(element2, [1]);
          var element4 = dom.childAt(element2, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(element3, [1]),1,1);
          var morph1 = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
          var morph2 = dom.createMorphAt(dom.childAt(element3, [5]),1,1);
          var morph3 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
          var morph4 = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
          element(env, element0, context, "bind-attr", [], {"class": ":slider :left-box assignment.hidden"});
          element(env, element1, context, "action", ["removeAssignment", get(env, context, "assignment")], {});
          element(env, element2, context, "bind-attr", [], {"class": ":removable :red assignment.urgencyLabel"});
          content(env, morph0, context, "assignment.fromNow");
          content(env, morph1, context, "assignment.fromNow");
          content(env, morph2, context, "assignment.course_id.course_name");
          content(env, morph3, context, "assignment.assignment_name");
          inline(env, morph4, context, "linkify-descriptions", [get(env, context, "assignment.description")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","newAssignments");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","due");
        var el4 = dom.createTextNode("\n            What's Due\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","badge square black");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","vertical-seperator white");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","overdue");
        var el4 = dom.createTextNode("\n            Overdue\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","badge square black");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","assignments-due");
        dom.setAttribute(el2,"class","needsclick");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","arrow-up");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","assignments-overdue");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","arrow-up");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","day-divider");
        var el4 = dom.createTextNode("\n            Overdue\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","static-content nothing-due hidden");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"src","assets/img/thumbs-up.png");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        dom.setAttribute(el3,"class","centered");
        var el4 = dom.createTextNode("\n            Looks like you've got nothing due\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element10 = dom.childAt(fragment, [0]);
        var element11 = dom.childAt(element10, [1]);
        var element12 = dom.childAt(element10, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element11, [1, 1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element11, [5, 1]),1,1);
        var morph2 = dom.createMorphAt(element12,1,1);
        var morph3 = dom.createMorphAt(element12,5,5);
        var morph4 = dom.createMorphAt(dom.childAt(element10, [5]),5,5);
        content(env, morph0, context, "totalDue");
        content(env, morph1, context, "totalOverdue");
        content(env, morph2, context, "firstOfDay");
        block(env, morph3, context, "each", [get(env, context, "due")], {"keyword": "assignment"}, child0, null);
        block(env, morph4, context, "each", [get(env, context, "overdue")], {"keyword": "assignment"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/completed-assignments', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","slider");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","reveal");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","full");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","helper");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","putBackable fastAnimate");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","info");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","title");
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","course");
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3, 1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),3,3);
          var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),1,1);
          var morph2 = dom.createMorphAt(element2,3,3);
          var morph3 = dom.createMorphAt(dom.childAt(element2, [5]),1,1);
          element(env, element1, context, "action", ["unRemoveAssignment", get(env, context, "assignment")], {});
          inline(env, morph0, context, "icon-device", ["back"], {});
          content(env, morph1, context, "assignment.assignment_name");
          inline(env, morph2, context, "icon-device", ["minus-red"], {});
          content(env, morph3, context, "assignment.course_id.course_name");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","completedAssignments");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","assignments-list");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1]),1,1);
        block(env, morph0, context, "each", [get(env, context, "filteredData")], {"keyword": "assignment"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/enrolled', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","slider left-box");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","reveal");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","putBackable fastAnimate");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","info");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","courseName");
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","instructorName");
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3, 1]);
          var morph0 = dom.createMorphAt(element1,1,1);
          var morph1 = dom.createMorphAt(element2,1,1);
          var morph2 = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
          var morph3 = dom.createMorphAt(dom.childAt(element2, [5]),1,1);
          element(env, element1, context, "action", ["removeCourse", get(env, context, "course")], {});
          inline(env, morph0, context, "icon-device", ["X"], {});
          inline(env, morph1, context, "icon-device", ["minus-red"], {});
          content(env, morph2, context, "course.course_name");
          content(env, morph3, context, "course.instructor_name");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","courses");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("<div class=\"add-something\">");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("<img src=\"assets/icons/ios/plus-big.png\" {{action 'addCourse'}}>");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("Add a Course");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("</div>");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","addCourse");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"disabled","");
        dom.setAttribute(el3,"class","disabled fastAnimate");
        var el4 = dom.createTextNode("Join");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","triangle-isosceles topleft hidden bubble");
        var el3 = dom.createTextNode("\n        Enter your unique class code to join");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        If you don't have one, ask your teacher\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [11]);
        var element5 = dom.childAt(element4, [1]);
        var morph0 = dom.createMorphAt(element3,1,1);
        var morph1 = dom.createMorphAt(element4,3,3);
        block(env, morph0, context, "each", [get(env, context, "filteredData")], {"keyword": "course"}, child0, null);
        element(env, element5, context, "action", ["addCourse", get(env, context, "course_code")], {});
        inline(env, morph1, context, "input", [], {"type": "text", "value": get(env, context, "course_code"), "maxlength": "6", "placeholder": "Course Code", "class": "search", "autocomplete": "off", "autocorrect": "off", "autocapitalize": "off", "spellcheck": "false"});
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/messages', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","message");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("header");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","pull-left");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","pull-right");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("article");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
          var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
          content(env, morph0, context, "message.course_id.course_name");
          content(env, morph1, context, "message.date");
          content(env, morph2, context, "message.body");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","messages");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        block(env, morph0, context, "each", [get(env, context, "controller")], {"keyword": "message"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/reminders', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("\n             My Reminders ( ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" of 3 )\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          content(env, morph0, context, "totalRecords");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","reveal");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","helper");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","putBackable fastAnimate");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode(" before each item\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element1, [3]);
          var morph0 = dom.createMorphAt(element2,3,3);
          var morph1 = dom.createMorphAt(element3,1,1);
          var morph2 = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
          element(env, element2, context, "action", ["remove", get(env, context, "reminder")], {});
          inline(env, morph0, context, "icon-device", ["X"], {});
          inline(env, morph1, context, "icon-device", ["minus-red"], {});
          content(env, morph2, context, "reminder.time_before");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("\n                Add Reminder\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("figure");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("form");
          var el2 = dom.createTextNode("\n                Remind me\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2,"class","time");
          dom.setAttribute(el2,"type","tel");
          dom.setAttribute(el2,"step","1");
          dom.setAttribute(el2,"placeholder","0");
          dom.setAttribute(el2,"max","30");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("select");
          dom.setAttribute(el2,"class","time-frame");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("option");
          dom.setAttribute(el3,"value","hours");
          var el4 = dom.createTextNode("hour(s)");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("option");
          dom.setAttribute(el3,"value","days");
          var el4 = dom.createTextNode("day(s)");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                before everything is due.\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [3]);
          var morph0 = dom.createMorphAt(element0,1,1);
          element(env, element0, context, "action", ["add"], {});
          inline(env, morph0, context, "icon-device", ["plus-big"], {});
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("\n                Remove a reminder to add another\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","reminders");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","new-reminder");
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","triangle-isosceles topleft hidden bubble");
        var el3 = dom.createTextNode("\n        Choose how many hours or days you want to be reminded before each due date\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element4 = dom.childAt(fragment, [0]);
        var element5 = dom.childAt(element4, [7]);
        var morph0 = dom.createMorphAt(element4,1,1);
        var morph1 = dom.createMorphAt(element4,3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element4, [5]),1,1);
        var morph3 = dom.createMorphAt(element5,1,1);
        var morph4 = dom.createMorphAt(element5,3,3);
        block(env, morph0, context, "unless", [get(env, context, "empty")], {}, child0, null);
        inline(env, morph1, context, "input", [], {"type": "hidden", "value": get(env, context, "total"), "id": "total-reminders"});
        block(env, morph2, context, "each", [get(env, context, "model")], {"keyword": "reminder"}, child1, null);
        block(env, morph3, context, "unless", [get(env, context, "maxxedOut")], {}, child2, null);
        block(env, morph4, context, "if", [get(env, context, "maxxedOut")], {}, child3, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/support', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","support");
        dom.setAttribute(el1,"class","static-content");
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/unenrolled', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","reveal");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","putBackable fastAnimate keep");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","info");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","courseName");
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","instructorName");
          var el5 = dom.createTextNode("\n                        ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                    ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","hidden courseCode");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3, 1]);
          var morph0 = dom.createMorphAt(element1,1,1);
          var morph1 = dom.createMorphAt(element2,1,1);
          var morph2 = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
          var morph3 = dom.createMorphAt(dom.childAt(element2, [5]),1,1);
          var morph4 = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
          element(env, element0, context, "bind-attr", [], {"class": "course.hidden :hidden :slider :left-box"});
          element(env, element1, context, "action", ["addCourse", get(env, context, "course")], {});
          inline(env, morph0, context, "icon-device", ["cloud-white", "pull-left"], {});
          inline(env, morph1, context, "icon-device", ["plus-big"], {});
          content(env, morph2, context, "course.course_name");
          content(env, morph3, context, "course.instructor_name");
          content(env, morph4, context, "course.course_code");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","courses");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"id","search");
        dom.setAttribute(el2,"class","search");
        dom.setAttribute(el2,"type","text");
        dom.setAttribute(el2,"maxlength","6");
        dom.setAttribute(el2,"placeholder","Enter Course Code");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","send-syllabus");
        dom.setAttribute(el2,"style","display: none");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n        Aww Shucks,\n        we don't have your syllabus!!!\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","btn btn-blue");
        var el4 = dom.createTextNode("\n            COMPLAIN\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","list");
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element3, [5]),1,1);
        element(env, element4, context, "action", ["sendSyllabi"], {});
        block(env, morph0, context, "each", [get(env, context, "filteredData")], {"keyword": "course"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/adapters/assignment.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/assignment.js should pass jshint', function() { 
    ok(true, 'adapters/assignment.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/adapters/course.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/course.js should pass jshint', function() { 
    ok(true, 'adapters/course.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/adapters/reminder.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/reminder.js should pass jshint', function() { 
    ok(true, 'adapters/reminder.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/components/course-profile.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/course-profile.js should pass jshint', function() { 
    ok(true, 'components/course-profile.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/assignments.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/assignments.js should pass jshint', function() { 
    ok(true, 'controllers/assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/completed-assignments.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/completed-assignments.js should pass jshint', function() { 
    ok(true, 'controllers/completed-assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/enrolled.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/enrolled.js should pass jshint', function() { 
    ok(true, 'controllers/enrolled.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/reminders.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/reminders.js should pass jshint', function() { 
    ok(true, 'controllers/reminders.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/unenrolled.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/unenrolled.js should pass jshint', function() { 
    ok(true, 'controllers/unenrolled.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/assignment-divider.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/assignment-divider.js should pass jshint', function() { 
    ok(true, 'helpers/assignment-divider.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/icon-device.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/icon-device.js should pass jshint', function() { 
    ok(true, 'helpers/icon-device.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/linkify-descriptions.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/linkify-descriptions.js should pass jshint', function() { 
    ok(true, 'helpers/linkify-descriptions.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/resolver', ['exports', 'ember/resolver', 'whats-due-cordova/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('whats-due-cordova/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/start-app', ['exports', 'ember', 'whats-due-cordova/app', 'whats-due-cordova/router', 'whats-due-cordova/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('whats-due-cordova/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/assignment.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/assignment.js should pass jshint', function() { 
    ok(true, 'models/assignment.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/course.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/course.js should pass jshint', function() { 
    ok(true, 'models/course.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/message.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/message.js should pass jshint', function() { 
    ok(true, 'models/message.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/reminder.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/reminder.js should pass jshint', function() { 
    ok(true, 'models/reminder.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/set-reminder.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/set-reminder.js should pass jshint', function() { 
    ok(true, 'models/set-reminder.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/objects/pollster.jshint', function () {

  'use strict';

  module('JSHint - objects');
  test('objects/pollster.js should pass jshint', function() { 
    ok(true, 'objects/pollster.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/assignments.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/assignments.js should pass jshint', function() { 
    ok(true, 'routes/assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/completed-assignments.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/completed-assignments.js should pass jshint', function() { 
    ok(true, 'routes/completed-assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/enrolled.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/enrolled.js should pass jshint', function() { 
    ok(true, 'routes/enrolled.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/messages.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/messages.js should pass jshint', function() { 
    ok(true, 'routes/messages.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/reminders.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/reminders.js should pass jshint', function() { 
    ok(true, 'routes/reminders.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/support.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/support.js should pass jshint', function() { 
    ok(true, 'routes/support.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/unenrolled.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/unenrolled.js should pass jshint', function() { 
    ok(true, 'routes/unenrolled.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/test-helper', ['whats-due-cordova/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('whats-due-cordova/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/application.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/application.js should pass jshint', function() { 
    ok(true, 'views/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/assignments.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/assignments.js should pass jshint', function() { 
    ok(true, 'views/assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/completed-assignments.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/completed-assignments.js should pass jshint', function() { 
    ok(true, 'views/completed-assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/enrolled.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/enrolled.js should pass jshint', function() { 
    ok(true, 'views/enrolled.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/reminders.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/reminders.js should pass jshint', function() { 
    ok(true, 'views/reminders.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/support.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/support.js should pass jshint', function() { 
    ok(true, 'views/support.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/views/unenrolled.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/unenrolled.js should pass jshint', function() { 
    ok(true, 'views/unenrolled.js should pass jshint.'); 
  });

});
define('whats-due-cordova/views/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ApplicationView = Ember['default'].View.extend({
        didInsertElement: function didInsertElement() {
            CustomUI.readyFunction();
        }
    });

    exports['default'] = ApplicationView;

});
define('whats-due-cordova/views/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AssignmentsView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.swipeRemove();
        }).observes('controller.filteredData'),
        afterRender: function afterRender() {
            CustomUI.swipeRemove();
        },
        hammerOptions: {},
        activeElement: null,
        gestures: {
            drag: function drag(event) {
                // do something like send an event down the controller/route chain
                var x = event.gesture.deltaX;
                var percent = 1 - Math.abs(x / pageWidth);
                this.activeElement.css({
                    '-webkit-transform': 'translate3d(' + x + 'px,0,0) scale3d(1,1,1)',
                    opacity: percent
                });
                return false; // return `false` to stop bubbling
            },
            release: function release(event) {
                // do something like send an event down the controller/route chain
                console.log(this.activeElement);
                var deltaX = event.gesture.deltaX;
                var percent = Math.abs(deltaX / pageWidth);
                var swiped = percent > 0.3;
                var direction = event.gesture.direction;
                // var width = this.activeElement.width();
                // var distanceRemaining = width - Math.abs(event.gesture.deltaX);
                console.log(percent);
                ///* Prevent wonky scrolling */
                if (!swiped) {
                    console.log('Reset');
                    CustomUI.fastAnimate(this.activeElement);
                    CustomUI.customAnimate(this.activeElement, percent * 750);
                    this.activeElement.css({
                        '-webkit-transform': 'translate3d(0,0,0) scale3d(1,1,1)',
                        opacity: 1
                    });
                } else {
                    CustomUI.complete(this.activeElement, (1 - percent) * 500);
                    var position;
                    if (direction === 'left') {
                        position = '-100%';
                    } else if (direction === 'right') {
                        position = '100%';
                    }
                    this.activeElement.css({
                        '-webkit-transform': 'translate3d(' + position + ',0,0) scale3d(1,1,1)',
                        opacity: 0
                    });
                }
                return false; // return `false` to stop bubbling
            },
            touch: function touch(event) {
                this.activeElement = CustomUI.closest(event, '.removable');
            }
        }
    });

    exports['default'] = AssignmentsView;

});
define('whats-due-cordova/views/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
        }).observes('controller.filteredData')
    });

    exports['default'] = CompletedAssignmentsView;

});
define('whats-due-cordova/views/enrolled', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var EnrolledView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
            console.log('loaded');
        }).observes('controller.filteredData'),
        afterRender: function afterRender() {
            CustomUI.makeSpinnable();
            var addCourse = Ember['default'].$('#addCourse');
            addCourse.find('input').val('');
            CustomUI.putBackable();
        }
    });

    exports['default'] = EnrolledView;

});
define('whats-due-cordova/views/reminders', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var RemindersView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
        }).observes('controller.model'),
        afterRender: function afterRender() {
            setTimeout(function () {
                CustomUI.putBackable();
                CustomUI.reminderTips();
            }, 50);
        }

    });

    exports['default'] = RemindersView;

});
define('whats-due-cordova/views/support', ['exports', 'ember', 'customUI'], function (exports, Ember, CustomUI) {

    'use strict';

    var SupportView = Ember['default'].View.extend({
        afterRender: function afterRender() {
            setTimeout(function () {
                CustomUI['default'].showSupport();
            }, 50);
        }
    });

    exports['default'] = SupportView;

});
define('whats-due-cordova/views/unenrolled', function () {

	'use strict';

	//import Ember from 'ember';
	//import CustomUI from 'customUI';
	//import CustomFunctions from 'customFunctions';
	//
	//var UnenrolledView = Ember.View.extend({
	//    contentDidChange: function() {
	//        CustomFunctions.putBackable();
	//    }.observes('controller.filteredData'),
	//    afterRender: function(){
	//        if (cordovaLoaded === true){
	//            setTimeout(function(){
	//                cordova.plugins.Keyboard.show();
	//                Ember.$('#search').focus();
	//            }, 500);
	//        }
	//        CustomUI.makeSpinnable();
	//        setTimeout(function() {
	//            filter('search');
	//        }, 1);
	//    }
	//});
	//
	//export default UnenrolledView;

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('source/config/environment', ['ember'], function(Ember) {
  var prefix = 'source';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("source/tests/test-helper");
} else {
  require("source/app")["default"].create({"name":"whats-due-cordova","version":"0.0.0."});
}

/* jshint ignore:end */
//# sourceMappingURL=whats-due-cordova.map