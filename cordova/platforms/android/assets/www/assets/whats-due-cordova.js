"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('whats-due-cordova/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  /**
   * Created by dan on 2014-05-13.
   */

  exports['default'] = DS['default'].RESTAdapter.extend({
    host: 'http://test.whatsdueapp.com/app_dev.php',
    namespace: "student"
  });

});
define('whats-due-cordova/adapters/assignment', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  /**
   * Created by dan on 2014-05-13.
   */

  exports['default'] = DS['default'].RESTAdapter.extend({
    host: 'http://test.whatsdueapp.com/app_dev.php',
    namespace: "student/student"
  });

});
define('whats-due-cordova/adapters/setting', ['exports', 'ember-localforage-adapter/adapters/localforage'], function (exports, LFAdapter) {

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
        Resolver: Resolver['default']
    });

    loadInitializers['default'](App, config['default'].modulePrefix);

    exports['default'] = App;

});
define('whats-due-cordova/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'whats-due-cordova/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
define('whats-due-cordova/components/assignment-card', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 5/26/15.
     */
    exports['default'] = Ember['default'].Component.extend({
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                this.$().remove();
                this.sendAction('removeAssignment', assignment);
            },
            toggleModal: function toggleModal(assignment) {
                this.sendAction('toggleModal', assignment);
            },
            slideOver: function slideOver(assignment) {
                var element = Ember['default'].$("#" + assignment.get('id'));
                Ember['default'].$('.removable:not(#' + assignment.get('id') + ')').css("-webkit-transform", "translateX(0)");
                if (element.css("-webkit-transform") !== "matrix(1, 0, 0, 1, -100, 0)") {
                    element.css("-webkit-transform", "translateX(-100px)");
                } else {
                    element.css("-webkit-transform", "translateX(0)");
                }
            }
        }
    });

});
define('whats-due-cordova/components/bootstrap-switch', ['exports', 'ember-bootstrap-switch/components/bootstrap-switch'], function (exports, BootstrapSwitchComponent) {

	'use strict';

	exports['default'] = BootstrapSwitchComponent['default'];

});
define('whats-due-cordova/components/bs-switch', ['exports', 'ember-bootstrap-switch/components/bootstrap-switch'], function (exports, BootstrapSwitchComponent) {

	'use strict';

	exports['default'] = BootstrapSwitchComponent['default'];

});
define('whats-due-cordova/components/in-viewport', ['exports', 'ember', 'ember-in-viewport'], function (exports, Ember, InViewportMixin) {

    'use strict';

    /**
     * Created by Dan on 5/26/15.
     */
    exports['default'] = Ember['default'].Component.extend(InViewportMixin['default'], {
        viewportOptionsOverride: Ember['default'].on('didInsertElement', function () {
            Ember['default'].setProperties(this, {
                viewportSpy: true
            });
        }),
        classNames: ['in-viewport'],
        didEnterViewport: function didEnterViewport() {
            this.sendAction('triggered');
        }
    });

});
define('whats-due-cordova/components/infinity-loader', ['exports', 'ember-infinity/components/infinity-loader'], function (exports, infinityLoader) {

	'use strict';

	exports['default'] = infinityLoader['default'];

});
define('whats-due-cordova/components/removeable-card', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 5/26/15.
     */
    exports['default'] = Ember['default'].Component.extend({
        open: false,
        actions: {
            remove: function remove(item) {
                this.sendAction('remove', item);
            },
            slideOver: function slideOver() {
                var element = this.$().find('.putBackable');
                element.css("-webkit-transform", "matrix(1, 0, 0, 1, 55, 0)");
                var component = this;
                setTimeout(function () {
                    component.set('open', true);
                }, 50);
            },
            slideBack: function slideBack() {
                if (this.get('open')) {
                    var element = this.$().find('.putBackable');
                    element.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, 0)");
                    this.set('open', false);
                }
            }
        }
    });

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
            //CustomFunctions.updateAssignments(controller);
            setInterval(function () {
                //CustomFunctions.updateAssignments(controller);
                //CustomFunctions.updateCourses(controller);
            }, 5000);

            function checkVersion(version) {
                version = parseFloat(version);
                if (version < 2) {
                    CustomFunctions.setSetting('version', 2.1);
                    controller.transitionToRoute('welcome.parent-student');
                    controller.set('pageTitle', "Courses");
                    Migration.runMigration();
                } else if (version === 2) {
                    CustomFunctions.setSetting('version', 2.1);
                    setTimeout(function () {
                        Migration.setDefaultSettings();
                    }, 5000);
                }
            }
            CustomFunctions.getSetting('version', checkVersion);
            moment.locale('en', {
                calendar: {
                    lastDay: '[Yesterday] ',
                    sameDay: '[Today] ',
                    nextDay: '[Tomorrow]',
                    nextWeek: '[This] dddd',
                    sameElse: 'dddd MMM Do'
                },
                relativeTime: {
                    future: "%s ",
                    past: "%s",
                    s: "seconds",
                    m: "a minute",
                    mm: "%d minutes",
                    h: "an hour",
                    hh: "%d hours",
                    d: "a day",
                    dd: "%d days",
                    M: "a month",
                    MM: "%d months",
                    y: "a year",
                    yy: "%d years"
                }
            });
        },
        pageTitle: "Assignments",
        menuOpen: null,
        actions: {
            menuToggle: function menuToggle() {
                if (this.get('menuOpen')) {
                    this.set('menuOpen', null);
                } else {
                    this.set('menuOpen', "menuOpen");
                }
            },
            transitionPage: function transitionPage(destination, title) {
                this.transitionToRoute(destination);
                this.set('pageTitle', title);
                this.set('menuOpen', 'menuOpen');
            }
        }
    });

});
define('whats-due-cordova/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('whats-due-cordova/controllers/assignments/due', ['exports', 'ember', 'ember-group-by'], function (exports, Ember, groupBy) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        groupedCards: groupBy['default']('due', 'daysAway'),
        due: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived')
    });

});
define('whats-due-cordova/controllers/assignments/over-due', ['exports', 'ember', 'ember-group-by'], function (exports, Ember, groupBy) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived')
    });

});
define('whats-due-cordova/controllers/assignments', ['exports', 'ember', 'ember-group-by'], function (exports, Ember, groupBy) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        due: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        groupedCards: groupBy['default']('due', 'daysAway'),
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalDue: (function () {
            var dueLength = this.get('due.length');
            if (dueLength > 10) {
                return "10+";
            } else {
                return dueLength;
            }
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        stuffDue: (function () {
            return this.get('due.length') > 0;
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalOverdue: (function () {
            return this.get('overdue.length');
        }).property('model.@each.due_date', 'model.@each.completed')
    });

});
define('whats-due-cordova/controllers/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsController = Ember['default'].Controller.extend({
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
                    url: CustomFunctions.site() + "/assignments/" + assignment.get('id'),
                    type: 'PUT',
                    data: JSON.stringify(putData),
                    contentType: "application/json"
                });
            }
        }
    });

    exports['default'] = CompletedAssignmentsController;

});
define('whats-due-cordova/controllers/courses', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CoursesController = Ember['default'].Controller.extend({
        model: [],
        filteredData: (function () {
            this.set('sortProperties', 'admin_id');
            return this.get('model').filterBy('enrolled', true).sortBy('admin_id', 'course_name');
        }).property('model.@each.enrolled'),
        disabled: 'disabled',
        disableAddCourse: (function () {
            if (this.get('course_code').length < 6) {
                this.set('disabled', 'disabled');
            } else {
                this.set('disabled', null);
            }
        }).observes('course_code'),
        actions: {
            addCourse: function addCourse(course_code) {
                var controller = this;
                var store = this.store;
                course_code = course_code.toUpperCase();
                this.set('course_code', "");
                var addCourse = Ember['default'].$('#addCourse');
                addCourse.find('button').addClass('disabled');

                Ember['default'].$.ajax({
                    url: CustomFunctions.site() + "/courses/" + course_code + "/enroll",
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
                                'courses': "[" + course.get('id') + "]",
                                'sendAll': true
                            }, true);

                            //CustomFunctions.updateCourseList();
                            controller.set('course_code', "");
                            CustomFunctions.trackEvent("Course Added", "Course", course.get('course_name'), "Instructor", course.get('instructor_name'), "School", course.get('school_name'));
                        } else {
                            navigator.notification.alert('It looks like you\'re already in that course', null, 'Woops');
                        }
                    },
                    error: function error(resp) {
                        if (resp.statusText === "Course Not Found") {
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
                    url: CustomFunctions.site() + "/courses/" + course.get('id') + "/unenroll",
                    type: 'PUT',
                    data: { "primaryKey": localStorage.getItem('primaryKey') },
                    success: function success() {
                        context.store.query('assignment', { 'course_id': course.get('id') }).then(function (assignments) {
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
                        alert("Are you connected to the Internet?");
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
define('whats-due-cordova/controllers/settings', ['exports', 'ember'], function (exports, Ember) {

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
        actions: {
            toggleAge: function toggleAge(model) {
                model.toggleProperty('over12');
                model.save();
            },
            saveNotifications: function saveNotifications(component, event, state) {
                var student = this.get('student');
                student.set('notifications', state);
                student.save();
            },
            saveUpdateNotifications: function saveUpdateNotifications(component, event, state) {
                var student = this.get('student');
                student.set('notification_updates', state);
                student.save();
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
define('whats-due-cordova/controllers/support', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        data: null,
        init: function init() {
            var controller = this;
            Ember['default'].$.get("http://whatsdueapp.com/live-content/support.php", function (data) {
                controller.set('data', data);
            });
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
                    if (this.get('model').get('role') !== "parent" && this.get('model').get('over12') !== true) {
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
                if (role === "parent") {
                    this.set('parentActive', "white");
                    this.set('studentActive', "clear");
                } else {
                    this.set('studentActive', "white");
                    this.set('parentActive', "clear");
                }
                var route = this;
                return this.store.findAll('student').then(function (records) {
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

    exports['default'] = Ember['default'].Helper.helper(function (text) {
        if (typeof text === "undefined") {
            return Ember['default'].String.htmlSafe("");
        } else {
            text = Ember['default'].Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            return Ember['default'].String.htmlSafe(linkifyCordova(text));
        }
    });

});
define('whats-due-cordova/helpers/external-link', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Helper.helper(function (link, text) {
        var data = "<a onclick=\"window.open('" + link + "', '_system');\">" + text + "</a>";
        return new Ember['default'].Handlebars.SafeString(data);
    });

});
define('whats-due-cordova/helpers/fa-icon', ['exports', 'ember-cli-font-awesome/helpers/fa-icon'], function (exports, fa_icon) {

	'use strict';



	exports['default'] = fa_icon['default'];
	exports.faIcon = fa_icon.faIcon;

});
define('whats-due-cordova/helpers/icon-device', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  /**
   * Created by Dan on 4/29/15.
   */
  exports['default'] = Ember['default'].Helper.helper(function (name) {
    return new Ember['default'].Handlebars.SafeString('<img src="assets/icons/ios/' + name + '.png"/>');
  });

});
define('whats-due-cordova/helpers/linkify-external', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Helper.helper(function (text) {
        return new Ember['default'].Handlebars.SafeString(linkifyCordova(text));
    });

});
define('whats-due-cordova/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'whats-due-cordova/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
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

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('whats-due-cordova/initializers/viewport-config', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  var defaultConfig = {
    viewportSpy: false,
    viewportScrollSensitivity: 1,
    viewportRefreshRate: 100,
    viewportListeners: [],
    viewportTolerance: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    }
  };

  var merge = Ember['default'].merge;

  function initialize(_container, application) {
    var _config$viewportConfig = config['default'].viewportConfig;
    var viewportConfig = _config$viewportConfig === undefined ? {} : _config$viewportConfig;

    var mergedConfig = merge(defaultConfig, viewportConfig);

    application.register('config:in-viewport', mergedConfig, { instantiate: false });
  }

  exports['default'] = {
    name: 'viewport-config',
    initialize: initialize
  };

});
define('whats-due-cordova/models/assignment', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Assignment = DS['default'].Model.extend({
        assignment_name: DS['default'].attr('string'),
        description: DS['default'].attr('string', { defaultValue: " " }),
        created_at: DS['default'].attr('number'),
        due_date: DS['default'].attr('string'),
        last_modified: DS['default'].attr('number'),
        archived: DS['default'].attr('boolean'),
        time_visible: DS['default'].attr('boolean', { defaultValue: true }),
        last_updated: DS['default'].attr('number', { defaultValue: null }),
        date_completed: DS['default'].attr('number', { defaultValue: null }),
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
                return "orange";
            } else if (gap <= 0) {
                return "red";
            } else {
                return "white";
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
        school_name: DS['default'].attr('string', { defaultValue: "IDC Herzliya" }),
        enrolled: DS['default'].attr('boolean', { defaultValue: true }),
        archived: DS['default'].attr('boolean', { defaultValue: false }),
        assignments: DS['default'].hasMany('assignment'),
        hidden: (function () {
            if (this.get('archived') === true) {
                return "hidden";
            } else {
                return " ";
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
            return moment(this.get('updated_at'), "X").format('MMM Do, hh:mm A');
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
            return this.get('role') === "parent";
        }).property('role'),
        isStudent: (function () {
            return this.get('role') === "student";
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
                return "white";
            } else {
                return "clear";
            }
        }).property('isParent'),
        studentActive: (function () {
            if (this.get('isStudent')) {
                return "white";
            } else {
                return "clear";
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
        onPoll: function onPoll() {
            // This gets defined when its called
        }
    });

    exports['default'] = Pollster;

});
define('whats-due-cordova/router', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.route('courses', function () {});
        this.route('assignments', { path: '/' }, function () {
            this.route('due', function () {});
            this.route('over-due', function () {});
        });
        this.route('completedAssignments', function () {});

        this.route('support', function () {});
        this.route('messages', function () {});
        this.route('settings', function () {});
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

	exports['default'] = Ember['default'].Route.extend({});

});
define('whats-due-cordova/routes/assignments/due', ['exports', 'ember', 'ember-infinity/mixins/route'], function (exports, Ember, InfinityRoute) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
        model: function model() {
            /* Load pages of the Product Model, starting from page 1, in groups of 12. */
            return this.infinityModel("assignment", { perPage: 20, startingPage: 1 });
        }
    });

});
define('whats-due-cordova/routes/assignments/over-due', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AssignmentsRoute = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('assignment');
        }
    });

    exports['default'] = AssignmentsRoute;

});
define('whats-due-cordova/routes/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            this.store.findAll('course');
            return this.store.findAll('assignment');
        },
        afterModel: function afterModel() {
            this.transitionTo('assignments.due');
        },
        actions: {
            removeAssignment: function removeAssignment(assignment) {
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
                    url: CustomFunctions.site() + "/assignments/" + assignment.get('id'),
                    type: 'PUT',
                    data: JSON.stringify(putData),
                    contentType: "application/json"
                });
                CustomFunctions.trackEvent('Assignment Completed');
            }
        }
    });

});
define('whats-due-cordova/routes/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('assignment');
        }
    });

});
define('whats-due-cordova/routes/courses', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CoursesRoute = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('course');
        }
    });

    exports['default'] = CoursesRoute;

});
define('whats-due-cordova/routes/messages', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var MessagesRoute = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('message');
        }
    });

    exports['default'] = MessagesRoute;

});
define('whats-due-cordova/routes/settings', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('student').then(function (records) {
                return records.get('firstObject');
            });
        }
    });

});
define('whats-due-cordova/routes/welcome/my-name', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('student').then(function (records) {
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
            return this.store.findAll('student').then(function (records) {
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
define('whats-due-cordova/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 63,
            "column": 20
          }
        },
        "moduleName": "whats-due-cordova/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1,"id","appHeader");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","pull-left");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","pull-right hidden");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
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
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","content");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","menu");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("\n                    Assignments\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("span class=\"whatsdue count\"></span");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("\n                    Completed\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("\n                    My Courses\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("\n                    Settings\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("\n                    Feedback & Support\n                ");
        dom.appendChild(el5, el6);
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
        dom.setAttribute(el2,"id","main");
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
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [2]);
        var element2 = dom.childAt(element1, [1, 1]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var element5 = dom.childAt(element2, [5]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(element2, [9]);
        var morphs = new Array(18);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        morphs[4] = dom.createAttrMorph(element1, 'class');
        morphs[5] = dom.createElementMorph(element2);
        morphs[6] = dom.createElementMorph(element3);
        morphs[7] = dom.createMorphAt(dom.childAt(element3, [1]),1,1);
        morphs[8] = dom.createElementMorph(element4);
        morphs[9] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        morphs[10] = dom.createElementMorph(element5);
        morphs[11] = dom.createMorphAt(dom.childAt(element5, [1]),1,1);
        morphs[12] = dom.createElementMorph(element6);
        morphs[13] = dom.createMorphAt(dom.childAt(element6, [1]),1,1);
        morphs[14] = dom.createElementMorph(element7);
        morphs[15] = dom.createMorphAt(dom.childAt(element7, [1]),1,1);
        morphs[16] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        morphs[17] = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["element","action",["menuToggle"],[],["loc",[null,[1,23],[1,46]]]],
        ["inline","icon-device",["menu"],[],["loc",[null,[3,8],[3,30]]]],
        ["inline","icon-device",["menu"],[],["loc",[null,[6,8],[6,30]]]],
        ["content","pageTitle",["loc",[null,[9,8],[9,21]]]],
        ["attribute","class",["concat",[["get","menuOpen",["loc",[null,[12,27],[12,35]]]]," fastAnimate"]]],
        ["element","action",["menuToggle"],[],["loc",[null,[14,12],[14,35]]]],
        ["element","action",["transitionPage","assignments.due","Assignments"],[],["loc",[null,[15,16],[15,75]]]],
        ["inline","icon-device",["assignments"],[],["loc",[null,[17,20],[17,49]]]],
        ["element","action",["transitionPage","completedAssignments","Completed"],[],["loc",[null,[24,16],[24,78]]]],
        ["inline","icon-device",["completed"],[],["loc",[null,[26,20],[26,47]]]],
        ["element","action",["transitionPage","courses","My Courses"],[],["loc",[null,[32,16],[32,66]]]],
        ["inline","icon-device",["courses"],[],["loc",[null,[34,20],[34,45]]]],
        ["element","action",["transitionPage","settings","Settings"],[],["loc",[null,[40,16],[40,65]]]],
        ["inline","icon-device",["reminders"],[],["loc",[null,[43,20],[43,47]]]],
        ["element","action",["transitionPage","support","Support"],[],["loc",[null,[49,15],[49,62]]]],
        ["inline","icon-device",["info"],[],["loc",[null,[51,20],[51,42]]]],
        ["content","outlet",["loc",[null,[60,8],[60,18]]]],
        ["inline","outlet",["welcome"],[],["loc",[null,[63,0],[63,20]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/assignments/due', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 12
              },
              "end": {
                "line": 9,
                "column": 12
              }
            },
            "moduleName": "whats-due-cordova/templates/assignments/due.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
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
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
            return morphs;
          },
          statements: [
            ["inline","assignment-card",[],["assignment",["subexpr","@mut",[["get","assignment",["loc",[null,[7,49],[7,59]]]]],[],[]],"toggleModal","toggleModal","removeAssignment","removeAssignment"],["loc",[null,[7,20],[7,123]]]]
          ],
          locals: ["assignment"],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 10,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments/due.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["content","day.value",["loc",[null,[4,33],[4,46]]]],
          ["block","each",[["get","day.items",["loc",[null,[5,20],[5,29]]]]],[],0,null,["loc",[null,[5,12],[9,21]]]]
        ],
        locals: ["day"],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 13,
            "column": 0
          }
        },
        "moduleName": "whats-due-cordova/templates/assignments/due.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","assignments-due");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","arrow-up");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element0,3,3);
        morphs[1] = dom.createMorphAt(element0,5,5);
        return morphs;
      },
      statements: [
        ["block","each",[["get","groupedCards",["loc",[null,[3,12],[3,24]]]]],[],0,null,["loc",[null,[3,4],[10,13]]]],
        ["inline","infinity-loader",[],["infinityModel",["subexpr","@mut",[["get","model",["loc",[null,[11,36],[11,41]]]]],[],[]]],["loc",[null,[11,4],[11,43]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/assignments/over-due', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 4
            },
            "end": {
              "line": 8,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments/over-due.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","assignment-card",[],["assignment",["subexpr","@mut",[["get","assignment",["loc",[null,[7,37],[7,47]]]]],[],[]],"toggleModal","toggleModal","removeAssignment","removeAssignment"],["loc",[null,[7,8],[7,111]]]]
        ],
        locals: ["assignment"],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 0
          }
        },
        "moduleName": "whats-due-cordova/templates/assignments/over-due.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","assignments-overdue");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","arrow-up");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","day-divider");
        var el3 = dom.createTextNode("\n        Overdue\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),5,5);
        return morphs;
      },
      statements: [
        ["block","each",[["get","overdue",["loc",[null,[6,12],[6,19]]]]],[],0,null,["loc",[null,[6,4],[8,13]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/assignments', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 8
            },
            "end": {
              "line": 8,
              "column": 8
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                What's Due\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","badge square black");
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["content","totalDue",["loc",[null,[6,16],[6,28]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 8
            },
            "end": {
              "line": 17,
              "column": 8
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            Overdue\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","badge square black");
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["content","totalOverdue",["loc",[null,[15,16],[15,32]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 4
            },
            "end": {
              "line": 29,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2,"src","assets/img/thumbs-up.png");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h2");
          dom.setAttribute(el2,"class","centered");
          var el3 = dom.createTextNode("\n                Looks like you've got nothing due\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element0, 'class');
          return morphs;
        },
        statements: [
          ["attribute","class",["concat",["static-content nothing-due ",["get","stuffDue",["loc",[null,[23,49],[23,57]]]]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 30,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/assignments.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","newAssignments");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","vertical-separator white");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","newAssignments");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(element2,1,1);
        morphs[1] = dom.createMorphAt(element2,5,5);
        morphs[2] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        morphs[3] = dom.createMorphAt(element1,5,5);
        return morphs;
      },
      statements: [
        ["block","link-to",["assignments.due"],["class","due","tagName","div"],0,null,["loc",[null,[3,8],[8,20]]]],
        ["block","link-to",["assignments.over-due"],["class","overdue","tagName","div"],1,null,["loc",[null,[12,8],[17,20]]]],
        ["content","outlet",["loc",[null,[20,8],[20,18]]]],
        ["block","unless",[["get","stuffDue",["loc",[null,[22,14],[22,22]]]]],[],2,null,["loc",[null,[22,4],[29,15]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('whats-due-cordova/templates/completed-assignments', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 8
            },
            "end": {
              "line": 11,
              "column": 8
            }
          },
          "moduleName": "whats-due-cordova/templates/completed-assignments.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","removeable-card",[],["item",["subexpr","@mut",[["get","assignment",["loc",[null,[5,21],[5,31]]]]],[],[]],"title",["subexpr","@mut",[["get","assignment.assignment_name",["loc",[null,[6,22],[6,48]]]]],[],[]],"text",["subexpr","@mut",[["get","assignment.course_id.course_name",["loc",[null,[7,21],[7,53]]]]],[],[]],"icon","back","remove","unRemoveAssignment"],["loc",[null,[4,12],[10,14]]]]
        ],
        locals: ["assignment"],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 13,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/completed-assignments.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]),1,1);
        return morphs;
      },
      statements: [
        ["block","each",[["get","filteredData",["loc",[null,[3,16],[3,28]]]]],[],0,null,["loc",[null,[3,8],[11,17]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/components/assignment-card', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 12
            },
            "end": {
              "line": 17,
              "column": 12
            }
          },
          "moduleName": "whats-due-cordova/templates/components/assignment-card.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
          return morphs;
        },
        statements: [
          ["content","assignment.fromNow",["loc",[null,[12,16],[12,38]]]],
          ["content","assignment.timeDue",["loc",[null,[15,16],[15,38]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 12
            },
            "end": {
              "line": 21,
              "column": 12
            }
          },
          "moduleName": "whats-due-cordova/templates/components/assignment-card.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
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
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 38,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/components/assignment-card.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var morphs = new Array(10);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createElementMorph(element1);
        morphs[2] = dom.createAttrMorph(element2, 'id');
        morphs[3] = dom.createAttrMorph(element2, 'class');
        morphs[4] = dom.createElementMorph(element2);
        morphs[5] = dom.createMorphAt(element3,1,1);
        morphs[6] = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        morphs[7] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        morphs[8] = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        morphs[9] = dom.createMorphAt(element2,5,5);
        return morphs;
      },
      statements: [
        ["element","action",["slideOver",["get","assignment",["loc",[null,[1,50],[1,60]]]]],["on","swipe"],["loc",[null,[1,29],[1,73]]]],
        ["element","action",["removeAssignment",["get","assignment",["loc",[null,[2,37],[2,47]]]]],[],["loc",[null,[2,9],[2,49]]]],
        ["attribute","id",["concat",[["get","assignment.id",["loc",[null,[8,50],[8,63]]]]]]],
        ["attribute","class",["concat",["fastAnimate removable ",["get","assignment.urgencyLabel",["loc",[null,[8,99],[8,122]]]]]]],
        ["element","action",["slideOver",["get","assignment",["loc",[null,[8,30],[8,40]]]]],[],["loc",[null,[8,9],[8,43]]]],
        ["block","if",[["get","assignment.time_visible",["loc",[null,[10,18],[10,41]]]]],[],0,1,["loc",[null,[10,12],[21,19]]]],
        ["content","assignment.course_id.course_name",["loc",[null,[23,16],[23,54]]]],
        ["content","assignment.assignment_name",["loc",[null,[29,16],[29,46]]]],
        ["inline","description-text",[["get","assignment.description",["loc",[null,[32,35],[32,57]]]]],[],["loc",[null,[32,16],[32,59]]]],
        ["inline","input",[],["class","date-due","type","hidden","value",["subexpr","@mut",[["get","assignment.daysAway",["loc",[null,[36,53],[36,72]]]]],[],[]]],["loc",[null,[36,8],[36,74]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('whats-due-cordova/templates/components/in-viewport', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 3,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/components/in-viewport.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","in-viewport");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("i");
        dom.setAttribute(el2,"class","fa fa-refresh fa-spin");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() { return []; },
      statements: [

      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/components/infinity-loader', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 3,
              "column": 0
            }
          },
          "moduleName": "whats-due-cordova/templates/components/infinity-loader.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["content","yield",["loc",[null,[2,2],[2,11]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 2
              },
              "end": {
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "whats-due-cordova/templates/components/infinity-loader.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            return morphs;
          },
          statements: [
            ["content","loadedText",["loc",[null,[5,10],[5,24]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 2
              },
              "end": {
                "line": 8,
                "column": 2
              }
            },
            "moduleName": "whats-due-cordova/templates/components/infinity-loader.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            return morphs;
          },
          statements: [
            ["content","loadingText",["loc",[null,[7,10],[7,25]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 9,
              "column": 0
            }
          },
          "moduleName": "whats-due-cordova/templates/components/infinity-loader.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","infinityModel.reachedInfinity",["loc",[null,[4,8],[4,37]]]]],[],0,1,["loc",[null,[4,2],[8,9]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 0
          }
        },
        "moduleName": "whats-due-cordova/templates/components/infinity-loader.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","hasBlock",["loc",[null,[1,6],[1,14]]]]],[],0,1,["loc",[null,[1,0],[9,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('whats-due-cordova/templates/components/removeable-card', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 23,
            "column": 0
          }
        },
        "moduleName": "whats-due-cordova/templates/components/removeable-card.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","removeable-card");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","reveal");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
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
        dom.setAttribute(el2,"class","putBackable fastAnimate");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","info");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","courseName");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","instructorName");
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
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element0, [3]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element3, [1]);
        var morphs = new Array(7);
        morphs[0] = dom.createElementMorph(element1);
        morphs[1] = dom.createMorphAt(element1,1,1);
        morphs[2] = dom.createElementMorph(element2);
        morphs[3] = dom.createElementMorph(element4);
        morphs[4] = dom.createMorphAt(element4,1,1);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        morphs[6] = dom.createMorphAt(dom.childAt(element3, [5]),1,1);
        return morphs;
      },
      statements: [
        ["element","action",["remove",["get","item",["loc",[null,[3,32],[3,36]]]]],[],["loc",[null,[3,14],[3,39]]]],
        ["inline","icon-device",[["get","icon",["loc",[null,[4,26],[4,30]]]]],[],["loc",[null,[4,12],[4,32]]]],
        ["element","action",["slideBack"],[],["loc",[null,[7,41],[7,63]]]],
        ["element","action",["slideOver"],[],["loc",[null,[9,18],[9,40]]]],
        ["inline","icon-device",["minus-red"],[],["loc",[null,[10,16],[10,43]]]],
        ["content","title",["loc",[null,[14,16],[14,25]]]],
        ["content","text",["loc",[null,[18,16],[18,24]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/courses', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 4
            },
            "end": {
              "line": 10,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/courses.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","removeable-card",[],["item",["subexpr","@mut",[["get","course",["loc",[null,[4,17],[4,23]]]]],[],[]],"title",["subexpr","@mut",[["get","course.course_name",["loc",[null,[5,18],[5,36]]]]],[],[]],"text",["subexpr","@mut",[["get","course.instructor_name",["loc",[null,[6,17],[6,39]]]]],[],[]],"icon","X","remove","removeCourse"],["loc",[null,[3,8],[9,10]]]]
        ],
        locals: ["course"],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 19,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/courses.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","courses");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","addCourse");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
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
        var el2 = dom.createTextNode("\n    ");
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
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(element0,1,1);
        morphs[1] = dom.createAttrMorph(element2, 'class');
        morphs[2] = dom.createElementMorph(element2);
        morphs[3] = dom.createMorphAt(element1,3,3);
        return morphs;
      },
      statements: [
        ["block","each",[["get","filteredData",["loc",[null,[2,12],[2,24]]]]],[],0,null,["loc",[null,[2,4],[10,13]]]],
        ["attribute","class",["concat",[["get","disabled",["loc",[null,[12,61],[12,69]]]]," fastAnimate"]]],
        ["element","action",["addCourse",["get","course_code",["loc",[null,[12,37],[12,48]]]]],[],["loc",[null,[12,16],[12,50]]]],
        ["inline","input",[],["type","text","value",["subexpr","@mut",[["get","course_code",["loc",[null,[13,34],[13,45]]]]],[],[]],"maxlength","6","placeholder","Course Code","class","search","autocomplete","off","autocorrect","off","autocapitalize","off","spellcheck","false"],["loc",[null,[13,8],[13,181]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/messages', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 4
            },
            "end": {
              "line": 16,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/messages.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
          return morphs;
        },
        statements: [
          ["content","message.course_id.course_name",["loc",[null,[6,20],[6,53]]]],
          ["content","message.date",["loc",[null,[9,20],[9,36]]]],
          ["content","message.body",["loc",[null,[13,16],[13,32]]]]
        ],
        locals: ["message"],
        templates: []
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/messages.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        return morphs;
      },
      statements: [
        ["block","each",[["get","model",["loc",[null,[2,12],[2,17]]]]],[],0,null,["loc",[null,[2,4],[16,13]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/settings', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 55,
                "column": 20
              },
              "end": {
                "line": 57,
                "column": 20
              }
            },
            "moduleName": "whats-due-cordova/templates/settings.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
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
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 57,
                "column": 20
              },
              "end": {
                "line": 59,
                "column": 20
              }
            },
            "moduleName": "whats-due-cordova/templates/settings.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
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
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child2 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 62,
                "column": 12
              },
              "end": {
                "line": 68,
                "column": 12
              }
            },
            "moduleName": "whats-due-cordova/templates/settings.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
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
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),5,5);
            return morphs;
          },
          statements: [
            ["inline","input",[],["value",["subexpr","@mut",[["get","student.parent_email",["loc",[null,[66,34],[66,54]]]]],[],[]],"key-press","save"],["loc",[null,[66,20],[66,74]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 50,
              "column": 4
            },
            "end": {
              "line": 70,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/settings.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1, 1]);
          var morphs = new Array(3);
          morphs[0] = dom.createElementMorph(element1);
          morphs[1] = dom.createMorphAt(element1,1,1);
          morphs[2] = dom.createMorphAt(element0,3,3);
          return morphs;
        },
        statements: [
          ["element","action",["toggleAge",["get","model",["loc",[null,[54,43],[54,48]]]]],[],["loc",[null,[54,22],[54,50]]]],
          ["block","if",[["get","model.over12",["loc",[null,[55,26],[55,38]]]]],[],0,1,["loc",[null,[55,20],[59,27]]]],
          ["block","unless",[["get","model.over12",["loc",[null,[62,22],[62,34]]]]],[],2,null,["loc",[null,[62,12],[68,23]]]]
        ],
        locals: [],
        templates: [child0, child1, child2]
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 71,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/settings.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
        var el5 = dom.createTextNode("\n\n            ");
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(element2, [9]);
        var element8 = dom.childAt(element7, [1]);
        var element9 = dom.childAt(element7, [3]);
        var morphs = new Array(11);
        morphs[0] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        morphs[1] = dom.createElementMorph(element5);
        morphs[2] = dom.createMorphAt(dom.childAt(element5, [1]),0,0);
        morphs[3] = dom.createMorphAt(dom.childAt(element3, [3, 1]),1,1);
        morphs[4] = dom.createMorphAt(element6,1,1);
        morphs[5] = dom.createMorphAt(element6,3,3);
        morphs[6] = dom.createAttrMorph(element8, 'class');
        morphs[7] = dom.createElementMorph(element8);
        morphs[8] = dom.createAttrMorph(element9, 'class');
        morphs[9] = dom.createElementMorph(element9);
        morphs[10] = dom.createMorphAt(element2,11,11);
        return morphs;
      },
      statements: [
        ["inline","bs-switch",[],["name","my-bs-switch","btnSize","medium","checked",["subexpr","@mut",[["get","student.notifications",["loc",[null,[10,28],[10,49]]]]],[],[]],"on-switch-change","saveNotifications"],["loc",[null,[8,16],[12,18]]]],
        ["element","action",["datePicker"],[],["loc",[null,[14,16],[14,39]]]],
        ["content","student.displayTime",["loc",[null,[15,52],[15,75]]]],
        ["inline","bs-switch",[],["name","my-bs-switch","btnSize","medium","checked",["subexpr","@mut",[["get","student.notification_updates",["loc",[null,[22,28],[22,56]]]]],[],[]],"on-switch-change","saveUpdateNotifications"],["loc",[null,[20,16],[24,18]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","student.first_name",["loc",[null,[39,22],[39,40]]]]],[],[]],"focus-out","save"],["loc",[null,[39,8],[39,62]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","student.last_name",["loc",[null,[40,22],[40,39]]]]],[],[]],"focus-out","save"],["loc",[null,[40,8],[40,62]]]],
        ["attribute","class",["concat",["box square ",["get","studentActive",["loc",[null,[43,70],[43,83]]]]," double"]]],
        ["element","action",["setRole",["get","student",["loc",[null,[43,30],[43,37]]]],"student"],[],["loc",[null,[43,11],[43,49]]]],
        ["attribute","class",["concat",["box square ",["get","parentActive",["loc",[null,[46,69],[46,81]]]]," double"]]],
        ["element","action",["setRole",["get","student",["loc",[null,[46,30],[46,37]]]],"parent"],[],["loc",[null,[46,11],[46,48]]]],
        ["block","unless",[["get","model.isParent",["loc",[null,[50,14],[50,28]]]]],[],0,null,["loc",[null,[50,4],[70,15]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/support', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 3,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/support.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","support");
        dom.setAttribute(el1,"class","static-content");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createUnsafeMorphAt(dom.childAt(fragment, [0]),1,1);
        return morphs;
      },
      statements: [
        ["content","data",["loc",[null,[2,4],[2,14]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/welcome/my-name', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 12
              },
              "end": {
                "line": 17,
                "column": 12
              }
            },
            "moduleName": "whats-due-cordova/templates/welcome/my-name.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
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
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@2.0.2",
            "loc": {
              "source": null,
              "start": {
                "line": 17,
                "column": 12
              },
              "end": {
                "line": 19,
                "column": 12
              }
            },
            "moduleName": "whats-due-cordova/templates/welcome/my-name.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
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
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@2.0.2",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 4
            },
            "end": {
              "line": 22,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/welcome/my-name.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
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
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0,1,1);
          return morphs;
        },
        statements: [
          ["element","action",["toggleAge"],[],["loc",[null,[14,18],[14,40]]]],
          ["block","if",[["get","model.over12",["loc",[null,[15,18],[15,30]]]]],[],0,1,["loc",[null,[15,12],[19,19]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 35,
            "column": 13
          }
        },
        "moduleName": "whats-due-cordova/templates/welcome/my-name.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element1, [7]);
        var element4 = dom.childAt(element1, [9]);
        var element5 = dom.childAt(element1, [11]);
        var morphs = new Array(8);
        morphs[0] = dom.createMorphAt(element2,1,1);
        morphs[1] = dom.createMorphAt(element2,3,3);
        morphs[2] = dom.createMorphAt(element1,5,5);
        morphs[3] = dom.createElementMorph(element3);
        morphs[4] = dom.createMorphAt(element4,3,3);
        morphs[5] = dom.createMorphAt(element4,5,5);
        morphs[6] = dom.createElementMorph(element5);
        morphs[7] = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["inline","input",[],["type","text","placeholder","First Name","class","box double square clear","value",["subexpr","@mut",[["get","model.first_name",["loc",[null,[6,91],[6,107]]]]],[],[]]],["loc",[null,[6,8],[6,109]]]],
        ["inline","input",[],["type","text","placeholder","Last Name","class","box double square clear","value",["subexpr","@mut",[["get","model.last_name",["loc",[null,[8,90],[8,105]]]]],[],[]]],["loc",[null,[8,8],[8,107]]]],
        ["block","unless",[["get","model.isParent",["loc",[null,[11,14],[11,28]]]]],[],0,null,["loc",[null,[11,4],[22,15]]]],
        ["element","action",["setName"],[],["loc",[null,[23,7],[23,27]]]],
        ["inline","external-link",["http://whatsdueapp.com/terms","terms of service"],[],["loc",[null,[28,8],[28,75]]]],
        ["inline","external-link",["http://whatsdueapp.com/privacy-policy","privacy policy"],[],["loc",[null,[29,8],[29,82]]]],
        ["element","action",["transitionPage","welcome.parent-student","WhatsDue"],[],["loc",[null,[32,9],[32,72]]]],
        ["inline","log",[["get","model",["loc",[null,[35,6],[35,11]]]]],[],["loc",[null,[35,0],[35,13]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('whats-due-cordova/templates/welcome/parent-student', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 0
          }
        },
        "moduleName": "whats-due-cordova/templates/welcome/parent-student.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element1, 'class');
        morphs[1] = dom.createElementMorph(element1);
        morphs[2] = dom.createAttrMorph(element2, 'class');
        morphs[3] = dom.createElementMorph(element2);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["box square double ",["get","studentActive",["loc",[null,[6,69],[6,82]]]]]]],
        ["element","action",["setRole","student"],[],["loc",[null,[6,11],[6,41]]]],
        ["attribute","class",["concat",["box square double ",["get","parentActive",["loc",[null,[9,68],[9,80]]]]]]],
        ["element","action",["setRole","parent"],[],["loc",[null,[9,11],[9,40]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/welcome/under13', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 21,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/welcome/under13.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [9]);
        var element2 = dom.childAt(element0, [11]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element0,7,7);
        morphs[1] = dom.createElementMorph(element1);
        morphs[2] = dom.createElementMorph(element2);
        return morphs;
      },
      statements: [
        ["inline","input",[],["type","text","placeholder","Email","class","box full square clear","value",["subexpr","@mut",[["get","model.parent_email",["loc",[null,[13,80],[13,98]]]]],[],[]]],["loc",[null,[13,4],[13,100]]]],
        ["element","action",["parentEmail",["get","model",["loc",[null,[15,30],[15,35]]]]],[],["loc",[null,[15,7],[15,37]]]],
        ["element","action",["transitionPage","welcome.my-name","WhatsDue"],[],["loc",[null,[18,9],[18,65]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/welcome', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@2.0.2",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/welcome.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
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
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1, 1]),1,1);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[5,16],[5,26]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/tests/adapters/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/adapters/assignment.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/assignment.js should pass jshint', function(assert) { 
    assert.ok(true, 'adapters/assignment.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/adapters/setting.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/setting.js should pass jshint', function(assert) { 
    assert.ok(true, 'adapters/setting.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('app.js should pass jshint', function(assert) { 
    assert.ok(true, 'app.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/components/assignment-card.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/assignment-card.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/assignment-card.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/components/in-viewport.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/in-viewport.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/in-viewport.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/components/removeable-card.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/removeable-card.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/removeable-card.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/assignments/due.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/assignments');
  QUnit.test('controllers/assignments/due.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/assignments/due.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/assignments/over-due.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/assignments');
  QUnit.test('controllers/assignments/over-due.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/assignments/over-due.js should pass jshint.\ncontrollers/assignments/over-due.js: line 2, col 8, \'groupBy\' is defined but never used.\ncontrollers/assignments/over-due.js: line 5, col 1, \'CustomFunctions\' is defined but never used.\n\n2 errors'); 
  });

});
define('whats-due-cordova/tests/controllers/assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/assignments.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/assignments.js should pass jshint.\ncontrollers/assignments.js: line 25, col 25, Missing semicolon.\ncontrollers/assignments.js: line 4, col 1, \'CustomFunctions\' is defined but never used.\n\n2 errors'); 
  });

});
define('whats-due-cordova/tests/controllers/completed-assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/completed-assignments.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/completed-assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/courses.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/courses.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/courses.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/settings.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/settings.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/settings.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/support.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/support.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/support.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/welcome/my-name.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/welcome');
  QUnit.test('controllers/welcome/my-name.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/welcome/my-name.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/welcome/parent-student.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/welcome');
  QUnit.test('controllers/welcome/parent-student.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/welcome/parent-student.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/welcome/under13.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/welcome');
  QUnit.test('controllers/welcome/under13.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/welcome/under13.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/description-text.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/description-text.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/description-text.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/external-link.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/external-link.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/external-link.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/icon-device.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/icon-device.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/icon-device.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/linkify-external.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/linkify-external.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/linkify-external.js should pass jshint.'); 
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

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/resolver.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/helpers/start-app', ['exports', 'ember', 'whats-due-cordova/app', 'whats-due-cordova/config/environment'], function (exports, Ember, Application, config) {

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

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/start-app.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/assignment.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/assignment.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/assignment.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/course.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/course.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/course.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/message.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/message.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/message.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/setting.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/setting.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/setting.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/models/student.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/student.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/student.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/objects/pollster.jshint', function () {

  'use strict';

  QUnit.module('JSHint - objects');
  QUnit.test('objects/pollster.js should pass jshint', function(assert) { 
    assert.ok(true, 'objects/pollster.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/router.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('router.js should pass jshint', function(assert) { 
    assert.ok(true, 'router.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/assignments/due.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/assignments');
  QUnit.test('routes/assignments/due.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/assignments/due.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/assignments/over-due.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/assignments');
  QUnit.test('routes/assignments/over-due.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/assignments/over-due.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/assignments.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/completed-assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/completed-assignments.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/completed-assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/courses.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/courses.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/courses.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/messages.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/messages.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/messages.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/settings.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/settings.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/settings.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/welcome/my-name.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/welcome');
  QUnit.test('routes/welcome/my-name.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/welcome/my-name.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/welcome/parent-student.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/welcome');
  QUnit.test('routes/welcome/parent-student.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/welcome/parent-student.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/welcome/under13.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/welcome');
  QUnit.test('routes/welcome/under13.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/welcome/under13.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/welcome.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/welcome.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/welcome.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/test-helper', ['whats-due-cordova/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('whats-due-cordova/tests/test-helper.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('test-helper.js should pass jshint', function(assert) { 
    assert.ok(true, 'test-helper.js should pass jshint.'); 
  });

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
  require("whats-due-cordova/app")["default"].create({"name":"whats-due-cordova","version":"0.0.0+02a3f6db"});
}

/* jshint ignore:end */
//# sourceMappingURL=whats-due-cordova.map