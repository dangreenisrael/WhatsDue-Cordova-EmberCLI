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
define('whats-due-cordova/adapters/student', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  /**
   * Created by dan on 2014-05-13.
   */

  exports['default'] = DS['default'].RESTAdapter.extend({
    host: 'http://stage.whatsdueapp.com',
    namespace: 'student'
  });

  //export default DS.RESTAdapter.extend({
  //    host: 'http://test.whatsdueapp.com/app_dev.php',
  //    namespace: "student"
  //});

  //export default DS.RESTAdapter.extend({
  //    host: 'http://192.168.1.100/app_dev.php',
  //    namespace: "student"
  //});

});
define('whats-due-cordova/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'whats-due-cordova/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

    'use strict';

    var App;

    Ember['default'].MODEL_FACTORY_INJECTIONS = true;

    App = Ember['default'].Application.extend({
        modulePrefix: config['default'].modulePrefix,
        Resolver: Resolver['default']
    });

    loadInitializers['default'](App, config['default'].modulePrefix);

    exports['default'] = App;

});
define('whats-due-cordova/components/assignment-card', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 5/26/15.
     */
    exports['default'] = Ember['default'].Component.extend({
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                this.sendAction('removeAssignment', assignment);
            },
            toggleModal: function toggleModal(assignment) {
                this.sendAction('toggleModal', assignment);
            },
            slideOver: function slideOver(assignment) {
                var element = Ember['default'].$('#' + assignment.get('id'));
                Ember['default'].$('.removable:not(#' + assignment.get('id') + ')').css('-webkit-transform', 'translateX(0)');
                if (element.css('-webkit-transform') !== 'matrix(1, 0, 0, 1, -100, 0)') {
                    element.css('-webkit-transform', 'translateX(-100px)');
                } else {
                    element.css('-webkit-transform', 'translateX(0)');
                }
            }
        }
    });

});
define('whats-due-cordova/components/bs-switch', ['exports', 'ember-cli-bootstrap-switch/components/bs-switch'], function (exports, bsSwitchComponent) {

	'use strict';

	/*
		This is just a proxy file requiring the component from the /addon folder and
		making it available to the dummy application!
	 */
	exports['default'] = bsSwitchComponent['default'];

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

    exports['default'] = Ember['default'].Controller.extend({
        init: function init() {

            /* Start store injection */
            CustomFunctions.setStore(this);
            CustomFunctions.setApplicationController(this);

            /* End store injection */

            var controller = this;
            setInterval(function () {
                CustomFunctions.updateAssignments(controller);
                CustomFunctions.updateCourses(controller);
            }, 5000);

            function checkVersion(version) {
                version = parseFloat(version);
                if (version < 2) {
                    CustomFunctions.setSetting('version', 2.1);
                    controller.transitionToRoute('welcome.parent-student');
                    controller.set('pageTitle', 'Courses');
                    Migration.runMigration();
                } else if (version === 2) {
                    CustomFunctions.setSetting('version', 2.1);
                    setTimeout(function () {
                        Migration.setDefaultSettings();
                    }, 5000);
                }
            }
            CustomFunctions.getSetting('version', checkVersion);
        },
        pageTitle: 'Assignments'
    });

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
        stuffDue: (function () {
            if (this.get('due.length') > 0) {
                return 'hidden';
            }
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalOverdue: (function () {
            return this.get('overdue.length');
        }).property('model.@each.due_date', 'model.@each.completed'),
        isShowingModal: false,
        shareContent: '',
        actions: {
            clickElement: function clickElement(assignment) {
                this.set('activeElement', assignment);
            },
            removeAssignment: function removeAssignment(assignment) {
                CustomFunctions.trackEvent('Assignment Completed');
                assignment.set('completed', true);
                assignment.set('date_completed', Date.now());
                assignment.save();
                var putData = {
                    assignment: {
                        completed: true,
                        completed_date: Date.now()
                    }
                };
                Ember['default'].$.ajax({
                    url: CustomFunctions.site() + '/assignments/' + assignment.get('id'),
                    type: 'PUT',
                    data: JSON.stringify(putData),
                    contentType: 'application/json'
                });
            },
            toggleModal: function toggleModal(assignment) {
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
                assignment.set('completed', false);
                assignment.set('date_completed', null);
                assignment.set('times_changed', assignment.get('times_changed') + 1);
                assignment.save();
                var putData = {
                    assignment: {
                        completed: false,
                        completed_date: null
                    }
                };
                Ember['default'].$.ajax({
                    url: CustomFunctions.site() + '/assignments/' + assignment.get('id'),
                    type: 'PUT',
                    data: JSON.stringify(putData),
                    contentType: 'application/json'
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
                    url: CustomFunctions.site() + '/courses/' + course_code + '/enroll',
                    type: 'PUT',
                    success: function success(resp) {
                        CustomFunctions.updateCourseList();
                        if (cordovaLoaded === true) {
                            cordova.plugins.Keyboard.close();
                        }
                        if (!store.hasRecordForId('course', resp.course.id)) {
                            store.recordForId('course', resp.course.id).unloadRecord(); // Quirk when deleting and re-adding
                            var course = store.createRecord('course', resp.course);
                            course.save();
                            CustomFunctions.getUpdates('/assignments', 'assignment', {
                                'courses': '[' + course.get('id') + ']',
                                'sendAll': true
                            }, true);

                            //CustomFunctions.updateCourseList();
                            controller.set('course_code', '');
                            CustomFunctions.trackEvent('Course Added', 'Course', course.get('course_name'), 'Instructor', course.get('instructor_name'), 'School', course.get('school_name'));
                        } else {
                            navigator.notification.alert('It looks like you\'re already in that course', null, 'Woops');
                        }
                    },
                    error: function error(resp) {
                        if (resp.statusText === 'Course Not Found') {
                            navigator.notification.alert('Looks like you typed in the wrong course code', null, 'Woops');
                            addCourse.removeClass('disabled');
                        } else {
                            navigator.notification.alert('Something went wrong, are you connected to the internet?', null, 'Woops');
                        }
                    }
                });
            },
            removeCourse: function removeCourse(course) {
                var context = this;
                Ember['default'].$.ajax({
                    url: CustomFunctions.site() + '/courses/' + course.get('id') + '/unenroll',
                    type: 'PUT',
                    data: { 'primaryKey': localStorage.getItem('primaryKey') },
                    success: function success() {
                        context.store.find('assignment', { 'course_id': course.get('id') }).then(function (assignments) {
                            assignments.content.forEach(function (assignment) {
                                assignment.destroyRecord();
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

    exports['default'] = Ember['default'].Controller.extend({
        init: (function () {}).on('init'),
        student: (function () {
            return this.get('model');
        }).property(),
        studentActive: (function () {
            var role = this.get('model.role');
            if (role === 'student') {
                return 'active';
            } else {
                return 'not-active';
            }
        }).property('model.role'),
        parentActive: (function () {
            var role = this.get('model.role');
            if (role === 'parent') {
                return 'active';
            } else {
                return 'not-active';
            }
        }).property('model.role'),
        //save: function(){
        //    this.get('student').save();
        //}.observes('student.first_name', 'student.last_name'),
        actions: {
            save: function save() {
                this.get('student').save();
            },
            toggleAge: function toggleAge(model) {
                model.toggleProperty('over12');
                model.save();
            },
            saveNotifications: function saveNotifications() {
                this.get('model').toggleProperty('notifications');
                this.save();
            },
            saveUpdateNotifications: function saveUpdateNotifications() {
                this.get('model').toggleProperty('notification_updates');
                this.save();
            },
            setRole: function setRole(model, role) {
                model.set('role', role);
                model.save();
                CustomFunctions.setUserProperty('Role', role);
            },
            datePicker: (function (_datePicker) {
                function datePicker() {
                    return _datePicker.apply(this, arguments);
                }

                datePicker.toString = function () {
                    return _datePicker.toString();
                };

                return datePicker;
            })(function () {
                var student = this.get('model');
                var initialTime = new Date();
                initialTime.setHours(student.get('hours'));
                initialTime.setMinutes(student.get('minutes'));
                initialTime.setSeconds(0);
                var options = {
                    date: initialTime,
                    mode: 'time',
                    androidTheme: 3,
                    minuteInterval: 15
                };
                function onSuccess(datetime) {
                    datetime = moment(datetime);
                    student.set('notification_time_local', datetime.format('HHmm'));
                    student.set('notification_time_utc', datetime.utcOffset('UTC').format('HHmm'));
                    student.save();
                }
                datePicker.show(options, onSuccess);
            })
        },
        save: function save() {
            var student = this.get('student');
            var hours = student.get('hours');
            var minutes = student.get('minutes');
            var local = moment().hours(hours).minutes(minutes);
            student.set('notification_time_local', local.format('HHmm'));
            student.set('notification_time_utc', local.utcOffset('UTC').format('HHmm'));
            student.save();
        }
    });

});
define('whats-due-cordova/controllers/welcome/my-name', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        actions: {
            toggleAge: function toggleAge() {
                this.get('model').toggleProperty('over12');
                this.get('model').save();
                CustomFunctions.setUserProperty('Over 12', this.model.get('over12'));
            },
            setName: function setName() {
                if (this.get('model').get('first_name') && this.get('model').get('last_name')) {
                    this.model.save();
                    CustomFunctions.setUserProperty('$first_name', this.get('model').get('first_name'));
                    CustomFunctions.setUserProperty('$last_name', this.get('model').get('last_name'));
                    if (this.get('model').get('role') !== 'parent' && this.get('model').get('over12') !== true) {
                        this.transitionToRoute('welcome.under13');
                        CustomFunctions.setUserProperty('Under 13', true);
                    } else {
                        CustomFunctions.setUserProperty('Under 13', false);
                        this.transitionToRoute('courses');
                    }
                } else {
                    navigator.notification.alert('We need your first and last name', null, 'Woops');
                }
            }
        }
    });

});
define('whats-due-cordova/controllers/welcome/parent-student', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        actions: {
            setRole: function setRole(role) {
                if (role == 'parent') {
                    this.set('parentActive', 'white');
                    this.set('studentActive', 'clear');
                } else {
                    this.set('studentActive', 'white');
                    this.set('parentActive', 'clear');
                }
                var route = this;
                return this.store.find('student').then(function (records) {
                    var record = records.get('firstObject');
                    record.set('signup_date', moment().format());
                    record.set('role', role);
                    record.save();
                    route.transitionToRoute('welcome.my-name');
                    CustomFunctions.setUserProperty('Role', role);
                    Migration.setDefaultSettings();
                });
            }
        }
    });

});
define('whats-due-cordova/controllers/welcome/under13', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        actions: {
            parentEmail: function parentEmail() {
                var emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                var emailValid = emailRegEx.test(this.get('model').get('parent_email'));
                if (emailValid) {
                    this.get('model').save();
                    this.transitionToRoute('courses');
                    CustomFunctions.setUserProperty('Parent\'s Email', this.get('model').get('parent_email'));
                } else {
                    navigator.notification.alert('Double check that email', null, 'Woops');
                }
            }
        }
    });

});
define('whats-due-cordova/helpers/description-text', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (text) {
        if (typeof text === "undefined") {
            return Ember['default'].String.htmlSafe("");
        } else {
            text = Ember['default'].Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
            return Ember['default'].String.htmlSafe(linkifyCordova(text));
        }
    });

});
define('whats-due-cordova/helpers/external-link', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (link, text) {
        var data = "<a onclick=\"window.open('" + link + "', '_system');\">" + text + "</a>";
        return new Ember['default'].Handlebars.SafeString(data);
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
define('whats-due-cordova/helpers/linkify-external', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (text) {
        //console.log((linkifyCordova(text)));
        return new Ember['default'].Handlebars.SafeString(linkifyCordova(text));
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
define('whats-due-cordova/initializers/ember-mobiletouch', ['exports', 'whats-due-cordova/config/environment', 'ember-mobiletouch/default-config', 'ember-mobiletouch/overrides/view', 'ember-mobiletouch/overrides/component', 'ember-mobiletouch/overrides/checkbox', 'ember-mobiletouch/overrides/link-view', 'whats-due-cordova/overrides/ember-mobiletouch', 'ember-mobiletouch/overrides/action-helper'], function (exports, config, defaultConfig, ModifiedView, ModifiedComponent, ModifiedCheckbox, ModifiedLinkView, ModifiedEventDispatcher, ModifiedActionHelper) {

  'use strict';

  exports['default'] = {

    name: 'mobiletouch',

    initialize: function initialize() {

      var mergedConfig = Ember.merge({}, defaultConfig['default'], config['default']);

      //add config settings to overrides
      ModifiedView['default'].reopen({ __useGesturesHash: mergedConfig.useGesturesHash });
      ModifiedComponent['default'].reopen({ __useGesturesHash: mergedConfig.useGesturesHash });
      ModifiedCheckbox['default'].reopen({ __useGesturesHash: mergedConfig.useGesturesHash });
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
        time_visible: DS['default'].attr('boolean', { defaultValue: true }),
        last_updated: DS['default'].attr('number', { defaultValue: null }),
        date_completed: DS['default'].attr('number', { defaultValue: null }),
        enrolled: DS['default'].attr('boolean', { defaultValue: true }),
        completed: DS['default'].attr('boolean', { defaultValue: false }),
        course_id: DS['default'].belongsTo('course', { async: true }),
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
define('whats-due-cordova/models/student', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    /**
     * Created by Dan on 5/11/15.
     */

    /* global moment*/

    exports['default'] = DS['default'].Model.extend({
        notifications: DS['default'].attr('boolean'),
        notification_updates: DS['default'].attr('boolean'),
        notification_time_utc: DS['default'].attr('string'),
        notification_time_local: DS['default'].attr('string'),
        first_name: DS['default'].attr('string'),
        last_name: DS['default'].attr('string'),
        role: DS['default'].attr('string'),
        over12: DS['default'].attr('boolean'),
        parent_email: DS['default'].attr('string'),
        signup_date: DS['default'].attr('string'),
        isParent: (function () {
            return this.get('role') === 'parent';
        }).property('role'),
        isStudent: (function () {
            return this.get('role') === 'student';
        }).property('role'),
        displayTime: (function () {
            var time = moment().hours(this.get('hours')).minutes(this.get('minutes'));
            return time.format('hh:mm A');
        }).property('hours', 'minutes'),
        hours: (function () {
            return this.get('notification_time_local').substring(0, 2);
        }).property('notification_time_local'),
        minutes: (function () {
            return this.get('notification_time_local').substring(2, 4);
        }).property('notification_time_local'),
        parentActive: (function () {
            if (this.get('isParent')) {
                return 'white';
            } else {
                return 'clear';
            }
        }).property('isParent'),
        studentActive: (function () {
            if (this.get('isStudent')) {
                return 'white';
            } else {
                return 'clear';
            }
        }).property('isParent')
    });

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

        this.route('welcome', function () {
            this.route('parent-student', function () {});
            this.route('my-name', function () {});
            this.route('under13', function () {});
        });
    });

    exports['default'] = Router;

});
define('whats-due-cordova/routes/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        actions: {
            transitionPage: function transitionPage(destination, title) {
                this.transitionTo(destination);
                this.set('controller.pageTitle', title);
                CustomUI.closeMenu();
            },
            gotoMenu: function gotoMenu() {
                //this.transitionTo("reminders");
                CustomUI.openMenu();
            }
        }
    });

});
define('whats-due-cordova/routes/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find('assignment');
        }
    });

    exports['default'] = AssignmentsRoute;

});
define('whats-due-cordova/routes/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
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

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find('student').then(function (records) {
                return records.get('firstObject');
            });
        }
    });

});
define('whats-due-cordova/routes/welcome', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 7/22/15.
     */
    exports['default'] = Ember['default'].Route.extend({
        renderTemplate: function renderTemplate() {
            this.render({ outlet: 'welcome' });
        }
    });

});
define('whats-due-cordova/routes/welcome/my-name', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find('student').then(function (records) {
                return records.get('firstObject');
            });
        }
    });

});
define('whats-due-cordova/routes/welcome/parent-student', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('whats-due-cordova/routes/welcome/under13', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find('student').then(function (records) {
                return records.get('firstObject');
            });
        }
    });

});
define('whats-due-cordova/templates/application', ['exports'], function (exports) {

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
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
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
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","content");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","contentContainer");
        dom.setAttribute(el2,"class","fastAnimate");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","left");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"id","menu");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("ul");
        dom.setAttribute(el5,"id","leftMenu");
        var el6 = dom.createTextNode("\n\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("li");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        var el8 = dom.createTextNode("\n                            Assignments\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("span class=\"whatsdue count\"></span");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("li");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        var el8 = dom.createTextNode("\n                            Completed\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("li");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        var el8 = dom.createTextNode("\n                            My Courses\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("li");
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        var el8 = dom.createTextNode("\n                            Settings\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n\n\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("li");
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        var el8 = dom.createTextNode("\n                            Feedback & Support\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("<li{action \"transitionPage\" \"welcome.parent-student\" \"Courses\"}}>");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("<div>");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("{icon-device \"info\"}}");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("</div>");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("<span>");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("Welcome");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("</span>");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("</li>");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
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
        dom.setAttribute(el3,"id","middle");
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n        ");
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
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, inline = hooks.inline, content = hooks.content;
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
        var element1 = dom.childAt(fragment, [3, 1]);
        var element2 = dom.childAt(element1, [1, 1, 1]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var element5 = dom.childAt(element2, [5]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(element2, [9]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [1]),1,1);
        var morph4 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        var morph5 = dom.createMorphAt(dom.childAt(element5, [1]),1,1);
        var morph6 = dom.createMorphAt(dom.childAt(element6, [1]),1,1);
        var morph7 = dom.createMorphAt(dom.childAt(element7, [1]),1,1);
        var morph8 = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        var morph9 = dom.createMorphAt(fragment,5,5,contextualElement);
        element(env, element0, context, "action", ["gotoMenu"], {"on": "tap"});
        inline(env, morph0, context, "icon-device", ["menu", "pull-left", "menuToggle"], {});
        inline(env, morph1, context, "icon-device", ["menu", "pull-right hide", "menuToggle"], {});
        content(env, morph2, context, "pageTitle");
        element(env, element3, context, "action", ["transitionPage", "assignments", "Assignments"], {"on": "tap"});
        inline(env, morph3, context, "icon-device", ["assignments"], {});
        element(env, element4, context, "action", ["transitionPage", "completedAssignments", "Completed"], {"on": "tap"});
        inline(env, morph4, context, "icon-device", ["completed"], {});
        element(env, element5, context, "action", ["transitionPage", "courses", "My Courses"], {"on": "tap"});
        inline(env, morph5, context, "icon-device", ["courses"], {});
        element(env, element6, context, "action", ["transitionPage", "reminders", "Settings"], {"on": "tap"});
        inline(env, morph6, context, "icon-device", ["reminders"], {});
        element(env, element7, context, "action", ["transitionPage", "support", "Support"], {"on": "tap"});
        inline(env, morph7, context, "icon-device", ["info"], {});
        content(env, morph8, context, "outlet");
        inline(env, morph9, context, "outlet", ["welcome"], {});
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
          blockParams: 1,
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
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, element = hooks.element, inline = hooks.inline;
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
            var element3 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element3,1,1);
            set(env, context, "assignment", blockArguments[0]);
            element(env, element3, context, "action", ["clickElement", get(env, context, "assignment")], {"on": "panStart"});
            inline(env, morph0, context, "assignment-card", [], {"assignment": get(env, context, "assignment"), "toggleModal": "toggleModal", "removeAssignment": "removeAssignment"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
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
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content, get = hooks.get, block = hooks.block;
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
          set(env, context, "day", blockArguments[0]);
          content(env, morph0, context, "day.key");
          block(env, morph1, context, "each", [get(env, context, "day")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
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
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
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
          set(env, context, "assignment", blockArguments[0]);
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
            element(env, element1, context, "action", ["share"], {"on": "tap"});
            element(env, element2, context, "action", ["cancel"], {"on": "tap"});
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
        dom.setAttribute(el3,"class","vertical-separator white");
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
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","arrow-up");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
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
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, concat = hooks.concat, attribute = hooks.attribute;
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
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element4, [3]);
        var element7 = dom.childAt(element4, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(element5, [1, 1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element5, [5, 1]),1,1);
        var morph2 = dom.createMorphAt(element6,1,1);
        var morph3 = dom.createMorphAt(element6,5,5);
        var morph4 = dom.createMorphAt(dom.childAt(element4, [5]),5,5);
        var attrMorph0 = dom.createAttrMorph(element7, 'class');
        var morph5 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        content(env, morph0, context, "totalDue");
        content(env, morph1, context, "totalOverdue");
        content(env, morph2, context, "firstOfDay");
        block(env, morph3, context, "each", [get(env, context, "groupedCards")], {}, child0, null);
        block(env, morph4, context, "each", [get(env, context, "overdue")], {}, child1, null);
        attribute(env, attrMorph0, element7, "class", concat(env, ["static-content nothing-due ", get(env, context, "stuffDue")]));
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
        blockParams: 1,
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
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
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
          set(env, context, "assignment", blockArguments[0]);
          element(env, element1, context, "action", ["unRemoveAssignment", get(env, context, "assignment")], {"on": "tap"});
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
        block(env, morph0, context, "each", [get(env, context, "filteredData")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/components/assignment-card', ['exports'], function (exports) {

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
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","from-now");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ago\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","time-due");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
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
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
          content(env, morph0, context, "assignment.fromNow");
          content(env, morph1, context, "assignment.timeDue");
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
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","time-due");
          var el2 = dom.createTextNode("\n                    Morning\n                ");
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
        dom.setAttribute(el1,"class","slider left-box");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","reveal");
        var el3 = dom.createTextNode("\n           ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n               Mark as ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n               Done\n           ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","time");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("            ");
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
        var hooks = env.hooks, get = hooks.get, element = hooks.element, concat = hooks.concat, attribute = hooks.attribute, block = hooks.block, content = hooks.content, inline = hooks.inline;
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
        var attrMorph0 = dom.createAttrMorph(element2, 'id');
        var attrMorph1 = dom.createAttrMorph(element2, 'class');
        var morph0 = dom.createMorphAt(element3,1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        var morph2 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        var morph3 = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        var morph4 = dom.createMorphAt(element2,5,5);
        element(env, element0, context, "action", ["slideOver", get(env, context, "assignment")], {"on": "swipe"});
        element(env, element1, context, "action", ["removeAssignment", get(env, context, "assignment")], {"on": "tap"});
        attribute(env, attrMorph0, element2, "id", concat(env, [get(env, context, "assignment.id")]));
        attribute(env, attrMorph1, element2, "class", concat(env, ["fastAnimate removable ", get(env, context, "assignment.urgencyLabel")]));
        element(env, element2, context, "action", ["slideOver", get(env, context, "assignment")], {"on": "tap"});
        block(env, morph0, context, "if", [get(env, context, "assignment.time_visible")], {}, child0, child1);
        content(env, morph1, context, "assignment.course_id.course_name");
        content(env, morph2, context, "assignment.assignment_name");
        inline(env, morph3, context, "description-text", [get(env, context, "assignment.description")], {});
        inline(env, morph4, context, "input", [], {"class": "date-due", "type": "hidden", "value": get(env, context, "assignment.daysAway")});
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/components/bs-switch', ['exports'], function (exports) {

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
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "input", [], {"type": "checkbox", "name": get(env, context, "name")});
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/courses', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
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
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
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
          set(env, context, "course", blockArguments[0]);
          element(env, element1, context, "action", ["removeCourse", get(env, context, "course")], {"on": "tap"});
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
        block(env, morph0, context, "each", [get(env, context, "filteredData")], {}, child0, null);
        element(env, element5, context, "action", ["addCourse", get(env, context, "course_code")], {"on": "tap"});
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
        blockParams: 1,
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
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
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
          set(env, context, "message", blockArguments[0]);
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
        block(env, morph0, context, "each", [get(env, context, "model")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/reminders', ['exports'], function (exports) {

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
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1,"src","assets/img/checked-black-blue.png");
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
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1,"src","assets/img/unchecked-black.png");
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
      var child2 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("br");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                    My parent's email address ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("br");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
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
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),5,5);
            inline(env, morph0, context, "input", [], {"value": get(env, context, "student.parent_email"), "action": "save", "on": "key-press"});
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
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","over13 static-content");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("\n                I am over 13 years old\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, block = hooks.block;
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
          var element1 = dom.childAt(element0, [1, 1]);
          var morph0 = dom.createMorphAt(element1,1,1);
          var morph1 = dom.createMorphAt(element0,3,3);
          element(env, element1, context, "action", ["toggleAge", get(env, context, "model")], {"on": "tap"});
          block(env, morph0, context, "if", [get(env, context, "model.over12")], {}, child0, child1);
          block(env, morph1, context, "unless", [get(env, context, "model.over12")], {}, child2, null);
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
        dom.setAttribute(el1,"id","settings");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n        Reminders\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("table");
        dom.setAttribute(el2,"class","static-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createTextNode("\n                Notify me at ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","click-me");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" about due dates\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createTextNode("\n                Notify me about all new assignments and updates\n            ");
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
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n        Details\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","static-content");
        var el3 = dom.createTextNode("\n        My name is\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","buttons");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        var el4 = dom.createTextNode("\n            Student\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        var el4 = dom.createTextNode("\n            Parent\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element, content = hooks.content, concat = hooks.concat, attribute = hooks.attribute, block = hooks.block;
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
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(element2, [9]);
        var element8 = dom.childAt(element7, [1]);
        var element9 = dom.childAt(element7, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element5, [1]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(element3, [3, 1]),1,1);
        var morph3 = dom.createMorphAt(element6,1,1);
        var morph4 = dom.createMorphAt(element6,3,3);
        var attrMorph0 = dom.createAttrMorph(element8, 'class');
        var attrMorph1 = dom.createAttrMorph(element9, 'class');
        var morph5 = dom.createMorphAt(element2,11,11);
        inline(env, morph0, context, "bs-switch", [], {"name": "my-bs-switch", "btnSize": "medium", "status": get(env, context, "student.notifications"), "callback": "saveNotifications"});
        element(env, element5, context, "action", ["datePicker"], {"on": "tap"});
        content(env, morph1, context, "student.displayTime");
        inline(env, morph2, context, "bs-switch", [], {"name": "my-bs-switch", "btnSize": "medium", "status": get(env, context, "student.notification_updates"), "callback": "saveUpdateNotifications"});
        inline(env, morph3, context, "input", [], {"value": get(env, context, "student.first_name"), "focus-out": "save"});
        inline(env, morph4, context, "input", [], {"value": get(env, context, "student.last_name"), "focus-out": "save"});
        attribute(env, attrMorph0, element8, "class", concat(env, ["box square ", get(env, context, "studentActive"), " double"]));
        element(env, element8, context, "action", ["setRole", get(env, context, "student"), "student"], {"on": "tap"});
        attribute(env, attrMorph1, element9, "class", concat(env, ["box square ", get(env, context, "parentActive"), " double"]));
        element(env, element9, context, "action", ["setRole", get(env, context, "student"), "parent"], {"on": "tap"});
        block(env, morph5, context, "unless", [get(env, context, "model.isParent")], {}, child0, null);
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
define('whats-due-cordova/templates/welcome', ['exports'], function (exports) {

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
        dom.setAttribute(el1,"class","welcome");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","outer");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","middle");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","inner");
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
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
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
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1, 1]),1,1);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/welcome/my-name', ['exports'], function (exports) {

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
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1,"src","assets/img/checked.png");
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
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1,"src","assets/img/unchecked.png");
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
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","over13");
          var el2 = dom.createTextNode("\n            I am over 13 years old\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
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
          var element0 = dom.childAt(fragment, [1, 1]);
          var morph0 = dom.createMorphAt(element0,1,1);
          element(env, element0, context, "action", ["toggleAge"], {"on": "tap"});
          block(env, morph0, context, "if", [get(env, context, "model.over12")], {}, child0, child1);
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
        dom.setAttribute(el1,"id","my-name");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        My name is\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","name keyboard-top");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"class","box centered square white join");
        var el3 = dom.createTextNode("\n        Join a Course\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","terms");
        var el3 = dom.createTextNode("\n        By continuing, you are agreeing to our");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" and\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("img");
        dom.setAttribute(el2,"class","static-content back-arrow");
        dom.setAttribute(el2,"src","assets/img/back.png");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, element = hooks.element;
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
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element1, [7]);
        var element4 = dom.childAt(element1, [9]);
        var element5 = dom.childAt(element1, [11]);
        var morph0 = dom.createMorphAt(element2,1,1);
        var morph1 = dom.createMorphAt(element2,3,3);
        var morph2 = dom.createMorphAt(element1,5,5);
        var morph3 = dom.createMorphAt(element4,3,3);
        var morph4 = dom.createMorphAt(element4,5,5);
        var morph5 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        inline(env, morph0, context, "input", [], {"type": "text", "placeholder": "First Name", "class": "box double square clear", "value": get(env, context, "model.first_name")});
        inline(env, morph1, context, "input", [], {"type": "text", "placeholder": "Last Name", "class": "box double square clear", "value": get(env, context, "model.last_name")});
        block(env, morph2, context, "unless", [get(env, context, "model.isParent")], {}, child0, null);
        element(env, element3, context, "action", ["setName"], {"on": "tap"});
        inline(env, morph3, context, "external-link", ["http://whatsdueapp.com/terms", "terms of service"], {});
        inline(env, morph4, context, "external-link", ["http://whatsdueapp.com/privacy-policy", "privacy policy"], {});
        element(env, element5, context, "action", ["transitionPage", "welcome.parent-student", "WhatsDue"], {"on": "tap"});
        inline(env, morph5, context, "log", [get(env, context, "model")], {});
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/welcome/parent-student', ['exports'], function (exports) {

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
        dom.setAttribute(el1,"id","parent-student");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        I am a\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","buttons");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        var el4 = dom.createTextNode("\n            Student\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        var el4 = dom.createTextNode("\n            Parent\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, concat = hooks.concat, attribute = hooks.attribute, element = hooks.element;
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
        var element0 = dom.childAt(fragment, [0, 3]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var attrMorph0 = dom.createAttrMorph(element1, 'class');
        var attrMorph1 = dom.createAttrMorph(element2, 'class');
        attribute(env, attrMorph0, element1, "class", concat(env, ["box square double ", get(env, context, "studentActive")]));
        element(env, element1, context, "action", ["setRole", "student"], {"on": "tap"});
        attribute(env, attrMorph1, element2, "class", concat(env, ["box square double ", get(env, context, "parentActive")]));
        element(env, element2, context, "action", ["setRole", "parent"], {"on": "tap"});
        return fragment;
      }
    };
  }()));

});
define('whats-due-cordova/templates/welcome/under13', ['exports'], function (exports) {

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
        dom.setAttribute(el1,"id","under13");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("\n       Looks like you're under 13\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        We need to send your parents an email\n        to let them know that you are using WhatsDue.\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        Please enter their email here:\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"class","box square white centered");
        var el3 = dom.createTextNode("\n        Join a Course\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("img");
        dom.setAttribute(el2,"class","static-content");
        dom.setAttribute(el2,"src","assets/img/back.png");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element;
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
        var element1 = dom.childAt(element0, [9]);
        var element2 = dom.childAt(element0, [11]);
        var morph0 = dom.createMorphAt(element0,7,7);
        inline(env, morph0, context, "input", [], {"type": "text", "placeholder": "Email", "class": "box full square clear", "value": get(env, context, "model.parent_email")});
        element(env, element1, context, "action", ["parentEmail", get(env, context, "model")], {"on": "tap"});
        element(env, element2, context, "action", ["transitionPage", "welcome.my-name", "WhatsDue"], {"on": "tap"});
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
define('whats-due-cordova/tests/adapters/student.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/student.js should pass jshint', function() { 
    ok(true, 'adapters/student.js should pass jshint.'); 
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
    ok(false, 'controllers/application.js should pass jshint.\ncontrollers/application.js: line 33, col 24, Missing semicolon.\n\n1 error'); 
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
    ok(false, 'controllers/courses.js should pass jshint.\ncontrollers/courses.js: line 24, col 24, \'cordovaLoaded\' is not defined.\ncontrollers/courses.js: line 25, col 25, \'cordova\' is not defined.\n\n2 errors'); 
  });

});
define('whats-due-cordova/tests/controllers/reminders.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/reminders.js should pass jshint', function() { 
    ok(true, 'controllers/reminders.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/welcome/my-name.jshint', function () {

  'use strict';

  module('JSHint - controllers/welcome');
  test('controllers/welcome/my-name.js should pass jshint', function() { 
    ok(true, 'controllers/welcome/my-name.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/welcome/parent-student.jshint', function () {

  'use strict';

  module('JSHint - controllers/welcome');
  test('controllers/welcome/parent-student.js should pass jshint', function() { 
    ok(false, 'controllers/welcome/parent-student.js should pass jshint.\ncontrollers/welcome/parent-student.js: line 7, col 24, Expected \'===\' and instead saw \'==\'.\ncontrollers/welcome/parent-student.js: line 17, col 43, \'moment\' is not defined.\ncontrollers/welcome/parent-student.js: line 21, col 17, \'CustomFunctions\' is not defined.\ncontrollers/welcome/parent-student.js: line 22, col 17, \'Migration\' is not defined.\n\n4 errors'); 
  });

});
define('whats-due-cordova/tests/controllers/welcome/under13.jshint', function () {

  'use strict';

  module('JSHint - controllers/welcome');
  test('controllers/welcome/under13.js should pass jshint', function() { 
    ok(false, 'controllers/welcome/under13.js should pass jshint.\ncontrollers/welcome/under13.js: line 11, col 17, \'CustomFunctions\' is not defined.\n\n1 error'); 
  });

});
define('whats-due-cordova/tests/helpers/description-text.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/description-text.js should pass jshint', function() { 
    ok(true, 'helpers/description-text.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/external-link.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/external-link.js should pass jshint', function() { 
    ok(false, 'helpers/external-link.js should pass jshint.\nhelpers/external-link.js: line 2, col 1, \'linkifyCordova\' is defined but never used.\n\n1 error'); 
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
define('whats-due-cordova/tests/models/setting.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/setting.js should pass jshint', function() { 
    ok(true, 'models/setting.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/student.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/student.js should pass jshint', function() { 
    ok(true, 'models/student.js should pass jshint.'); 
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
define('whats-due-cordova/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
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
define('whats-due-cordova/tests/routes/welcome.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/welcome.js should pass jshint', function() { 
    ok(false, 'routes/welcome.js should pass jshint.\nroutes/welcome.js: line 6, col 1, \'moment\' is defined but never used.\nroutes/welcome.js: line 7, col 1, \'CustomFunctions\' is defined but never used.\n\n2 errors'); 
  });

});
define('whats-due-cordova/tests/routes/welcome/my-name.jshint', function () {

  'use strict';

  module('JSHint - routes/welcome');
  test('routes/welcome/my-name.js should pass jshint', function() { 
    ok(true, 'routes/welcome/my-name.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/welcome/parent-student.jshint', function () {

  'use strict';

  module('JSHint - routes/welcome');
  test('routes/welcome/parent-student.js should pass jshint', function() { 
    ok(true, 'routes/welcome/parent-student.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/welcome/under13.jshint', function () {

  'use strict';

  module('JSHint - routes/welcome');
  test('routes/welcome/under13.js should pass jshint', function() { 
    ok(true, 'routes/welcome/under13.js should pass jshint.'); 
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

    exports['default'] = Ember['default'].View.extend({
        afterRender: function afterRender() {
            CustomUI.swipeRemove();
            //setTimeout(function(){
            //    new Dragdealer('demo-simple-slider');
            //},1000);
        }
        //    activeElement: false,
        //    allowSwiping: false,
        //    startPos: false,
        //    swipePosition: 0,
        //    swipeOpacity:1,
        //    hello: "display:none",
        //    panMove: function (event) {
        //        var x = event.originalEvent.gesture.deltaX;
        //        //if (this.allowSwiping){
        //            //Swipe
        //            var percent = 1 - Math.abs(x / pageWidth);
        //            //var percent = 1;
        //            //console.log(x);
        //            //this.currentPos = x;
        //            this.get('controller').set('xOffset', x);
        //            this.set('swipeOpacity', percent);
        //
        //            //this.get('controller').get('activeElement').set('style',"-webkit-transform: translate3d(" + x + "px, 0px, 0px) scale3d(1,1,1)");
        //
        //            console.log(this.activeElement);
        //            this.activeElement.css({
        //                "opacity": percent,
        //                "position": "relative",
        //                 "-webkit-transform": "translate3d(" + x + "px,0,0) scale3d(1,1,1)",
        //                "perspective": "1000px",
        //                "backface-visibility": "hidden",
        //                "transform": "translateX("+x+"px)"
        //            });
        //            //});
        //        //}
        //        event.preventDefault();
        //        return false; // return `false` to stop bubbling
        //    },
        //    panStart: function(event){
        //
        //        console.log(this.get('controller').get('activeElement'));
        //        //this.set('activeElement', this.get('controller').get('activeElement'));
        //
        //        var gesture = event.originalEvent.gesture;
        //        if (Math.abs(gesture.deltaY) < 15){
        //            //this.allowSwiping = true;
        //            this.activeElement = CustomUI.closest(event, '.removable');
        //            //this.set('activeElement', this.get('controller').get('activeElement'));
        //            console.log(this.get('controller').get('activeElement'));
        //            //CustomUI.closest(event,'.removable').addClass('swiping');
        //            Ember.$(document).bind('touchmove', function(e) {
        //                e.preventDefault();
        //            });
        //        } else{
        //            this.activeElement = false;
        //            this.allowSwiping = false;
        //        }
        //    },
        //    panEnd: function (event) {
        //        Ember.$(document).unbind('touchmove');
        //        // do something like send an event down the controller/route chain
        //        //console.log(this.sendAction('removeAssignment'));
        //        //console.log(this.get('controller').send('removeAssignment'));
        //        var gesture         = event.originalEvent.gesture;
        //        var percent         = Math.abs(gesture.deltaX) / pageWidth;
        //        var swiped          = percent > 0.3;
        //        var direction       = gesture.direction;
        //        console.log(this);
        //        if (swiped) {
        //            CustomUI.complete(this.activeElement, (1-percent)*200 );
        //            var position;
        //            if (direction === "left"){
        //                position = "-100%";
        //            } else if (direction === "right"){
        //                position = "100%";
        //            }
        //            this.activeElement.css({
        //                "-webkit-transform": "translate3d(" +position+ ",0,0)",
        //                "opacity": 0
        //            });
        //        } else {
        ////            CustomUI.customAnimate(Ember.$.(this.activeElement), (percent*100) );
        //            if (this.activeElement){
        //                this.activeElement.css({
        //                    "-webkit-transform": "translate3d(0,0,0)",
        //                    "opacity": 1
        //                });
        //            }
        //        }
        //        this.activeElement = false;
        //        return false; // return `false` to stop bubbling
        //    }
    });

    ///**
    // * requestAnimationFrame and cancel polyfill
    // */
    //(function() {
    //    var lastTime = 0;
    //    var vendors = ['ms', 'moz', 'webkit', 'o'];
    //    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    //        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    //        window.cancelAnimationFrame =
    //            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    //    }
    //
    //    if (!window.requestAnimationFrame)
    //        window.requestAnimationFrame = function(callback, element) {
    //            var currTime = new Date().getTime();
    //            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    //            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
    //                timeToCall);
    //            lastTime = currTime + timeToCall;
    //            return id;
    //        };
    //
    //    if (!window.cancelAnimationFrame)
    //        window.cancelAnimationFrame = function(id) {
    //            clearTimeout(id);
    //        };
    //}());

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

    exports['default'] = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
        }).observes('controller.filteredData'),
        afterRender: function afterRender() {
            CustomUI.makeSpinnable();
            var addCourse = Ember['default'].$('#addCourse');
            addCourse.find('input').val('');
            CustomUI.putBackable();
        }
    });

});
define('whats-due-cordova/views/support', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var SupportView = Ember['default'].View.extend({
        afterRender: function afterRender() {
            setTimeout(function () {
                CustomUI.showSupport();
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
  require("whats-due-cordova/app")["default"].create({"name":"whats-due-cordova","version":"0.0.1.15ed0d62"});
}

/* jshint ignore:end */
