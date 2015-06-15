/* jshint ignore:start */

/* jshint ignore:end */

define('whats-due-cordova/adapters/application', ['exports', 'ember-localforage-adapter/adapters/localforage'], function (exports, LFAdapter) {

  'use strict';

  /**
   * Created by dan on 2014-05-13.
   */

  exports['default'] = LFAdapter['default'].extend({
    namespace: 'WhatsDue'
  });

});
define('whats-due-cordova/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'whats-due-cordova/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

    'use strict';

    var App;

    Ember['default'].MODEL_FACTORY_INJECTIONS = true;

    App = Ember['default'].Application.extend({
        modulePrefix: config['default'].modulePrefix,
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
define('whats-due-cordova/components/assignment-card', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 5/26/15.
     */
    var AssignmentCardComponent = Ember['default'].Component.extend({
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                this.sendAction('removeAssignment', assignment);
            },
            toggleModal: function toggleModal(assignment) {
                this.sendAction('toggleModal', assignment);
            }
        }
    });

    exports['default'] = AssignmentCardComponent;

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
define('whats-due-cordova/components/ember-modal-dialog-positioned-container', ['exports', 'ember-modal-dialog/components/positioned-container'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('whats-due-cordova/components/ember-wormhole', ['exports', 'ember-wormhole/components/ember-wormhole'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('whats-due-cordova/components/modal-dialog', ['exports', 'ember-modal-dialog/components/modal-dialog'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('whats-due-cordova/controllers/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ApplicationController = Ember['default'].Controller.extend({
        actions: {
            test: function test() {
                this.transitionToRoute('assignments');
            }
        },
        init: function init() {
            /* Start store injection */
            CustomFunctions.setStore(this);
            /* End store injection */

            Ember['default'].$.ajax({
                url: 'http://ipinfo.io/json',
                type: 'GET',
                context: this,
                success: function success(data) {
                    var locationInfo = CustomFunctions.LocationInfo(data);
                    CustomFunctions.trackEvent('App Opened', 'City', locationInfo.city, 'Region', locationInfo.region, 'Country', locationInfo.country);
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

    exports['default'] = ApplicationController;

});
define('whats-due-cordova/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('whats-due-cordova/controllers/assignments', ['exports', 'ember', 'whats-due-cordova/utils/group-by'], function (exports, Ember, groupBy) {

    'use strict';

    var AssignmentsController = Ember['default'].ArrayController.extend({
        due: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        groupedCards: groupBy['default']('due', 'daysAway'),
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalDue: (function () {
            return this.get('due.length');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalOverdue: (function () {
            return this.get('overdue.length');
        }).property('model.@each.due_date', 'model.@each.completed'),
        isShowingModal: false,
        shareContent: '',
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                CustomFunctions.trackEvent('Assignment Completed');
                this.store.find('setReminder', { 'assignment': assignment.get('id') }).then(function (setReminders) {
                    CustomFunctions.removeSetReminders(setReminders);
                });
                assignment.set('completed', true);
                assignment.set('date_completed', Date.now());
                assignment.save();
            },
            toggleModal: function toggleModal(assignment) {
                console.log('Show Modal');
                var context = this;
                if (this.isShowingModal === false) {
                    assignment.get('course_id').then(function (course) {
                        context.shareContent = assignment.get('daysAway') + ' at ' + assignment.get('timeDue') + ':\n\n' + assignment.get('assignment_name') + ' is due for ' + course.get('course_name');
                    });
                }
                this.toggleProperty('isShowingModal');
            },
            share: function share() {
                CustomFunctions.share(this.shareContent);
                this.toggleProperty('isShowingModal');
            },
            cancel: function cancel() {
                this.toggleProperty('isShowingModal');
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
        }).property('model.@each.completed'),
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
define('whats-due-cordova/controllers/courses', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CoursesController = Ember['default'].ArrayController.extend({
        model: [],
        filteredData: (function () {
            this.set('sortProperties', 'admin_id');
            return this.get('model').filterBy('enrolled', true).sortBy('admin_id', 'course_name');
        }).property('model.@each.enrolled'),
        actions: {
            addCourse: function addCourse(course_code) {
                var controller = this;
                var store = this.store;
                course_code = course_code.toUpperCase();
                this.set('course_code', '');
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
                            data: { 'primaryKey': window.localStorage.getItem('primaryKey') },
                            success: function success() {
                                if (!store.hasRecordForId('course', resp.course.id)) {
                                    store.recordForId('course', resp.course.id).unloadRecord(); // Quirk when deleting and re-adding
                                    var course = store.createRecord('course', resp.course);
                                    course.save();
                                    CustomFunctions.getUpdates('/assignments', 'assignment', {
                                        'courses': '[' + course.get('id') + ']',
                                        'sendAll': true
                                    }, true);
                                    CustomFunctions.updateCourseList();
                                    controller.set('course_code', '');
                                    CustomFunctions.trackEvent('Course Added', 'Course', course.get('course_name'), 'Instructor', course.get('instructor_name'), 'School', course.get('school_name'));
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
                    data: { 'primaryKey': localStorage.getItem('primaryKey') },
                    success: function success() {
                        context.store.find('assignment', { 'course_id': course.get('id') }).then(function (assignments) {
                            assignments.content.forEach(function (assignment) {
                                this.store.find('setReminder', { 'assignment': assignment.get('id') }).then(function (setReminders) {
                                    CustomFunctions.removeSetReminders(setReminders);
                                    console.log('destroyed Reminder');
                                });
                                assignment.destroyRecord();
                                console.log('destroyed Assignment');
                            }, context);
                        });
                        course.destroyRecord().then(function () {
                            CustomFunctions.updateCourseList();
                        });

                        CustomFunctions.trackEvent('Course Removed', 'Course Name', course.get('course_name'));
                    },
                    error: function error() {
                        alert('Are you connected to the Internet?');
                        CustomFunctions.trackEvent('Course Remove Failed');
                    }
                });
            }
        }
    });

    exports['default'] = CoursesController;

});
define('whats-due-cordova/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('whats-due-cordova/controllers/reminders', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var RemindersController = Ember['default'].Controller.extend({
        init: function init() {},
        actions: {
            add: function add() {
                var newReminders = Ember['default'].$('#new-reminder');
                var time = parseInt(newReminders.find('.time').val());
                var timeFrame = newReminders.find('.time-frame').val();
                var seconds = 0;
                if (timeFrame === 'days') {
                    seconds = time * 86400;
                } else if (timeFrame === 'hours') {
                    seconds = time * 3600;
                }
                if (time > 0 && this.get('model.length') < 3) {
                    CustomFunctions.createReminders(seconds);
                }
                /* Fix Keyboard */
                if (typeof cordovaLoaded !== 'undefined') {
                    setTimeout(function () {
                        cordova.plugins.Keyboard.close();
                        Ember['default'].$('input').blur();
                    }, 1);
                }
            },
            remove: function remove(reminder) {
                console.log(reminder);
                this.store.find('setReminder', { 'reminder': reminder.get('id') }).then(function (setReminders) {
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
define('whats-due-cordova/helpers/linkify-external', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (text) {
        console.log(linkifyCordova(text));
        return new Ember['default'].Handlebars.SafeString(linkifyCordova(text));
    });

});
define('whats-due-cordova/initializers/add-modals-container', ['exports', 'ember-modal-dialog/initializers/add-modals-container'], function (exports, initialize) {

  'use strict';

  exports['default'] = {
    name: 'add-modals-container',
    initialize: initialize['default']
  };

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
define('whats-due-cordova/initializers/ember-linkify', ['exports', 'ember', 'ember-linkify/helpers/linkify'], function (exports, Ember, linkify) {

  'use strict';

  var initialize = function initialize() {
    Ember['default'].Handlebars.helper('linkify', linkify.linkify);
  };

  exports['default'] = {
    name: 'ember-linkify',
    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});
define('whats-due-cordova/initializers/ember-mobiletouch', ['exports', 'whats-due-cordova/config/environment', 'ember-mobiletouch/default-config', 'ember-mobiletouch/overrides/view', 'ember-mobiletouch/overrides/link-view', 'whats-due-cordova/overrides/ember-mobiletouch', 'ember-mobiletouch/overrides/action-helper'], function (exports, config, defaultConfig, ModifiedView, ModifiedLinkView, ModifiedEventDispatcher, ModifiedActionHelper) {

  'use strict';

  exports['default'] = {

    name: 'mobiletouch',

    initialize: function initialize() {

      var mergedConfig = Ember.merge({}, defaultConfig['default'], config['default']);

      //add config settings to overrides
      ModifiedView['default'].reopen({ __useGesturesHash: mergedConfig.useGesturesHash });
      ModifiedLinkView['default'].reopen({ __defaultTapOnPress: mergedConfig.defaultTapOnPress });
    }
  };

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
define('whats-due-cordova/models/setting', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  /**
   * Created by Dan on 5/11/15.
   */

  /* Settings */
  var Setting = DS['default'].Model.extend({
    value: DS['default'].attr('string', { defaultValue: null })
  });

  exports['default'] = Setting;

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
define('whats-due-cordova/overrides/ember-mobiletouch', ['exports', 'whats-due-cordova/config/environment', 'ember-mobiletouch/overrides/event-dispatcher', 'whats-due-cordova/recognizers'], function (exports, config, EventDispatcher, CustomRecognizers) {

  'use strict';

  exports['default'] = EventDispatcher['default'].reopen({
    _mobileTouchCustomizations: config['default'].mobileTouch,
    _customRecognizers: CustomRecognizers['default']
  });

});
define('whats-due-cordova/recognizers', ['exports'], function (exports) {

  'use strict';

  exports['default'] = function () {}

  /**
   * Place your recognizer customizations here
   */

  //this.Manager is a reference to the hammer Manager instance
  //this.Recognizers is a hash of available recognizers
  //   e.g. this.Recognizers.Pan

  //you can add a new recognizer, for instance doubleTap, like below
  //the DOM event will be all lowercase (doubletap)
  //the Ember event will be camelCase (doubleTap)
  //the key in this.Recognizers will be SnakeCase (DoubleTap)
  /*
  this.recognize({
     name : 'doubleTap', //always camelCase this
     gesture : 'tap', //the base Hammer recognizer to use
     tune : { //the settings to pass to the recognizer, event will be added automatically
      taps : 2
    },
     'with' : ['tap'], //an array of recognizers to recognize with.
     without : [] //an array of recognizers that must first fail
  });
  */

});
define('whats-due-cordova/router', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.resource('courses', function () {});

        this.resource('assignments', { path: '/' }, function () {});

        this.resource('completedAssignments', function () {});

        this.resource('support', function () {});

        this.resource('messages', function () {});

        this.resource('reminders', function () {});

        this.resource('welcome', function () {});
    });

    exports['default'] = Router;

});
define('whats-due-cordova/routes/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI.setTitle('Assignments Due');
            return this.store.find('assignment');
        }
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
define('whats-due-cordova/routes/courses', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CoursesRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI.setTitle('My Courses');
            return this.store.find('course');
        }
    });

    exports['default'] = CoursesRoute;

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
define('whats-due-cordova/services/modal-dialog', ['exports', 'ember-modal-dialog/services/modal-dialog'], function (exports, Service) {

	'use strict';

	exports['default'] = Service['default'];

});
define('whats-due-cordova/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
      revision: "Ember@1.12.0",
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
        var el2 = dom.createTextNode("\n\n");
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
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, element = hooks.element, block = hooks.block, content = hooks.content;
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
        var element1 = dom.childAt(element0, [5]);
        var element2 = dom.childAt(fragment, [2, 1]);
        var element3 = dom.childAt(element2, [1, 1, 1]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        var morph2 = dom.createMorphAt(element3,1,1);
        var morph3 = dom.createMorphAt(element3,3,3);
        var morph4 = dom.createMorphAt(element3,5,5);
        var morph5 = dom.createMorphAt(element3,7,7);
        var morph6 = dom.createMorphAt(element3,9,9);
        var morph7 = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
        inline(env, morph0, context, "icon-device", ["menu", "pull-left", "menuToggle"], {});
        inline(env, morph1, context, "icon-device", ["menu", "pull-right hide", "menuToggle"], {});
        element(env, element1, context, "action", ["test"], {});
        block(env, morph2, context, "link-to", ["assignments"], {"tagName": "li"}, child0, null);
        block(env, morph3, context, "link-to", ["completedAssignments"], {"tagName": "li"}, child1, null);
        block(env, morph4, context, "link-to", ["courses"], {"tagName": "li"}, child2, null);
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
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
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
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "assignment-card", [], {"assignment": get(env, context, "assignment"), "toggleModal": "toggleModal", "removeAssignment": "removeAssignment"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","day-divider");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          content(env, morph0, context, "day.key");
          block(env, morph1, context, "each", [get(env, context, "day")], {"keyword": "assignment"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
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
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "assignment-card", [], {"assignment": get(env, context, "assignment"), "toggleModal": "toggleModal", "removeAssignment": "removeAssignment"});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","buttons");
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","button share");
            var el3 = dom.createTextNode("\n                    Share\n                ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","button close");
            var el3 = dom.createTextNode("\n                    Cancel\n                ");
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
            var hooks = env.hooks, element = hooks.element;
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
            element(env, element1, context, "action", ["share"], {});
            element(env, element2, context, "action", ["cancel"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "modal-dialog", [], {"close": "toggleModal", "alignment": "center", "translucentOverlay": true}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
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
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","assignments-due");
        dom.setAttribute(el2,"class","needsclick");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","arrow-up");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
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
        var el1 = dom.createComment("");
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
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element4, [1, 1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element4, [5, 1]),1,1);
        var morph2 = dom.createMorphAt(element5,1,1);
        var morph3 = dom.createMorphAt(element5,5,5);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [5]),5,5);
        var morph5 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        content(env, morph0, context, "totalDue");
        content(env, morph1, context, "totalOverdue");
        content(env, morph2, context, "firstOfDay");
        block(env, morph3, context, "each", [get(env, context, "groupedCards")], {"keyword": "day"}, child0, null);
        block(env, morph4, context, "each", [get(env, context, "overdue")], {"keyword": "assignment"}, child1, null);
        block(env, morph5, context, "if", [get(env, context, "isShowingModal")], {}, child2, null);
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
        revision: "Ember@1.12.0",
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
      revision: "Ember@1.12.0",
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
define('whats-due-cordova/templates/components/assignment-card', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","reveal");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
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
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","course");
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
        dom.setAttribute(el3,"class","info");
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","title");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","description");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
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
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var element5 = dom.childAt(element4, [1]);
        var morph0 = dom.createMorphAt(dom.childAt(element3, [1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        var morph2 = dom.createMorphAt(dom.childAt(element3, [5]),1,1);
        var morph3 = dom.createMorphAt(element5,1,1);
        var morph4 = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        var morph5 = dom.createMorphAt(element2,5,5);
        element(env, element0, context, "bind-attr", [], {"class": ":slider :left-box"});
        element(env, element1, context, "action", ["removeAssignment", get(env, context, "assignment")], {});
        element(env, element2, context, "bind-attr", [], {"class": ":removable assignment.urgencyLabel"});
        element(env, element3, context, "action", ["toggleModal", get(env, context, "assignment")], {});
        content(env, morph0, context, "assignment.fromNow");
        content(env, morph1, context, "assignment.timeDue");
        content(env, morph2, context, "assignment.course_id.course_name");
        element(env, element5, context, "action", ["toggleModal", get(env, context, "assignment")], {});
        content(env, morph3, context, "assignment.assignment_name");
        inline(env, morph4, context, "linkify-external", [get(env, context, "assignment.description")], {});
        inline(env, morph5, context, "input", [], {"class": "date-due", "type": "hidden", "value": get(env, context, "assignment.daysAway")});
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/components/modal-dialog', ['exports', 'ember-modal-dialog/templates/components/modal-dialog'], function (exports, template) {

	'use strict';

	exports['default'] = template['default'];

});
define('whats-due-cordova/templates/courses', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
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
      revision: "Ember@1.12.0",
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
        var el3 = dom.createTextNode("\n    ");
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
        revision: "Ember@1.12.0",
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
      revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
        revision: "Ember@1.12.0",
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
      revision: "Ember@1.12.0",
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
      revision: "Ember@1.12.0",
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
define('whats-due-cordova/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/components/assignment-card.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/assignment-card.js should pass jshint', function() { 
    ok(true, 'components/assignment-card.js should pass jshint.'); 
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
    ok(false, 'controllers/application.js should pass jshint.\ncontrollers/application.js: line 3, col 1, \'CustomUI\' is defined but never used.\ncontrollers/application.js: line 4, col 1, \'cordovaLoaded\' is defined but never used.\ncontrollers/application.js: line 5, col 1, \'Migration\' is defined but never used.\ncontrollers/application.js: line 6, col 1, \'cordova\' is defined but never used.\n\n4 errors'); 
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
define('whats-due-cordova/tests/controllers/courses.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/courses.js should pass jshint', function() { 
    ok(true, 'controllers/courses.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/reminders.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/reminders.js should pass jshint', function() { 
    ok(true, 'controllers/reminders.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/icon-device.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/icon-device.js should pass jshint', function() { 
    ok(true, 'helpers/icon-device.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/linkify-external.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/linkify-external.js should pass jshint', function() { 
    ok(true, 'helpers/linkify-external.js should pass jshint.'); 
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
define('whats-due-cordova/tests/models/setting.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/setting.js should pass jshint', function() { 
    ok(true, 'models/setting.js should pass jshint.'); 
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
define('whats-due-cordova/tests/routes/courses.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/courses.js should pass jshint', function() { 
    ok(true, 'routes/courses.js should pass jshint.'); 
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
define('whats-due-cordova/tests/utils/group-by.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/group-by.js should pass jshint', function() { 
    ok(true, 'utils/group-by.js should pass jshint.'); 
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
define('whats-due-cordova/tests/views/courses.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/courses.js should pass jshint', function() { 
    ok(true, 'views/courses.js should pass jshint.'); 
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
define('whats-due-cordova/utils/group-by', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 5/28/15.
     */

    var get = Ember['default'].get,
        arrayComputed = Ember['default'].arrayComputed;

    exports['default'] = function (dependentKey, property) {

        var options = {

            initialValue: [],

            addedItem: function addedItem(array, item) {

                var key = get(item, property),
                    group = array.findBy('key', key);

                if (!group) {
                    group = Ember['default'].ArrayProxy.create({
                        content: [],
                        key: key
                    });

                    array.pushObject(group);
                }

                group.pushObject(item);

                return array;
            },

            removedItem: function removedItem(array, item) {

                var key = get(item, property),
                    group = array.findBy('key', key);

                if (!group) {
                    return;
                }

                group.removeObject(item);

                if (get(group, 'length') === 0) {
                    array.removeObject(group);
                }

                return array;
            }

        };

        return arrayComputed(dependentKey, options);
    }

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
        afterRender: function afterRender() {
            CustomUI.swipeRemove();
        },
        activeElement: false,
        allowSwiping: false,
        startPos: false,
        panMove: function panMove(event) {
            // do something like send an event down the controller/route chain
            var gesture = event.originalEvent.gesture;
            //console.log(gesture);
            var x = gesture.deltaX;

            if (this.allowSwiping) {
                //Block Scrolling

                //Swipe
                var percent = 1 - Math.abs(x / pageWidth);
                this.activeElement.css({
                    "-webkit-transform": "translate3d(" + x + "px,0,0) scale3d(1,1,1)",
                    "opacity": percent
                });
            }
            event.preventDefault();
            return false; // return `false` to stop bubbling
        },
        panStart: function panStart(event) {

            var gesture = event.originalEvent.gesture;
            if (Math.abs(gesture.deltaY) < 15) {
                this.allowSwiping = true;
                this.activeElement = CustomUI.closest(event, ".removable");
                Ember['default'].$(document).bind("touchmove", function (e) {
                    e.preventDefault();
                });
            } else {
                this.activeElement = false;
                this.allowSwiping = false;
            }
        },
        panEnd: function panEnd(event) {
            Ember['default'].$(document).unbind("touchmove");
            // do something like send an event down the controller/route chain
            //console.log(this.sendAction('removeAssignment'));
            //console.log(this.get('controller').send('removeAssignment'));
            var gesture = event.originalEvent.gesture;
            var percent = Math.abs(gesture.deltaX) / pageWidth;
            var swiped = percent > 0.3;
            var direction = gesture.direction;
            if (swiped) {
                CustomUI.complete(this.activeElement, (1 - percent) * 200);
                var position;
                if (direction === "left") {
                    position = "-100%";
                } else if (direction === "right") {
                    position = "100%";
                }
                this.activeElement.css({
                    "-webkit-transform": "translate3d(" + position + ",0,0) scale3d(1,1,1)",
                    "opacity": 0
                });
            } else {
                //            CustomUI.customAnimate(Ember.$.(this.activeElement), (percent*100) );
                this.activeElement.css({
                    "-webkit-transform": "translate3d(0,0,0) scale3d(1,1,1)",
                    "opacity": 1
                });
            }
            return false; // return `false` to stop bubbling
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
define('whats-due-cordova/views/courses', ['exports', 'ember'], function (exports, Ember) {

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
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('whats-due-cordova/config/environment', ['ember'], function(Ember) {
  var prefix = 'whats-due-cordova';
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
  require("whats-due-cordova/tests/test-helper");
} else {
  require("whats-due-cordova/app")["default"].create({"name":"whats-due-cordova","version":"0.0.1.54ddde9f"});
}

/* jshint ignore:end */
