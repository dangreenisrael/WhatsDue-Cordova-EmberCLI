"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('whats-due-cordova/adapters/application', ['exports', 'ember-data', 'whats-due-cordova/config/environment'], function (exports, DS, ENV) {

    'use strict';

    /**
     * Created by dan on 2014-05-13.
     */
    baseURL = ENV['default'].host + "/" + ENV['default'].namespace;

    exports['default'] = DS['default'].RESTAdapter.extend({
        host: (function () {
            return ENV['default'].host;
        }).property(),
        namespace: (function () {
            return ENV['default'].namespace;
        }).property(),
        headers: (function () {
            if (ENV['default'].environment === 'development') {
                return { "X-Student-Id": 1 };
            } else {
                while (typeof device === 'undefined') {}
                return { "X-UUID": device.uuid };
            }
        }).property()
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
        open: false,
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                var controller = this;
                /* Hacks for older mobile devices */
                assignment.set('hiding', 'animateHide');
                setTimeout(function () {
                    controller.sendAction('removeAssignment', assignment);
                    Ember['default'].$(window).scroll();
                }, 300);
            },
            toggleModal: function toggleModal(assignment) {
                this.sendAction('toggleModal', assignment);
            },
            slideOver: function slideOver(assignment) {
                if (!assignment.get('open')) {
                    assignment.set('open', 'open');
                } else {
                    assignment.set('open', null);
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
            CustomFunctions.setStore(this);
            var controller = this;
            function checkVersion(version) {
                version = parseFloat(version);
                console.log(version);
                if (version < 2) {
                    CustomFunctions.setSetting('version', 2.2);
                    //Migration.setDefaultSettings();
                    controller.store.findAll('student').then(function (records) {
                        var student = records.get('firstObject');
                        var defaultTime = moment();
                        defaultTime.hours(18);
                        defaultTime.minutes(0);
                        student.set('notification_time_local', defaultTime.format('HHmm'));
                        student.set('notification_time_utc', defaultTime.utcOffset('UTC').format('HHmm'));
                        student.save();
                    });
                    controller.transitionToRoute('welcome.parent-student');
                    controller.set('pageTitle', "Courses");
                } else {
                    controller.transitionToRoute('assignments.due');
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
        menuOpen: "menuClosed",
        loading: null,
        actions: {
            menuToggle: function menuToggle() {
                if (this.get('menuOpen') === "menuOpen") {
                    this.set('menuOpen', "menuClosed");
                } else {
                    this.set('menuOpen', "menuOpen");
                }
            }
        }
    });

});
define('whats-due-cordova/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('whats-due-cordova/controllers/assignments/due', ['exports', 'ember', 'ember-group-by', 'whats-due-cordova/config/environment'], function (exports, Ember, groupBy, ENV) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        groupedCards: groupBy['default']('due', 'daysAway'),
        due: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.[]', 'model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        assignmentsController: Ember['default'].inject.controller('assignments'),
        getUpdates: function getUpdates() {
            var controller = this;
            var baseURL = ENV['default'].host + "/" + ENV['default'].namespace;
            var headers = ENV['default'].APIHeaders;
            localforage.getItem('assignmentTimestamp').then(function (timestamp) {
                $.ajax({
                    url: baseURL + "/updates/" + timestamp + "/assignments",
                    headers: headers
                }).done(function (data) {
                    controller.store.pushPayload('assignment', data.records);
                    var newModel = controller.store.peekAll('assignment').filterBy('archived', false).sortBy('due_date');
                    controller.set('due', newModel);
                    controller.get('assignmentsController').set('due', newModel);
                    localforage.setItem('assignmentTimestamp', data.meta.timestamp);
                });
            });
        },
        updateTimer: (function () {
            var controller = this;
            setInterval(function () {
                Ember['default'].run(this, function () {
                    //controller.getUpdates();
                });
            }, 5000);
        }).on('init'),
        loaded: null,
        actions: {
            getUpdates: function getUpdates() {
                this.getUpdates();
            }
        }
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
define('whats-due-cordova/controllers/assignments', ['exports', 'ember', 'ember-group-by', 'whats-due-cordova/config/environment'], function (exports, Ember, groupBy, ENV) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        groupedCards: groupBy['default']('due', 'daysAway'),
        due: (function () {
            return this.store.peekAll('assignment').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.[]', 'updateCount'),
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.[]', 'updateCount'),
        totalDue: (function () {
            var dueLength = this.get('due.length');
            if (dueLength > 10) {
                return "10+";
            } else {
                return dueLength;
            }
        }).property('due'),
        stuffDue: (function () {
            return this.get('due.length') + this.get('overdue.length') > 0;
        }).property('due', 'overdue'),
        stuffOverdue: (function () {
            return this.get('overdue.length') > 0;
        }).property('overdue'),
        totalOverdue: (function () {
            var overdueLength = this.get('overdue.length');
            if (overdueLength > 10) {
                return "10+";
            } else {
                return overdueLength;
            }
        }).property('overdue'),
        getUpdates: function getUpdates() {
            var controller = this;
            var baseURL = ENV['default'].host + "/" + ENV['default'].namespace;
            var headers = undefined;
            if (ENV['default'].environment === 'development' || ENV['default'].environment === 'wifi') {
                headers = { "X-UUID": "28a60846d242fbe7" };
            } else {
                headers = { "X-UUID": device.uuid };
            }
            localforage.getItem('assignmentTimestamp').then(function (timestamp) {
                Ember['default'].$.ajax({
                    url: baseURL + "/updates/" + timestamp + "/assignments",
                    headers: headers
                }).done(function (data) {
                    localforage.setItem('assignmentTimestamp', data.meta.timestamp);
                    if (data.records.assignment.length > 0) {
                        controller.store.pushPayload('assignment', data.records);
                        controller.set('updateCount', Math.random());
                    }
                });
            });
        },
        updateCount: 0.1,
        updateTimer: (function () {
            var controller = this;
            setInterval(function () {
                Ember['default'].run(this, function () {
                    controller.getUpdates();
                });
            }, 5000);
        }).on('init'),
        showOverdue: "hidden",
        actions: {
            getUpdates: function getUpdates() {
                this.getUpdates();
            },
            showDue: function showDue() {
                this.set('showDue', null);
                this.set('showOverdue', "hidden");
            },
            showOverdue: function showOverdue() {
                this.set('showOverdue', null);
                this.set('showDue', "hidden");
            },
            removeAssignment: function removeAssignment(assignment) {
                assignment.set('completed', true);
                assignment.set('completed_date', Date.now());
                this.set('updateCount', Math.random());
                assignment.save().then(function () {
                    CustomFunctions.trackEvent('Assignment Completed');
                }, function () {
                    CustomFunctions.trackEvent('Assignment Complete Failed');
                });
            }
        }
    });

});
define('whats-due-cordova/controllers/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        filteredData: (function () {
            return this.get('model').filterBy('completed', true);
        }).property('model.@each.completed')
    });

});
define('whats-due-cordova/controllers/courses', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        model: [],
        disabled: 'disabled',
        disableAddCourse: (function () {
            if (this.get('course_code').length < 6) {
                this.set('disabled', 'disabled');
            } else {
                this.set('disabled', null);
            }
        }).observes('course_code')
    });

});
define('whats-due-cordova/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('whats-due-cordova/controllers/settings', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
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
        }).property('model.role')
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
                    navigator.notification.alert('We need your first and last name', null, 'hWoops');
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
                    navigator.notification.alert('Double check that email', null, 'Whoops');
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

    exports['default'] = Ember['default'].Helper.helper(function (params) {
        var data = "<a onclick=\"window.open('" + params[0] + "', '_system');\">" + params[1] + "</a>";
        return new Ember['default'].String.htmlSafe(data);
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
        completed_date: DS['default'].attr('number', { defaultValue: null }),
        completed: DS['default'].attr('boolean', { defaultValue: false }),
        course_id: DS['default'].belongsTo('course', { async: true }),
        hiding: DS['default'].attr('string', { defaultValue: null }),
        open: DS['default'].attr('string', { defaultValue: null }),
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
        error: DS['default'].attr('string', { defaultValue: null }),
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
define('whats-due-cordova/router', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.route('courses', function () {});
        this.route('assignments', function () {
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
define('whats-due-cordova/routes/application-error', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, Ember, ENV) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        init: function init() {
            var route = this;
            var timeout = function timeout() {
                setTimeout(function () {
                    var onSuccess = function onSuccess() {
                        route.transitionTo('assignments');
                    };
                    var onFail = function onFail() {
                        timeout();
                    };
                    Ember['default'].$.get(ENV['default'].host + "/" + ENV['default'].namespace + "/test/connection").done(onSuccess).fail(onFail);
                }, 2500);
            };
            timeout();
        }
    });

});
define('whats-due-cordova/routes/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        actions: {
            addCourse: function addCourse(course_code) {
                this.transitionTo('courses');
                var route = this;
                course_code = course_code.toUpperCase();
                this.store.createRecord('course', {
                    course_code: course_code,
                    course_name: "Joining Course ..."
                }).save().then(function (record) {
                    var error = record.get('error');
                    if (error) {
                        record.unloadRecord();
                        route.errorMessage(error);
                    }
                })['catch'](function () {
                    route.errorMessage("Are you connected to the internet?");
                });
                this.controllerFor('courses').set('course_code', "");
            },
            removeCourse: function removeCourse(course) {
                course.destroyRecord();
                this.store.unloadAll('assignment');
            },
            checkConnection: function checkConnection() {
                this.transitionTo('assignments');
            },
            transitionPage: function transitionPage(destination, title) {
                this.transitionTo(destination);
                this.controllerFor('application').set('pageTitle', title);
                this.set('menuOpen', 'menuOpen');
            }
        },
        errorMessage: function errorMessage(message) {
            if (navigator.notification) {
                navigator.notification.alert(message, null, 'Whoops');
            } else {
                alert(message);
            }
        }
    });

});
define('whats-due-cordova/routes/assignments', ['exports', 'ember', 'ember-infinity/mixins/route'], function (exports, Ember, InfinityRoute) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend(InfinityRoute['default'], {
        model: function model() {
            return this.infinityModel("assignment", { perPage: 10, startingPage: 1 }).then(function (data) {
                localforage.setItem('assignmentTimestamp', data.get('meta').timestamp);
                return data;
            });
        },
        afterModel: function afterModel() {
            this.controllerFor('application').set('loading', null);
            console.log('loaded');
        },
        beforeModel: function beforeModel() {
            this.controllerFor('application').set('loading', 'loading');
        }
    });

});
define('whats-due-cordova/routes/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.query('assignment', {
                'completed': true
            });
        },
        pageLeave: (function () {
            var store = this.store;
            store.peekAll('assignment').filterBy('completed', true).forEach(function (record) {
                store.unloadRecord(record);
            });
        }).on('deactivate'),
        actions: {
            unRemoveAssignment: function unRemoveAssignment(assignment) {
                var store = this.store;
                assignment.set('completed', false);
                assignment.set('date_completed', null);
                assignment.save().then(function (record) {
                    store.unloadRecord(record);
                });
            }
        },
        beforeModel: function beforeModel() {
            this.controllerFor('application').set('loading', 'loading');
        },
        afterModel: function afterModel() {
            this.controllerFor('application').set('loading', null);
        }
    });

});
define('whats-due-cordova/routes/courses', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('course');
        },
        beforeModel: function beforeModel() {
            this.controllerFor('application').set('loading', 'loading');
        },
        afterModel: function afterModel() {
            this.controllerFor('application').set('loading', null);
        }
    });

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
        },
        actions: {
            toggleAge: function toggleAge(model) {
                model.toggleProperty('over12');
                model.save();
            },
            save: function save() {
                this.currentModel.save();
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
                var student = this.currentModel;
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
        saveTime: function saveTime() {
            var student = this.currentModel;
            var hours = student.get('hours');
            var minutes = student.get('minutes');
            var local = moment().hours(hours).minutes(minutes);
            student.set('notification_time_local', local.format('HHmm'));
            student.set('notification_time_utc', local.utcOffset('UTC').format('HHmm'));
            student.save();
        },
        beforeModel: function beforeModel() {
            this.controllerFor('application').set('loading', 'loading');
        },
        afterModel: function afterModel() {
            this.controllerFor('application').set('loading', null);
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
define('whats-due-cordova/templates/application-error', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
        "moduleName": "whats-due-cordova/templates/application-error.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","application-error");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","inner");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"class","main-logo");
        dom.setAttribute(el3,"src","assets/img/logo-text.png");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n            Are you connected to the internet?\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"class","cloud");
        dom.setAttribute(el3,"src","assets/img/clouds.png");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n            All your assignments are synced with the cloud, so you need to be\n            online to access them.\n        ");
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
        var element0 = dom.childAt(fragment, [0, 1, 5]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [
        ["element","action",["checkConnection"],[],["loc",[null,[7,13],[7,41]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('whats-due-cordova/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 73,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/application.hbs"
      },
      isEmpty: false,
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
        dom.setAttribute(el2,"class","menuAnimate");
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
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","fa fa-spinner fa-pulse");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
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
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("Allow cordova to trigger actions ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","hidden");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","addCourseProgrammatically");
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
        var element1 = dom.childAt(fragment, [2]);
        var element2 = dom.childAt(element1, [1, 1]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var element5 = dom.childAt(element2, [5]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(element2, [9]);
        var element8 = dom.childAt(element1, [3]);
        var element9 = dom.childAt(fragment, [8, 1]);
        var morphs = new Array(21);
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
        morphs[16] = dom.createAttrMorph(element8, 'class');
        morphs[17] = dom.createMorphAt(dom.childAt(element8, [3]),1,1);
        morphs[18] = dom.createMorphAt(fragment,4,4,contextualElement);
        morphs[19] = dom.createElementMorph(element9);
        morphs[20] = dom.createMorphAt(element9,1,1);
        return morphs;
      },
      statements: [
        ["element","action",["menuToggle"],[],["loc",[null,[1,23],[1,46]]]],
        ["inline","icon-device",["menu"],[],["loc",[null,[3,8],[3,30]]]],
        ["inline","icon-device",["menu"],[],["loc",[null,[6,8],[6,30]]]],
        ["content","pageTitle",["loc",[null,[9,8],[9,21]]]],
        ["attribute","class",["concat",[["get","menuOpen",["loc",[null,[12,27],[12,35]]]]]]],
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
        ["attribute","class",["concat",[["get","loading",["loc",[null,[59,28],[59,35]]]]]]],
        ["content","outlet",["loc",[null,[62,12],[62,22]]]],
        ["inline","outlet",["welcome"],[],["loc",[null,[66,0],[66,20]]]],
        ["element","action",["addCourse",["get","courseCodeForBranch",["loc",[null,[70,61],[70,80]]]]],[],["loc",[null,[70,40],[70,82]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","courseCodeForBranch",["loc",[null,[71,22],[71,41]]]]],[],[]]],["loc",[null,[71,8],[71,43]]]]
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 7,
                "column": 12
              },
              "end": {
                "line": 11,
                "column": 12
              }
            },
            "moduleName": "whats-due-cordova/templates/assignments/due.hbs"
          },
          isEmpty: false,
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
            ["inline","assignment-card",[],["assignment",["subexpr","@mut",[["get","assignment",["loc",[null,[9,49],[9,59]]]]],[],[]],"toggleModal","toggleModal","removeAssignment","removeAssignment"],["loc",[null,[9,20],[9,123]]]]
          ],
          locals: ["assignment"],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 12,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments/due.hbs"
        },
        isEmpty: false,
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
          ["content","day.value",["loc",[null,[6,33],[6,46]]]],
          ["block","each",[["get","day.items",["loc",[null,[7,20],[7,29]]]]],[],0,null,["loc",[null,[7,12],[11,21]]]]
        ],
        locals: ["day"],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 14,
            "column": 0
          }
        },
        "moduleName": "whats-due-cordova/templates/assignments/due.hbs"
      },
      isEmpty: false,
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
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("<button {{action 'getUpdates'}}>Get Updates</button>");
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
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element0,3,3);
        morphs[1] = dom.createMorphAt(element0,7,7);
        return morphs;
      },
      statements: [
        ["inline","log",[["get","route",["loc",[null,[3,10],[3,15]]]]],[],["loc",[null,[3,4],[3,17]]]],
        ["block","each",[["get","groupedCards",["loc",[null,[5,12],[5,24]]]]],[],0,null,["loc",[null,[5,4],[12,13]]]]
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
      var child0 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 23,
                "column": 16
              },
              "end": {
                "line": 27,
                "column": 16
              }
            },
            "moduleName": "whats-due-cordova/templates/assignments.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
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
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
            return morphs;
          },
          statements: [
            ["inline","assignment-card",[],["assignment",["subexpr","@mut",[["get","assignment",["loc",[null,[25,53],[25,63]]]]],[],[]],"toggleModal","toggleModal","removeAssignment","removeAssignment"],["loc",[null,[25,24],[25,127]]]]
          ],
          locals: ["assignment"],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 12
            },
            "end": {
              "line": 28,
              "column": 12
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
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
          ["content","day.value",["loc",[null,[22,41],[22,54]]]],
          ["block","each",[["get","day.items",["loc",[null,[23,24],[23,33]]]]],[],0,null,["loc",[null,[23,16],[27,25]]]]
        ],
        locals: ["day"],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 29,
              "column": 12
            },
            "end": {
              "line": 33,
              "column": 12
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","in-viewport");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2,"class","fa fa-spinner fa-spin fa-pulse");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
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
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 37,
              "column": 12
            },
            "end": {
              "line": 41,
              "column": 12
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","day-divider");
          var el2 = dom.createTextNode("\n                    Overdue\n                ");
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
    var child3 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 42,
              "column": 12
            },
            "end": {
              "line": 44,
              "column": 12
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
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
          ["inline","assignment-card",[],["assignment",["subexpr","@mut",[["get","assignment",["loc",[null,[43,45],[43,55]]]]],[],[]],"toggleModal","toggleModal","removeAssignment","removeAssignment"],["loc",[null,[43,16],[43,119]]]]
        ],
        locals: ["assignment"],
        templates: []
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 47,
              "column": 4
            },
            "end": {
              "line": 54,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/assignments.hbs"
        },
        isEmpty: false,
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
          ["attribute","class",["concat",["static-content nothing-due ",["get","stuffDue",["loc",[null,[48,49],[48,57]]]]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 55,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/assignments.hbs"
      },
      isEmpty: false,
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
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","due");
        var el4 = dom.createTextNode("\n                What's Due\n            ");
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
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","assignments-due");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","arrow-up");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("<button {{action 'getUpdates'}}>Get Updates</button>");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","assignments-overdue");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","arrow-up");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
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
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [5]);
        var element5 = dom.childAt(element1, [3]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element5, [3]);
        var morphs = new Array(11);
        morphs[0] = dom.createElementMorph(element3);
        morphs[1] = dom.createMorphAt(dom.childAt(element3, [1]),1,1);
        morphs[2] = dom.createElementMorph(element4);
        morphs[3] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        morphs[4] = dom.createAttrMorph(element6, 'class');
        morphs[5] = dom.createMorphAt(element6,5,5);
        morphs[6] = dom.createMorphAt(element6,6,6);
        morphs[7] = dom.createAttrMorph(element7, 'class');
        morphs[8] = dom.createMorphAt(element7,3,3);
        morphs[9] = dom.createMorphAt(element7,4,4);
        morphs[10] = dom.createMorphAt(element1,5,5);
        return morphs;
      },
      statements: [
        ["element","action",["showDue"],[],["loc",[null,[3,12],[3,32]]]],
        ["content","totalDue",["loc",[null,[6,16],[6,28]]]],
        ["element","action",["showOverdue"],[],["loc",[null,[10,13],[10,37]]]],
        ["content","totalOverdue",["loc",[null,[13,16],[13,32]]]],
        ["attribute","class",["concat",[["get","showDue",["loc",[null,[18,43],[18,50]]]]]]],
        ["block","each",[["get","groupedCards",["loc",[null,[21,20],[21,32]]]]],[],0,null,["loc",[null,[21,12],[28,21]]]],
        ["block","infinity-loader",[],["infinityModel",["subexpr","@mut",[["get","model",["loc",[null,[29,45],[29,50]]]]],[],[]],"destroyOnInfinity",true,"developmentMode",false],1,null,["loc",[null,[29,12],[33,32]]]],
        ["attribute","class",["concat",[["get","showOverdue",["loc",[null,[35,47],[35,58]]]]]]],
        ["block","if",[["get","stuffOverdue",["loc",[null,[37,18],[37,30]]]]],[],2,null,["loc",[null,[37,12],[41,19]]]],
        ["block","each",[["get","overdue",["loc",[null,[42,20],[42,27]]]]],[],3,null,["loc",[null,[42,12],[44,21]]]],
        ["block","unless",[["get","stuffDue",["loc",[null,[47,14],[47,22]]]]],[],4,null,["loc",[null,[47,4],[54,15]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
define('whats-due-cordova/templates/completed-assignments', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
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
        var morphs = new Array(11);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createElementMorph(element0);
        morphs[2] = dom.createElementMorph(element1);
        morphs[3] = dom.createAttrMorph(element2, 'id');
        morphs[4] = dom.createAttrMorph(element2, 'class');
        morphs[5] = dom.createElementMorph(element2);
        morphs[6] = dom.createMorphAt(element3,1,1);
        morphs[7] = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        morphs[8] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        morphs[9] = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        morphs[10] = dom.createMorphAt(element2,5,5);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["slider left-box ",["get","assignment.hiding",["loc",[null,[1,30],[1,47]]]]]]],
        ["element","action",["slideOver",["get","assignment",["loc",[null,[1,72],[1,82]]]]],["on","swipe"],["loc",[null,[1,51],[1,95]]]],
        ["element","action",["removeAssignment",["get","assignment",["loc",[null,[2,37],[2,47]]]]],[],["loc",[null,[2,9],[2,49]]]],
        ["attribute","id",["concat",[["get","assignment.id",["loc",[null,[8,50],[8,63]]]]]]],
        ["attribute","class",["concat",["fastAnimate ",["get","assignment.open",["loc",[null,[8,89],[8,104]]]]," ",["get","assignment.urgencyLabel",["loc",[null,[8,109],[8,132]]]]]]],
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
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
          isEmpty: false,
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
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
          isEmpty: false,
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","courses loaded");
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
        ["block","each",[["get","model",["loc",[null,[2,12],[2,17]]]]],[],0,null,["loc",[null,[2,4],[10,13]]]],
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 62,
                "column": 20
              },
              "end": {
                "line": 64,
                "column": 20
              }
            },
            "moduleName": "whats-due-cordova/templates/settings.hbs"
          },
          isEmpty: false,
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 64,
                "column": 20
              },
              "end": {
                "line": 66,
                "column": 20
              }
            },
            "moduleName": "whats-due-cordova/templates/settings.hbs"
          },
          isEmpty: false,
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
            "loc": {
              "source": null,
              "start": {
                "line": 69,
                "column": 12
              },
              "end": {
                "line": 75,
                "column": 12
              }
            },
            "moduleName": "whats-due-cordova/templates/settings.hbs"
          },
          isEmpty: false,
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
            ["inline","input",[],["value",["subexpr","@mut",[["get","model.parent_email",["loc",[null,[73,34],[73,52]]]]],[],[]],"focus-out","save"],["loc",[null,[73,20],[73,72]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.0",
          "loc": {
            "source": null,
            "start": {
              "line": 57,
              "column": 4
            },
            "end": {
              "line": 77,
              "column": 4
            }
          },
          "moduleName": "whats-due-cordova/templates/settings.hbs"
        },
        isEmpty: false,
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
          ["element","action",["toggleAge",["get","model",["loc",[null,[61,43],[61,48]]]]],[],["loc",[null,[61,22],[61,50]]]],
          ["block","if",[["get","model.over12",["loc",[null,[62,26],[62,38]]]]],[],0,1,["loc",[null,[62,20],[66,27]]]],
          ["block","unless",[["get","model.over12",["loc",[null,[69,22],[69,34]]]]],[],2,null,["loc",[null,[69,12],[75,23]]]]
        ],
        locals: [],
        templates: [child0, child1, child2]
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 78,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/settings.hbs"
      },
      isEmpty: false,
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
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","static-content reminders");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n            Daily Notification Time: ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","click-me");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("table");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tr");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("td");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("td");
        var el6 = dom.createTextNode("\n                    Daily reminder at ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" if you have tasks due tomorrow\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("tr");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("td");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("td");
        var el6 = dom.createTextNode("\n                    Notifications about assignment updates in real time (all day)\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
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
        var element5 = dom.childAt(element3, [3]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element2, [7]);
        var element8 = dom.childAt(element2, [9]);
        var element9 = dom.childAt(element8, [1]);
        var element10 = dom.childAt(element8, [3]);
        var morphs = new Array(12);
        morphs[0] = dom.createElementMorph(element4);
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [1]),0,0);
        morphs[2] = dom.createMorphAt(dom.childAt(element6, [1]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element6, [3]),1,1);
        morphs[4] = dom.createMorphAt(dom.childAt(element5, [3, 1]),1,1);
        morphs[5] = dom.createMorphAt(element7,1,1);
        morphs[6] = dom.createMorphAt(element7,3,3);
        morphs[7] = dom.createAttrMorph(element9, 'class');
        morphs[8] = dom.createElementMorph(element9);
        morphs[9] = dom.createAttrMorph(element10, 'class');
        morphs[10] = dom.createElementMorph(element10);
        morphs[11] = dom.createMorphAt(element2,11,11);
        return morphs;
      },
      statements: [
        ["element","action",["datePicker"],[],["loc",[null,[7,11],[7,34]]]],
        ["content","model.displayTime",["loc",[null,[8,60],[8,81]]]],
        ["inline","bs-switch",[],["name","my-bs-switch","btnSize","medium","checked",["subexpr","@mut",[["get","model.notifications",["loc",[null,[15,32],[15,51]]]]],[],[]],"on-switch-change","save"],["loc",[null,[13,20],[17,22]]]],
        ["content","model.displayTime",["loc",[null,[20,38],[20,59]]]],
        ["inline","bs-switch",[],["name","my-bs-switch","btnSize","medium","checked",["subexpr","@mut",[["get","model.notification_updates",["loc",[null,[27,32],[27,58]]]]],[],[]],"on-switch-change","save"],["loc",[null,[25,20],[29,22]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","model.first_name",["loc",[null,[46,22],[46,38]]]]],[],[]],"focus-out","save"],["loc",[null,[46,8],[46,57]]]],
        ["inline","input",[],["value",["subexpr","@mut",[["get","model.last_name",["loc",[null,[47,22],[47,37]]]]],[],[]],"focus-out","save"],["loc",[null,[47,8],[47,56]]]],
        ["attribute","class",["concat",["box square ",["get","studentActive",["loc",[null,[50,68],[50,81]]]]," double"]]],
        ["element","action",["setRole",["get","model",["loc",[null,[50,30],[50,35]]]],"student"],[],["loc",[null,[50,11],[50,47]]]],
        ["attribute","class",["concat",["box square ",["get","parentActive",["loc",[null,[53,67],[53,79]]]]," double"]]],
        ["element","action",["setRole",["get","model",["loc",[null,[53,30],[53,35]]]],"parent"],[],["loc",[null,[53,11],[53,46]]]],
        ["block","unless",[["get","model.isParent",["loc",[null,[57,14],[57,28]]]]],[],0,null,["loc",[null,[57,4],[77,15]]]]
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","support");
        dom.setAttribute(el1,"class","static-content loaded");
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
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
          isEmpty: false,
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
            "topLevel": null,
            "revision": "Ember@2.1.0",
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
          isEmpty: false,
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
          "topLevel": null,
          "revision": "Ember@2.1.0",
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
        isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 33,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/welcome/my-name.hbs"
      },
      isEmpty: false,
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
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element1, [7]);
        var element4 = dom.childAt(element1, [9]);
        var element5 = dom.childAt(element1, [11]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(element2,1,1);
        morphs[1] = dom.createMorphAt(element2,3,3);
        morphs[2] = dom.createMorphAt(element1,5,5);
        morphs[3] = dom.createElementMorph(element3);
        morphs[4] = dom.createMorphAt(element4,3,3);
        morphs[5] = dom.createMorphAt(element4,5,5);
        morphs[6] = dom.createElementMorph(element5);
        return morphs;
      },
      statements: [
        ["inline","input",[],["type","text","placeholder","First Name","class","box double square clear","value",["subexpr","@mut",[["get","model.first_name",["loc",[null,[6,91],[6,107]]]]],[],[]]],["loc",[null,[6,8],[6,109]]]],
        ["inline","input",[],["type","text","placeholder","Last Name","class","box double square clear","value",["subexpr","@mut",[["get","model.last_name",["loc",[null,[8,90],[8,105]]]]],[],[]]],["loc",[null,[8,8],[8,107]]]],
        ["block","unless",[["get","model.isParent",["loc",[null,[11,14],[11,28]]]]],[],0,null,["loc",[null,[11,4],[22,15]]]],
        ["element","action",["setName"],[],["loc",[null,[23,7],[23,27]]]],
        ["inline","external-link",["http://whatsdueapp.com/terms","terms of service"],[],["loc",[null,[28,8],[28,75]]]],
        ["inline","external-link",["http://whatsdueapp.com/privacy-policy","privacy policy"],[],["loc",[null,[29,8],[29,82]]]],
        ["element","action",["transitionPage","welcome.parent-student","WhatsDue"],[],["loc",[null,[32,9],[32,72]]]]
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 20,
            "column": 6
          }
        },
        "moduleName": "whats-due-cordova/templates/welcome/under13.hbs"
      },
      isEmpty: false,
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
        var el2 = dom.createTextNode("\n");
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
        "topLevel": null,
        "revision": "Ember@2.1.0",
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
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","welcome loaded");
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
    assert.ok(false, 'adapters/application.js should pass jshint.\nadapters/application.js: line 9, col 1, Read only.\n\n1 error'); 
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
    assert.ok(false, 'controllers/application.js should pass jshint.\ncontrollers/application.js: line 3, col 1, \'Migration\' is defined but never used.\n\n1 error'); 
  });

});
define('whats-due-cordova/tests/controllers/assignments/due.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/assignments');
  QUnit.test('controllers/assignments/due.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/assignments/due.js should pass jshint.\ncontrollers/assignments/due.js: line 36, col 13, \'controller\' is defined but never used.\ncontrollers/assignments/due.js: line 19, col 9, \'localforage\' is not defined.\ncontrollers/assignments/due.js: line 20, col 13, \'$\' is not defined.\ncontrollers/assignments/due.js: line 31, col 17, \'localforage\' is not defined.\n\n4 errors'); 
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
    assert.ok(true, 'controllers/assignments.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/controllers/completed-assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/completed-assignments.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/completed-assignments.js should pass jshint.\ncontrollers/completed-assignments.js: line 2, col 1, \'CustomFunctions\' is defined but never used.\n\n1 error'); 
  });

});
define('whats-due-cordova/tests/controllers/courses.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/courses.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/courses.js should pass jshint.\ncontrollers/courses.js: line 2, col 1, \'CustomFunctions\' is defined but never used.\ncontrollers/courses.js: line 3, col 1, \'cordovaLoaded\' is defined but never used.\ncontrollers/courses.js: line 4, col 1, \'cordova\' is defined but never used.\n\n3 errors'); 
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
define('whats-due-cordova/tests/router.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('router.js should pass jshint', function(assert) { 
    assert.ok(true, 'router.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/application-error.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/application-error.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/application-error.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('whats-due-cordova/tests/routes/assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/assignments.js should pass jshint', function(assert) { 
    assert.ok(false, 'routes/assignments.js should pass jshint.\nroutes/assignments.js: line 3, col 1, \'CustomFunctions\' is defined but never used.\n\n1 error'); 
  });

});
define('whats-due-cordova/tests/routes/completed-assignments.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/completed-assignments.js should pass jshint', function(assert) { 
    assert.ok(false, 'routes/completed-assignments.js should pass jshint.\nroutes/completed-assignments.js: line 13, col 11, Missing semicolon.\n\n1 error'); 
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
define('whats-due-cordova/tests/utils/group-by.jshint', function () {

  'use strict';

  QUnit.module('JSHint - utils');
  QUnit.test('utils/group-by.js should pass jshint', function(assert) { 
    assert.ok(false, 'utils/group-by.js should pass jshint.\nutils/group-by.js: line 13, col 54, \'instanceMeta\' is defined but never used.\nutils/group-by.js: line 13, col 42, \'changeMeta\' is defined but never used.\nutils/group-by.js: line 33, col 56, \'instanceMeta\' is defined but never used.\nutils/group-by.js: line 33, col 44, \'changeMeta\' is defined but never used.\n\n4 errors'); 
  });

});
define('whats-due-cordova/utils/group-by', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var get = Ember['default'].get,
        arrayComputed = Ember['default'].arrayComputed;

    exports['default'] = function (dependentKey, property) {

        var options = {

            initialValue: [],

            addedItem: function addedItem(array, item, changeMeta, instanceMeta) {

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

            removedItem: function removedItem(array, item, changeMeta, instanceMeta) {

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
  require("whats-due-cordova/app")["default"].create({"name":"whats-due-cordova","version":"0.0.0+935c6167"});
}

/* jshint ignore:end */
//# sourceMappingURL=whats-due-cordova.map