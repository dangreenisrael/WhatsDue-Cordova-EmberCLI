"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('whats-due-cordova/adapters/application', ['exports', 'ember-data', 'whats-due-cordova/config/environment'], function (exports, _emberData, _whatsDueCordovaConfigEnvironment) {
    /* global device*/

    /* Hack for Cordova */

    exports['default'] = _emberData['default'].RESTAdapter.extend({
        host: (function () {
            return _whatsDueCordovaConfigEnvironment['default'].host;
        }).property(),
        namespace: (function () {
            return _whatsDueCordovaConfigEnvironment['default'].namespace;
        }).property(),
        headers: (function () {
            if (_whatsDueCordovaConfigEnvironment['default'].environment === 'development') {
                return { "X-Student-Id": 1 };
                // return {"X-UUID": window.uuid};
            } else if (_whatsDueCordovaConfigEnvironment['default'].environment === 'stage') {
                    return { "X-UUID": device.uuid };
                } else {
                    return { "X-UUID": device.uuid };
                }
        }).property()
    });
});
/**
 * Created by dan on 2014-05-13.
 */
define('whats-due-cordova/adapters/setting', ['exports', 'ember-localforage-adapter/adapters/localforage'], function (exports, _emberLocalforageAdapterAdaptersLocalforage) {
  exports['default'] = _emberLocalforageAdapterAdaptersLocalforage['default'].extend({
    namespace: 'WhatsDue'
  });
});
/**
 * Created by dan on 2014-05-13.
 */
define('whats-due-cordova/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'whats-due-cordova/config/environment'], function (exports, _ember, _emberResolver, _emberLoadInitializers, _whatsDueCordovaConfigEnvironment) {

    var App;
    _ember['default'].MODEL_FACTORY_INJECTIONS = true;

    App = _ember['default'].Application.extend({
        modulePrefix: _whatsDueCordovaConfigEnvironment['default'].modulePrefix,
        Resolver: _emberResolver['default']
    });

    (0, _emberLoadInitializers['default'])(App, _whatsDueCordovaConfigEnvironment['default'].modulePrefix);

    exports['default'] = App;
});
define('whats-due-cordova/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'whats-due-cordova/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _whatsDueCordovaConfigEnvironment) {
  var _config$APP = _whatsDueCordovaConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('whats-due-cordova/components/assignment-card', ['exports', 'ember', 'ember-in-viewport'], function (exports, _ember, _emberInViewport) {
    exports['default'] = _ember['default'].Component.extend(_emberInViewport['default'], {
        open: false,
        didEnterViewport: function didEnterViewport() {
            var assignment = this.get('assignment');
            // if (assignment.get('seen') != true){
            assignment.set('seen', true);
            /* We need the timestamp in seconds for HHVM */
            var timestamp = Math.round(new Date().getTime() / 1000);
            assignment.set('seen_date', timestamp);
            console.log(assignment.get('seen_date'));
            assignment.save();
            // }
        },
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                var controller = this;
                /* Hacks for older mobile devices */
                assignment.set('hiding', 'animateHide');
                setTimeout(function () {
                    controller.sendAction('removeAssignment', assignment);
                    _ember['default'].$(window).scroll();
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
/**
 * Created by Dan on 5/26/15.
 */
define('whats-due-cordova/components/bootstrap-switch', ['exports', 'ember-bootstrap-switch/components/bootstrap-switch'], function (exports, _emberBootstrapSwitchComponentsBootstrapSwitch) {
  exports['default'] = _emberBootstrapSwitchComponentsBootstrapSwitch['default'];
});
define('whats-due-cordova/components/bs-switch', ['exports', 'ember-bootstrap-switch/components/bootstrap-switch'], function (exports, _emberBootstrapSwitchComponentsBootstrapSwitch) {
  exports['default'] = _emberBootstrapSwitchComponentsBootstrapSwitch['default'];
});
define('whats-due-cordova/components/infinity-loader', ['exports', 'ember-infinity/components/infinity-loader'], function (exports, _emberInfinityComponentsInfinityLoader) {
  exports['default'] = _emberInfinityComponentsInfinityLoader['default'];
});
define('whats-due-cordova/components/removeable-card', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Component.extend({
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
/**
 * Created by Dan on 5/26/15.
 */
define('whats-due-cordova/controllers/application', ['exports', 'ember'], function (exports, _ember) {
    /* global CustomFunctions, moment */

    exports['default'] = _ember['default'].Controller.extend({
        init: function init() {
            CustomFunctions.setStore(this);
            var controller = this;
            controller.store.findAll('student').then(function (records) {
                var student = records.get('firstObject');
                if (student.get('first_name') && student.get('last_name')) {
                    controller.transitionToRoute('assignments.due');
                } else {
                    var defaultTime = moment();
                    defaultTime.hours(18);
                    defaultTime.minutes(0);
                    student.set('notification_time_local', defaultTime.format('HHmm'));
                    student.set('notification_time_utc', defaultTime.utcOffset('UTC').format('HHmm'));
                    student.save().then(function () {
                        controller.transitionToRoute('welcome.parent-student');
                    });
                }
            });
            /* Initialize Moment */
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
define('whats-due-cordova/controllers/array', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('whats-due-cordova/controllers/assignments/due', ['exports', 'ember', 'ember-group-by', 'whats-due-cordova/config/environment'], function (exports, _ember, _emberGroupBy, _whatsDueCordovaConfigEnvironment) {
    /* global localforage */

    exports['default'] = _ember['default'].Controller.extend({
        groupedCards: (0, _emberGroupBy['default'])('due', 'daysAway'),
        due: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.[]', 'model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        assignmentsController: _ember['default'].inject.controller('assignments'),
        getUpdates: function getUpdates() {
            var controller = this;
            var baseURL = _whatsDueCordovaConfigEnvironment['default'].host + "/" + _whatsDueCordovaConfigEnvironment['default'].namespace;
            var headers = _whatsDueCordovaConfigEnvironment['default'].APIHeaders;
            localforage.getItem('assignmentTimestamp').then(function (timestamp) {
                _ember['default'].$.ajax({
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
            setInterval(function () {
                _ember['default'].run(this, function () {
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
define('whats-due-cordova/controllers/assignments/over-due', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived')
    });
});
define('whats-due-cordova/controllers/assignments', ['exports', 'ember', 'ember-group-by', 'whats-due-cordova/config/environment'], function (exports, _ember, _emberGroupBy, _whatsDueCordovaConfigEnvironment) {

    /* global device, localforage */
    exports['default'] = _ember['default'].Controller.extend({
        groupedCards: (0, _emberGroupBy['default'])('due', 'daysAway'),
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
            var baseURL = _whatsDueCordovaConfigEnvironment['default'].host + "/" + _whatsDueCordovaConfigEnvironment['default'].namespace;
            var headers = undefined;
            if (_whatsDueCordovaConfigEnvironment['default'].environment === 'development' || _whatsDueCordovaConfigEnvironment['default'].environment === 'wifi') {
                headers = { "X-UUID": "28a60846d242fbe7" };
            } else {
                headers = { "X-UUID": device.uuid };
            }
            localforage.getItem('assignmentTimestamp').then(function (timestamp) {
                _ember['default'].$.ajax({
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
                _ember['default'].run(this, function () {
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
                    window.mixpanel.track('Assignment Completed');
                }, function () {
                    window.mixpanel.track('Assignment Complete Failed');
                });
            }
        }
    });
});
define('whats-due-cordova/controllers/completed-assignments', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        filteredData: (function () {
            return this.get('model').filterBy('completed', true);
        }).property('model.@each.completed')
    });
});
define('whats-due-cordova/controllers/courses', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
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
define('whats-due-cordova/controllers/object', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('whats-due-cordova/controllers/settings', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
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
define('whats-due-cordova/controllers/welcome/my-name', ['exports', 'ember'], function (exports, _ember) {

    /* global CustomFunctions */
    exports['default'] = _ember['default'].Controller.extend({
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
                        this.transitionToRoute('assignments.due');
                    }
                } else {
                    alert('We need your first and last name');
                }
            }
        }
    });
});
define('whats-due-cordova/controllers/welcome/parent-student', ['exports', 'ember'], function (exports, _ember) {
    /* global moment */
    /* global Migration */
    /* global CustomFunctions */
    exports['default'] = _ember['default'].Controller.extend({
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
define('whats-due-cordova/controllers/welcome/under13', ['exports', 'ember'], function (exports, _ember) {
    /* global CustomFunctions */
    exports['default'] = _ember['default'].Controller.extend({
        actions: {
            parentEmail: function parentEmail() {
                var emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                var emailValid = emailRegEx.test(this.get('model').get('parent_email'));
                if (emailValid) {
                    this.get('model').save();
                    this.transitionToRoute('assignments.due');
                    CustomFunctions.setUserProperty('Parent\'s Email', this.get('model').get('parent_email'));
                } else {
                    alert('Double check that email');
                }
            }
        }
    });
});
define("whats-due-cordova/helpers/description-text", ["exports", "ember"], function (exports, _ember) {
    /* global linkifyCordova */

    exports["default"] = _ember["default"].Helper.helper(function (text) {
        if (typeof text === "undefined") {
            return _ember["default"].String.htmlSafe("");
        } else {
            text = _ember["default"].Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            return _ember["default"].String.htmlSafe(linkifyCordova(text));
        }
    });
});
define("whats-due-cordova/helpers/external-link", ["exports", "ember"], function (exports, _ember) {
    exports["default"] = _ember["default"].Helper.helper(function (params) {
        var data = "<a onclick=\"window.open('" + params[0] + "', '_system');\">" + params[1] + "</a>";
        return new _ember["default"].String.htmlSafe(data);
    });
});
define('whats-due-cordova/helpers/fa-icon', ['exports', 'ember-cli-font-awesome/helpers/fa-icon'], function (exports, _emberCliFontAwesomeHelpersFaIcon) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFontAwesomeHelpersFaIcon['default'];
    }
  });
  Object.defineProperty(exports, 'faIcon', {
    enumerable: true,
    get: function get() {
      return _emberCliFontAwesomeHelpersFaIcon.faIcon;
    }
  });
});
define('whats-due-cordova/helpers/icon-device', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Helper.helper(function (name) {
    return new _ember['default'].Handlebars.SafeString('<img src="assets/icons/ios/' + name + '.png"/>');
  });
});
/**
 * Created by Dan on 4/29/15.
 */
define("whats-due-cordova/helpers/linkify-external", ["exports", "ember"], function (exports, _ember) {
    /* global linkifyCordova */

    exports["default"] = _ember["default"].Helper.helper(function (text) {
        return new _ember["default"].Handlebars.SafeString(linkifyCordova(text));
    });
});
define('whats-due-cordova/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'whats-due-cordova/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _whatsDueCordovaConfigEnvironment) {
  var _config$APP = _whatsDueCordovaConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('whats-due-cordova/initializers/cordova-device-ready', ['exports', 'whats-due-cordova/utils/is-on-cordova', 'whats-due-cordova/utils/cordova-stuff', 'whats-due-cordova/config/environment', 'ember'], function (exports, _whatsDueCordovaUtilsIsOnCordova, _whatsDueCordovaUtilsCordovaStuff, _whatsDueCordovaConfigEnvironment, _ember) {
    exports.initialize = initialize;

    /* global PushNotification, device */

    function initialize(App) {
        var studentUrl = _whatsDueCordovaConfigEnvironment['default'].host + "/" + _whatsDueCordovaConfigEnvironment['default'].namespace + "/students";
        App.deferReadiness();
        document.addEventListener('deviceready', function () {
            if (window.cordova) {
                var push = PushNotification.init({
                    android: {
                        senderID: "577888563057", forceShow: true
                    },
                    ios: {
                        alert: true, badge: true, sound: true
                    }
                });
                push.on('registration', function (data) {
                    window.pushId = data.registrationId;
                    var postData = {
                        "uuid": device.uuid,
                        "platform": device.platform,
                        "pushId": window.pushId
                    };
                    _ember['default'].$.ajax({
                        url: studentUrl,
                        type: 'POST',
                        data: postData,
                        success: function success(response) {
                            window.user = response.student;
                            App.advanceReadiness();
                            (0, _whatsDueCordovaUtilsCordovaStuff['default'])();
                        },
                        error: function error(response) {
                            var error = "Problem registering device with server" + window.user.id + response;
                            window.trackJs.track(error);
                        }
                    });
                });
                push.on('error', function () {
                    alert('We need you to allow push notifications for WhatsDue to work');
                    var postData = {
                        "uuid": device.uuid,
                        "platform": "No Push - " + device.platform,
                        "pushId": "No Push"
                    };
                    _ember['default'].$.ajax({
                        url: studentUrl,
                        type: 'POST',
                        data: postData,
                        success: function success(response) {
                            window.user = response.student;
                            App.advanceReadiness();
                            (0, _whatsDueCordovaUtilsCordovaStuff['default'])();
                        },
                        error: function error(response) {
                            console.log(response);
                        }
                    });
                });
            } else {
                console.log('no cordova');
                var postData = {
                    "uuid": Math.random(),
                    "platform": "Dummy Device",
                    "pushId": Math.random()
                };
                window.uuid = postData.uuid;
                _ember['default'].$.ajax({
                    url: studentUrl,
                    type: 'POST',
                    data: postData,
                    success: function success(response) {
                        window.user = response.student;
                        App.advanceReadiness();
                    },
                    error: function error(response) {
                        console.log(response);
                    }
                });
            }
        }, false);
        if (!(0, _whatsDueCordovaUtilsIsOnCordova['default'])()) {
            document.dispatchEvent(new Event('deviceready'));
        }
    }

    exports['default'] = {
        name: 'cordova-device-ready',
        initialize: initialize
    };
});
/**
 * Created by Dan on 09/11/2015.
 */
define('whats-due-cordova/initializers/ember-cli-fastclick', ['exports', 'ember'], function (exports, _ember) {

  var EmberCliFastclickInitializer = {
    name: 'fastclick',

    initialize: function initialize() {
      _ember['default'].run.schedule('afterRender', function () {
        FastClick.attach(document.body);
      });
    }
  };

  exports['default'] = EmberCliFastclickInitializer;
});
define('whats-due-cordova/initializers/export-application-global', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, _ember, _whatsDueCordovaConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_whatsDueCordovaConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var value = _whatsDueCordovaConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_whatsDueCordovaConfigEnvironment['default'].modulePrefix);
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

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('whats-due-cordova/initializers/viewport-config', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, _ember, _whatsDueCordovaConfigEnvironment) {
  exports.initialize = initialize;

  var defaultConfig = {
    viewportSpy: false,
    viewportScrollSensitivity: 1,
    viewportRefreshRate: 100,
    viewportListeners: [{ context: window, event: 'scroll.scrollable' }, { context: window, event: 'resize.resizable' }, { context: document, event: 'touchmove.scrollable' }],
    viewportTolerance: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    }
  };

  var merge = _ember['default'].merge;

  function initialize() {
    var application = arguments[1] || arguments[0];
    var _config$viewportConfig = _whatsDueCordovaConfigEnvironment['default'].viewportConfig;
    var viewportConfig = _config$viewportConfig === undefined ? {} : _config$viewportConfig;

    var mergedConfig = merge(defaultConfig, viewportConfig);

    application.register('config:in-viewport', mergedConfig, { instantiate: false });
  }

  exports['default'] = {
    name: 'viewport-config',
    initialize: initialize
  };
});
define('whats-due-cordova/mixins/network-activity-adapter', ['exports', 'ember-cli-cordova-shims/mixins/network-activity-adapter'], function (exports, _emberCliCordovaShimsMixinsNetworkActivityAdapter) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliCordovaShimsMixinsNetworkActivityAdapter['default'];
    }
  });
});
define('whats-due-cordova/models/assignment', ['exports', 'ember-data'], function (exports, _emberData) {
    /* global moment */

    var Assignment = _emberData['default'].Model.extend({
        assignment_name: _emberData['default'].attr('string'),
        description: _emberData['default'].attr('string', { defaultValue: " " }),
        created_at: _emberData['default'].attr('number'),
        due_date: _emberData['default'].attr('string'),
        last_modified: _emberData['default'].attr('number'),
        archived: _emberData['default'].attr('boolean'),
        time_visible: _emberData['default'].attr('boolean', { defaultValue: true }),
        completed_date: _emberData['default'].attr('number', { defaultValue: null }),
        completed: _emberData['default'].attr('boolean', { defaultValue: false }),
        seen_date: _emberData['default'].attr('number', { defaultValue: null }),
        seen: _emberData['default'].attr('boolean', { defaultValue: false }),
        course_id: _emberData['default'].belongsTo('course', { async: true }),
        hiding: _emberData['default'].attr('string', { defaultValue: null }),
        open: _emberData['default'].attr('string', { defaultValue: null }),
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
define('whats-due-cordova/models/course', ['exports', 'ember-data'], function (exports, _emberData) {

    var Course = _emberData['default'].Model.extend({
        course_name: _emberData['default'].attr('string'),
        course_code: _emberData['default'].attr('string'),
        instructor_name: _emberData['default'].attr('string'),
        admin_id: _emberData['default'].attr('string'),
        last_modified: _emberData['default'].attr('number'),
        created_at: _emberData['default'].attr('number'),
        school_name: _emberData['default'].attr('string', { defaultValue: "IDC Herzliya" }),
        enrolled: _emberData['default'].attr('boolean', { defaultValue: true }),
        archived: _emberData['default'].attr('boolean', { defaultValue: false }),
        error: _emberData['default'].attr('string', { defaultValue: null }),
        assignments: _emberData['default'].hasMany('assignment'),
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
define('whats-due-cordova/models/message', ['exports', 'ember-data'], function (exports, _emberData) {
    /* global moment */

    var Message = _emberData['default'].Model.extend({
        username: _emberData['default'].attr('string'),
        body: _emberData['default'].attr('string'),
        updated_at: _emberData['default'].attr('number'),
        course_id: _emberData['default'].belongsTo('course', { async: true }),
        date: (function () {
            return moment(this.get('updated_at'), "X").format('MMM Do, hh:mm A');
        }).property('updated_at')
    });

    exports['default'] = Message;
});
define('whats-due-cordova/models/setting', ['exports', 'ember-data'], function (exports, _emberData) {

  var Setting = _emberData['default'].Model.extend({
    value: _emberData['default'].attr('string', { defaultValue: null })
  });

  exports['default'] = Setting;
});
/**
 * Created by Dan on 5/11/15.
 */

/* Settings */
define('whats-due-cordova/models/student', ['exports', 'ember-data'], function (exports, _emberData) {
    exports['default'] = _emberData['default'].Model.extend({
        notifications: _emberData['default'].attr('boolean'),
        notification_updates: _emberData['default'].attr('boolean'),
        notification_time_utc: _emberData['default'].attr('string'),
        notification_time_local: _emberData['default'].attr('string'),
        first_name: _emberData['default'].attr('string'),
        last_name: _emberData['default'].attr('string'),
        role: _emberData['default'].attr('string'),
        over12: _emberData['default'].attr('boolean'),
        parent_email: _emberData['default'].attr('string'),
        signup_date: _emberData['default'].attr('string'),
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
/**
 * Created by Dan on 5/11/15.
 */

/* global moment*/
define('whats-due-cordova/router', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, _ember, _whatsDueCordovaConfigEnvironment) {

    var Router = _ember['default'].Router.extend({
        location: _whatsDueCordovaConfigEnvironment['default'].locationType
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
        this.route('blankRoute');
    });

    exports['default'] = Router;
});
define('whats-due-cordova/routes/application-error', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, _ember, _whatsDueCordovaConfigEnvironment) {
    exports['default'] = _ember['default'].Route.extend({
        init: function init() {
            var route = this;
            window.mixpanel.track('Error Page Shown');
            var timeout = function timeout() {
                setTimeout(function () {
                    var onSuccess = function onSuccess() {
                        route.transitionTo('assignments');
                    };
                    var onFail = function onFail() {
                        timeout();
                    };
                    _ember['default'].$.get(_whatsDueCordovaConfigEnvironment['default'].host + "/" + _whatsDueCordovaConfigEnvironment['default'].namespace + "/test/connection").done(onSuccess).fail(onFail);
                }, 500);
            };
            timeout();
        }
    });
});
define('whats-due-cordova/routes/application', ['exports', 'ember', 'whats-due-cordova/config/environment'], function (exports, _ember, _whatsDueCordovaConfigEnvironment) {
    exports['default'] = _ember['default'].Route.extend({
        initializeUser: (function () {
            if (_whatsDueCordovaConfigEnvironment['default'].environment === 'development') {
                /* jshint ignore:start */
                (function (e, b) {
                    if (!b.__SV) {
                        var a, f, i, g;window.mixpanel = b;b._i = [];b.init = function (a, e, d) {
                            function f(b, h) {
                                var a = h.split(".");2 == a.length && (b = b[a[0]], h = a[1]);b[h] = function () {
                                    b.push([h].concat(Array.prototype.slice.call(arguments, 0)));
                                };
                            }var c = b;"undefined" !== typeof d ? c = b[d] = [] : d = "mixpanel";c.people = c.people || [];c.toString = function (b) {
                                var a = "mixpanel";"mixpanel" !== d && (a += "." + d);b || (a += " (stub)");return a;
                            };c.people.toString = function () {
                                return c.toString(1) + ".people (stub)";
                            };i = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for (g = 0; g < i.length; g++) f(c, i[g]);b._i.push([a, e, d]);
                        };b.__SV = 1.2;a = e.createElement("script");a.type = "text/javascript";a.async = !0;a.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";f = e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a, f);
                    }
                })(document, window.mixpanel || []);
                window.mixpanel.init("38749de545164d92aac16ff263eb5898");
                /* jshint ignore:end */
            }
        }).on('init'),
        actions: {
            addCourse: function addCourse(course_code) {
                var route = this;
                var updateModel = function updateModel() {
                    route.transitionTo('blankRoute').then(function () {
                        route.transitionTo('assignments.due');
                    });
                };
                course_code = course_code.toUpperCase();
                this.store.createRecord('course', {
                    course_code: course_code,
                    course_name: "Joining Course ..."
                }).save().then(function (record) {
                    var error = record.get('error');
                    if (error) {
                        record.unloadRecord();
                        route.errorMessage(error);
                        window.mixpanel.track('Course not Added', { reason: error });
                    } else {
                        window.mixpanel.track("Course Added");
                        var courseName = record.get('course_name');
                        updateModel();
                        if (window.cordova) {
                            navigator.notification.alert("All of your tasks will appear here. \n\n When you finish a task, just tap on it and mark it as done!", function () {}, "You just joined " + courseName, "Got It");
                        }
                    }
                })['catch'](function (error) {
                    console.log(error);
                    route.errorMessage("Are you connected to the internet?");
                    window.mixpanel.track("Course Not Added", { reason: "unknown" });
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
            },
            errorMessage: function errorMessage(message) {
                alert(message);
            }
        },
        errorMessage: function errorMessage(message) {
            alert(message);
        }
    });
});
define("whats-due-cordova/routes/assignments", ["exports", "ember", "ember-infinity/mixins/route"], function (exports, _ember, _emberInfinityMixinsRoute) {
    /* global localforage */

    exports["default"] = _ember["default"].Route.extend(_emberInfinityMixinsRoute["default"], {
        model: function model() {
            return this.infinityModel("assignment", { perPage: 10, startingPage: 1 }).then(function (data) {
                localforage.setItem('assignmentTimestamp', data.get('meta').timestamp);
                return data;
            });
        },
        afterModel: function afterModel() {
            this.controllerFor('application').set('loading', null);
            if (window.cordova) {
                window.initializeBranch();
            }
        },
        beforeModel: function beforeModel() {
            this.controllerFor('application').set('loading', 'loading');
        },
        willDestroy: function willDestroy() {
            if (window.cordova) {
                window.branch.logout();
            }
        }
    });
});
define('whats-due-cordova/routes/completed-assignments', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
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
define('whats-due-cordova/routes/courses', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
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
define('whats-due-cordova/routes/messages', ['exports', 'ember'], function (exports, _ember) {

    var MessagesRoute = _ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('message');
        }
    });

    exports['default'] = MessagesRoute;
});
define('whats-due-cordova/routes/settings', ['exports', 'ember'], function (exports, _ember) {

    /* global moment*/
    /* global datePicker */
    /* global CustomFunctions */

    exports['default'] = _ember['default'].Route.extend({
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
define('whats-due-cordova/routes/welcome/my-name', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('student').then(function (records) {
                return records.get('firstObject');
            });
        }
    });
});
define('whats-due-cordova/routes/welcome/parent-student', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('whats-due-cordova/routes/welcome/under13', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('student').then(function (records) {
                return records.get('firstObject');
            });
        }
    });
});
define('whats-due-cordova/routes/welcome', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        renderTemplate: function renderTemplate() {
            this.render({ outlet: 'welcome' });
        }
    });
});
/**
 * Created by Dan on 7/22/15.
 */
define('whats-due-cordova/services/dialogs', ['exports', 'ember-cli-cordova-shims/services/dialogs'], function (exports, _emberCliCordovaShimsServicesDialogs) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliCordovaShimsServicesDialogs['default'];
    }
  });
});
define('whats-due-cordova/services/notifications', ['exports', 'ember-cli-cordova-shims/services/notifications'], function (exports, _emberCliCordovaShimsServicesNotifications) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliCordovaShimsServicesNotifications['default'];
    }
  });
});
define("whats-due-cordova/templates/application-error", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "application-error");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "inner");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.setAttribute(el3, "class", "main-logo");
        dom.setAttribute(el3, "src", "assets/img/logo-text.png");
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
        dom.setAttribute(el3, "class", "cloud");
        dom.setAttribute(el3, "src", "assets/img/clouds.png");
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
      statements: [["element", "action", ["checkConnection"], [], ["loc", [null, [7, 13], [7, 41]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "appHeader");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2, "class", "pull-left");
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
        dom.setAttribute(el2, "class", "pull-right hidden");
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
        dom.setAttribute(el2, "id", "page-title");
        var el3 = dom.createTextNode("\n        WhatsDue\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "content");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "id", "menu");
        dom.setAttribute(el2, "class", "menuAnimate");
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
        dom.setAttribute(el2, "id", "main");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3, "class", "fa fa-spinner fa-pulse");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "content");
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
        dom.setAttribute(el1, "class", "hidden");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "id", "addCourseProgrammatically");
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
        var morphs = new Array(20);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
        morphs[3] = dom.createAttrMorph(element1, 'class');
        morphs[4] = dom.createElementMorph(element2);
        morphs[5] = dom.createElementMorph(element3);
        morphs[6] = dom.createMorphAt(dom.childAt(element3, [1]), 1, 1);
        morphs[7] = dom.createElementMorph(element4);
        morphs[8] = dom.createMorphAt(dom.childAt(element4, [1]), 1, 1);
        morphs[9] = dom.createElementMorph(element5);
        morphs[10] = dom.createMorphAt(dom.childAt(element5, [1]), 1, 1);
        morphs[11] = dom.createElementMorph(element6);
        morphs[12] = dom.createMorphAt(dom.childAt(element6, [1]), 1, 1);
        morphs[13] = dom.createElementMorph(element7);
        morphs[14] = dom.createMorphAt(dom.childAt(element7, [1]), 1, 1);
        morphs[15] = dom.createAttrMorph(element8, 'class');
        morphs[16] = dom.createMorphAt(dom.childAt(element8, [3]), 1, 1);
        morphs[17] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[18] = dom.createElementMorph(element9);
        morphs[19] = dom.createMorphAt(element9, 1, 1);
        return morphs;
      },
      statements: [["element", "action", ["menuToggle"], [], ["loc", [null, [1, 23], [1, 46]]]], ["inline", "icon-device", ["menu"], [], ["loc", [null, [3, 8], [3, 30]]]], ["inline", "icon-device", ["menu"], [], ["loc", [null, [6, 8], [6, 30]]]], ["attribute", "class", ["concat", [["get", "menuOpen", ["loc", [null, [12, 27], [12, 35]]]]]]], ["element", "action", ["menuToggle"], [], ["loc", [null, [14, 12], [14, 35]]]], ["element", "action", ["transitionPage", "assignments.due", "Assignments"], [], ["loc", [null, [15, 16], [15, 75]]]], ["inline", "icon-device", ["assignments"], [], ["loc", [null, [17, 20], [17, 49]]]], ["element", "action", ["transitionPage", "completedAssignments", "Completed"], [], ["loc", [null, [24, 16], [24, 78]]]], ["inline", "icon-device", ["completed"], [], ["loc", [null, [26, 20], [26, 47]]]], ["element", "action", ["transitionPage", "courses", "My Courses"], [], ["loc", [null, [32, 16], [32, 66]]]], ["inline", "icon-device", ["courses"], [], ["loc", [null, [34, 20], [34, 45]]]], ["element", "action", ["transitionPage", "settings", "Settings"], [], ["loc", [null, [40, 16], [40, 65]]]], ["inline", "icon-device", ["reminders"], [], ["loc", [null, [43, 20], [43, 47]]]], ["element", "action", ["transitionPage", "support", "Support"], [], ["loc", [null, [49, 15], [49, 62]]]], ["inline", "icon-device", ["info"], [], ["loc", [null, [51, 20], [51, 42]]]], ["attribute", "class", ["concat", [["get", "loading", ["loc", [null, [59, 28], [59, 35]]]]]]], ["content", "outlet", ["loc", [null, [62, 12], [62, 22]]]], ["inline", "outlet", ["welcome"], [], ["loc", [null, [66, 0], [66, 20]]]], ["element", "action", ["addCourse", ["get", "courseCodeForBranch", ["loc", [null, [70, 61], [70, 80]]]]], [], ["loc", [null, [70, 40], [70, 82]]]], ["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "courseCodeForBranch", ["loc", [null, [71, 22], [71, 41]]]]], [], []]], ["loc", [null, [71, 8], [71, 43]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/assignments/due", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
            return morphs;
          },
          statements: [["inline", "assignment-card", [], ["assignment", ["subexpr", "@mut", [["get", "assignment", ["loc", [null, [9, 49], [9, 59]]]]], [], []], "toggleModal", "toggleModal", "removeAssignment", "removeAssignment"], ["loc", [null, [9, 20], [9, 123]]]]],
          locals: ["assignment"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          dom.setAttribute(el1, "class", "day-divider");
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
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["content", "day.value", ["loc", [null, [6, 33], [6, 46]]]], ["block", "each", [["get", "day.items", ["loc", [null, [7, 20], [7, 29]]]]], [], 0, null, ["loc", [null, [7, 12], [11, 21]]]]],
        locals: ["day"],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "assignments-due");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "arrow-up");
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
        morphs[0] = dom.createMorphAt(element0, 3, 3);
        morphs[1] = dom.createMorphAt(element0, 7, 7);
        return morphs;
      },
      statements: [["inline", "log", [["get", "route", ["loc", [null, [3, 10], [3, 15]]]]], [], ["loc", [null, [3, 4], [3, 17]]]], ["block", "each", [["get", "groupedCards", ["loc", [null, [5, 12], [5, 24]]]]], [], 0, null, ["loc", [null, [5, 4], [12, 13]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("whats-due-cordova/templates/assignments/over-due", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "assignment-card", [], ["assignment", ["subexpr", "@mut", [["get", "assignment", ["loc", [null, [7, 37], [7, 47]]]]], [], []], "toggleModal", "toggleModal", "removeAssignment", "removeAssignment"], ["loc", [null, [7, 8], [7, 111]]]]],
        locals: ["assignment"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "assignments-overdue");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "arrow-up");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "day-divider");
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
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 5, 5);
        return morphs;
      },
      statements: [["block", "each", [["get", "overdue", ["loc", [null, [6, 12], [6, 19]]]]], [], 0, null, ["loc", [null, [6, 4], [8, 13]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("whats-due-cordova/templates/assignments", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
            "loc": {
              "source": null,
              "start": {
                "line": 22,
                "column": 16
              },
              "end": {
                "line": 26,
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
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
            return morphs;
          },
          statements: [["inline", "assignment-card", [], ["assignment", ["subexpr", "@mut", [["get", "assignment", ["loc", [null, [24, 53], [24, 63]]]]], [], []], "toggleModal", "toggleModal", "removeAssignment", "removeAssignment"], ["loc", [null, [24, 24], [24, 127]]]]],
          locals: ["assignment"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
          "loc": {
            "source": null,
            "start": {
              "line": 20,
              "column": 12
            },
            "end": {
              "line": 27,
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
          dom.setAttribute(el1, "class", "day-divider");
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
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["content", "day.value", ["loc", [null, [21, 41], [21, 54]]]], ["block", "each", [["get", "day.items", ["loc", [null, [22, 24], [22, 33]]]]], [], 0, null, ["loc", [null, [22, 16], [26, 25]]]]],
        locals: ["day"],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
          "loc": {
            "source": null,
            "start": {
              "line": 28,
              "column": 12
            },
            "end": {
              "line": 32,
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
          dom.setAttribute(el1, "class", "in-viewport");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2, "class", "fa fa-spinner fa-spin fa-pulse");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
          "loc": {
            "source": null,
            "start": {
              "line": 36,
              "column": 12
            },
            "end": {
              "line": 40,
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
          dom.setAttribute(el1, "class", "day-divider");
          var el2 = dom.createTextNode("\n                    Overdue\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
          "loc": {
            "source": null,
            "start": {
              "line": 41,
              "column": 12
            },
            "end": {
              "line": 43,
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
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "assignment-card", [], ["assignment", ["subexpr", "@mut", [["get", "assignment", ["loc", [null, [42, 45], [42, 55]]]]], [], []], "toggleModal", "toggleModal", "removeAssignment", "removeAssignment"], ["loc", [null, [42, 16], [42, 119]]]]],
        locals: ["assignment"],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
          "loc": {
            "source": null,
            "start": {
              "line": 46,
              "column": 4
            },
            "end": {
              "line": 53,
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
          dom.setAttribute(el2, "src", "assets/img/thumbs-up.png");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h2");
          dom.setAttribute(el2, "class", "centered");
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
        statements: [["attribute", "class", ["concat", ["static-content nothing-due ", ["get", "stuffDue", ["loc", [null, [47, 49], [47, 57]]]]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 54,
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
        dom.setAttribute(el1, "id", "newAssignments");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "due");
        var el4 = dom.createTextNode("\n                Upcoming\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "badge square black");
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
        dom.setAttribute(el3, "class", "vertical-separator white");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "overdue");
        var el4 = dom.createTextNode("\n            Overdue\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "badge square black");
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
        dom.setAttribute(el3, "id", "assignments-due");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "arrow-up");
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
        dom.setAttribute(el3, "id", "assignments-overdue");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "arrow-up");
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
        morphs[1] = dom.createMorphAt(dom.childAt(element3, [1]), 1, 1);
        morphs[2] = dom.createElementMorph(element4);
        morphs[3] = dom.createMorphAt(dom.childAt(element4, [1]), 1, 1);
        morphs[4] = dom.createAttrMorph(element6, 'class');
        morphs[5] = dom.createMorphAt(element6, 3, 3);
        morphs[6] = dom.createMorphAt(element6, 4, 4);
        morphs[7] = dom.createAttrMorph(element7, 'class');
        morphs[8] = dom.createMorphAt(element7, 3, 3);
        morphs[9] = dom.createMorphAt(element7, 4, 4);
        morphs[10] = dom.createMorphAt(element1, 5, 5);
        return morphs;
      },
      statements: [["element", "action", ["showDue"], [], ["loc", [null, [3, 12], [3, 32]]]], ["content", "totalDue", ["loc", [null, [6, 16], [6, 28]]]], ["element", "action", ["showOverdue"], [], ["loc", [null, [10, 13], [10, 37]]]], ["content", "totalOverdue", ["loc", [null, [13, 16], [13, 32]]]], ["attribute", "class", ["concat", [["get", "showDue", ["loc", [null, [18, 43], [18, 50]]]]]]], ["block", "each", [["get", "groupedCards", ["loc", [null, [20, 20], [20, 32]]]]], [], 0, null, ["loc", [null, [20, 12], [27, 21]]]], ["block", "infinity-loader", [], ["infinityModel", ["subexpr", "@mut", [["get", "model", ["loc", [null, [28, 45], [28, 50]]]]], [], []], "destroyOnInfinity", true, "developmentMode", false], 1, null, ["loc", [null, [28, 12], [32, 32]]]], ["attribute", "class", ["concat", [["get", "showOverdue", ["loc", [null, [34, 47], [34, 58]]]]]]], ["block", "if", [["get", "stuffOverdue", ["loc", [null, [36, 18], [36, 30]]]]], [], 2, null, ["loc", [null, [36, 12], [40, 19]]]], ["block", "each", [["get", "overdue", ["loc", [null, [41, 20], [41, 27]]]]], [], 3, null, ["loc", [null, [41, 12], [43, 21]]]], ["block", "unless", [["get", "stuffDue", ["loc", [null, [46, 14], [46, 22]]]]], [], 4, null, ["loc", [null, [46, 4], [53, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  })());
});
define("whats-due-cordova/templates/completed-assignments", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "removeable-card", [], ["item", ["subexpr", "@mut", [["get", "assignment", ["loc", [null, [5, 21], [5, 31]]]]], [], []], "title", ["subexpr", "@mut", [["get", "assignment.assignment_name", ["loc", [null, [6, 22], [6, 48]]]]], [], []], "text", ["subexpr", "@mut", [["get", "assignment.course_id.course_name", ["loc", [null, [7, 21], [7, 53]]]]], [], []], "icon", "back", "remove", "unRemoveAssignment"], ["loc", [null, [4, 12], [10, 14]]]]],
        locals: ["assignment"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "completedAssignments");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "assignments-list");
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
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "filteredData", ["loc", [null, [3, 16], [3, 28]]]]], [], 0, null, ["loc", [null, [3, 8], [11, 17]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("whats-due-cordova/templates/components/assignment-card", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          dom.setAttribute(el1, "class", "from-now");
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
          dom.setAttribute(el1, "class", "time-due");
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
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
          return morphs;
        },
        statements: [["content", "assignment.fromNow", ["loc", [null, [12, 16], [12, 38]]]], ["content", "assignment.timeDue", ["loc", [null, [15, 16], [15, 38]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          dom.setAttribute(el1, "class", "time-due");
          var el2 = dom.createTextNode("\n                    Morning\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "modifiers",
          "modifiers": ["action"]
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el2, "class", "reveal");
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
        dom.setAttribute(el3, "class", "time");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "course");
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
        dom.setAttribute(el3, "class", "info");
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "title");
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
        dom.setAttribute(el4, "class", "description");
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
        morphs[6] = dom.createMorphAt(element3, 1, 1);
        morphs[7] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        morphs[8] = dom.createMorphAt(dom.childAt(element4, [1]), 1, 1);
        morphs[9] = dom.createMorphAt(dom.childAt(element4, [3]), 1, 1);
        morphs[10] = dom.createMorphAt(element2, 5, 5);
        return morphs;
      },
      statements: [["attribute", "class", ["concat", ["slider left-box ", ["get", "assignment.hiding", ["loc", [null, [1, 30], [1, 47]]]]]]], ["element", "action", ["slideOver", ["get", "assignment", ["loc", [null, [1, 72], [1, 82]]]]], ["on", "swipe"], ["loc", [null, [1, 51], [1, 95]]]], ["element", "action", ["removeAssignment", ["get", "assignment", ["loc", [null, [2, 37], [2, 47]]]]], [], ["loc", [null, [2, 9], [2, 49]]]], ["attribute", "id", ["concat", [["get", "assignment.id", ["loc", [null, [8, 50], [8, 63]]]]]]], ["attribute", "class", ["concat", ["fastAnimate ", ["get", "assignment.open", ["loc", [null, [8, 89], [8, 104]]]], " ", ["get", "assignment.urgencyLabel", ["loc", [null, [8, 109], [8, 132]]]]]]], ["element", "action", ["slideOver", ["get", "assignment", ["loc", [null, [8, 30], [8, 40]]]]], [], ["loc", [null, [8, 9], [8, 43]]]], ["block", "if", [["get", "assignment.time_visible", ["loc", [null, [10, 18], [10, 41]]]]], [], 0, 1, ["loc", [null, [10, 12], [21, 19]]]], ["content", "assignment.course_id.course_name", ["loc", [null, [23, 16], [23, 54]]]], ["content", "assignment.assignment_name", ["loc", [null, [29, 16], [29, 46]]]], ["inline", "description-text", [["get", "assignment.description", ["loc", [null, [32, 35], [32, 57]]]]], [], ["loc", [null, [32, 16], [32, 59]]]], ["inline", "input", [], ["class", "date-due", "type", "hidden", "value", ["subexpr", "@mut", [["get", "assignment.daysAway", ["loc", [null, [36, 53], [36, 72]]]]], [], []]], ["loc", [null, [36, 8], [36, 74]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("whats-due-cordova/templates/components/in-viewport", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "class", "in-viewport");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("i");
        dom.setAttribute(el2, "class", "fa fa-refresh fa-spin");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/components/infinity-loader", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": {
            "name": "missing-wrapper",
            "problems": ["wrong-type"]
          },
          "revision": "Ember@2.2.0",
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
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "yield", ["loc", [null, [2, 2], [2, 11]]]]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "loadedText", ["loc", [null, [5, 10], [5, 24]]]]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
            return morphs;
          },
          statements: [["content", "loadingText", ["loc", [null, [7, 10], [7, 25]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "infinityModel.reachedInfinity", ["loc", [null, [4, 8], [4, 37]]]]], [], 0, 1, ["loc", [null, [4, 2], [8, 9]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.2.0",
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
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "hasBlock", ["loc", [null, [1, 6], [1, 14]]]]], [], 0, 1, ["loc", [null, [1, 0], [9, 7]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("whats-due-cordova/templates/components/removeable-card", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "class", "removeable-card");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "reveal");
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
        dom.setAttribute(el2, "class", "putBackable fastAnimate");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "info");
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
        dom.setAttribute(el4, "class", "courseName");
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
        dom.setAttribute(el4, "class", "instructorName");
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
        morphs[1] = dom.createMorphAt(element1, 1, 1);
        morphs[2] = dom.createElementMorph(element2);
        morphs[3] = dom.createElementMorph(element4);
        morphs[4] = dom.createMorphAt(element4, 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        morphs[6] = dom.createMorphAt(dom.childAt(element3, [5]), 1, 1);
        return morphs;
      },
      statements: [["element", "action", ["remove", ["get", "item", ["loc", [null, [3, 32], [3, 36]]]]], [], ["loc", [null, [3, 14], [3, 39]]]], ["inline", "icon-device", [["get", "icon", ["loc", [null, [4, 26], [4, 30]]]]], [], ["loc", [null, [4, 12], [4, 32]]]], ["element", "action", ["slideBack"], [], ["loc", [null, [7, 41], [7, 63]]]], ["element", "action", ["slideOver"], [], ["loc", [null, [9, 18], [9, 40]]]], ["inline", "icon-device", ["minus-red"], [], ["loc", [null, [10, 16], [10, 43]]]], ["content", "title", ["loc", [null, [14, 16], [14, 25]]]], ["content", "text", ["loc", [null, [18, 16], [18, 24]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/courses", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "removeable-card", [], ["item", ["subexpr", "@mut", [["get", "course", ["loc", [null, [4, 17], [4, 23]]]]], [], []], "title", ["subexpr", "@mut", [["get", "course.course_name", ["loc", [null, [5, 18], [5, 36]]]]], [], []], "text", ["subexpr", "@mut", [["get", "course.instructor_name", ["loc", [null, [6, 17], [6, 39]]]]], [], []], "icon", "X", "remove", "removeCourse"], ["loc", [null, [3, 8], [9, 10]]]]],
        locals: ["course"],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 4
            },
            "end": {
              "line": 20,
              "column": 4
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
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1, "class", "triangle-isosceles topleft bubble");
          var el2 = dom.createTextNode("\n        Enter your unique class code to join");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("br");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        If you don't have one, ask your teacher\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        "moduleName": "whats-due-cordova/templates/courses.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "courses loaded");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "id", "addCourse");
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
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createAttrMorph(element2, 'class');
        morphs[2] = dom.createElementMorph(element2);
        morphs[3] = dom.createMorphAt(element1, 3, 3);
        morphs[4] = dom.createMorphAt(element0, 5, 5);
        return morphs;
      },
      statements: [["block", "each", [["get", "model", ["loc", [null, [2, 12], [2, 17]]]]], [], 0, null, ["loc", [null, [2, 4], [10, 13]]]], ["attribute", "class", ["concat", [["get", "disabled", ["loc", [null, [12, 61], [12, 69]]]], " fastAnimate"]]], ["element", "action", ["addCourse", ["get", "course_code", ["loc", [null, [12, 37], [12, 48]]]]], [], ["loc", [null, [12, 16], [12, 50]]]], ["inline", "input", [], ["type", "text", "value", ["subexpr", "@mut", [["get", "course_code", ["loc", [null, [13, 34], [13, 45]]]]], [], []], "maxlength", "6", "placeholder", "Course Code", "class", "search", "autocomplete", "off", "autocorrect", "off", "autocapitalize", "off", "spellcheck", "false"], ["loc", [null, [13, 8], [13, 181]]]], ["block", "unless", [["get", "model", ["loc", [null, [15, 14], [15, 19]]]]], [], 1, null, ["loc", [null, [15, 4], [20, 15]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("whats-due-cordova/templates/messages", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          dom.setAttribute(el1, "class", "message");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("header");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3, "class", "pull-left");
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
          dom.setAttribute(el3, "class", "pull-right");
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
          morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [3]), 1, 1);
          return morphs;
        },
        statements: [["content", "message.course_id.course_name", ["loc", [null, [6, 20], [6, 53]]]], ["content", "message.date", ["loc", [null, [9, 20], [9, 36]]]], ["content", "message.body", ["loc", [null, [13, 16], [13, 32]]]]],
        locals: ["message"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "messages");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "model", ["loc", [null, [2, 12], [2, 17]]]]], [], 0, null, ["loc", [null, [2, 4], [16, 13]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("whats-due-cordova/templates/settings", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            dom.setAttribute(el1, "src", "assets/img/checked-black-blue.png");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            dom.setAttribute(el1, "src", "assets/img/unchecked-black.png");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child2 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 5, 5);
            return morphs;
          },
          statements: [["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "model.parent_email", ["loc", [null, [73, 34], [73, 52]]]]], [], []], "focus-out", "save"], ["loc", [null, [73, 20], [73, 72]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          dom.setAttribute(el1, "class", "over13 static-content");
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
          morphs[1] = dom.createMorphAt(element1, 1, 1);
          morphs[2] = dom.createMorphAt(element0, 3, 3);
          return morphs;
        },
        statements: [["element", "action", ["toggleAge", ["get", "model", ["loc", [null, [61, 43], [61, 48]]]]], [], ["loc", [null, [61, 22], [61, 50]]]], ["block", "if", [["get", "model.over12", ["loc", [null, [62, 26], [62, 38]]]]], [], 0, 1, ["loc", [null, [62, 20], [66, 27]]]], ["block", "unless", [["get", "model.over12", ["loc", [null, [69, 22], [69, 34]]]]], [], 2, null, ["loc", [null, [69, 12], [75, 23]]]]],
        locals: [],
        templates: [child0, child1, child2]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "settings");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n        Reminders\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "static-content reminders");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n            Daily Notification Time: ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "click-me");
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
        dom.setAttribute(el2, "class", "static-content");
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
        dom.setAttribute(el2, "class", "buttons");
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
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [1]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element6, [1]), 1, 1);
        morphs[3] = dom.createMorphAt(dom.childAt(element6, [3]), 1, 1);
        morphs[4] = dom.createMorphAt(dom.childAt(element5, [3, 1]), 1, 1);
        morphs[5] = dom.createMorphAt(element7, 1, 1);
        morphs[6] = dom.createMorphAt(element7, 3, 3);
        morphs[7] = dom.createAttrMorph(element9, 'class');
        morphs[8] = dom.createElementMorph(element9);
        morphs[9] = dom.createAttrMorph(element10, 'class');
        morphs[10] = dom.createElementMorph(element10);
        morphs[11] = dom.createMorphAt(element2, 11, 11);
        return morphs;
      },
      statements: [["element", "action", ["datePicker"], [], ["loc", [null, [7, 11], [7, 34]]]], ["content", "model.displayTime", ["loc", [null, [8, 60], [8, 81]]]], ["inline", "bs-switch", [], ["name", "my-bs-switch", "btnSize", "medium", "checked", ["subexpr", "@mut", [["get", "model.notifications", ["loc", [null, [15, 32], [15, 51]]]]], [], []], "on-switch-change", "save"], ["loc", [null, [13, 20], [17, 22]]]], ["content", "model.displayTime", ["loc", [null, [20, 38], [20, 59]]]], ["inline", "bs-switch", [], ["name", "my-bs-switch", "btnSize", "medium", "checked", ["subexpr", "@mut", [["get", "model.notification_updates", ["loc", [null, [27, 32], [27, 58]]]]], [], []], "on-switch-change", "save"], ["loc", [null, [25, 20], [29, 22]]]], ["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "model.first_name", ["loc", [null, [46, 22], [46, 38]]]]], [], []], "focus-out", "save"], ["loc", [null, [46, 8], [46, 57]]]], ["inline", "input", [], ["value", ["subexpr", "@mut", [["get", "model.last_name", ["loc", [null, [47, 22], [47, 37]]]]], [], []], "focus-out", "save"], ["loc", [null, [47, 8], [47, 56]]]], ["attribute", "class", ["concat", ["box square ", ["get", "studentActive", ["loc", [null, [50, 68], [50, 81]]]], " double"]]], ["element", "action", ["setRole", ["get", "model", ["loc", [null, [50, 30], [50, 35]]]], "student"], [], ["loc", [null, [50, 11], [50, 47]]]], ["attribute", "class", ["concat", ["box square ", ["get", "parentActive", ["loc", [null, [53, 67], [53, 79]]]], " double"]]], ["element", "action", ["setRole", ["get", "model", ["loc", [null, [53, 30], [53, 35]]]], "parent"], [], ["loc", [null, [53, 11], [53, 46]]]], ["block", "unless", [["get", "model.isParent", ["loc", [null, [57, 14], [57, 28]]]]], [], 0, null, ["loc", [null, [57, 4], [77, 15]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("whats-due-cordova/templates/support", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
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
        dom.setAttribute(el1, "id", "support");
        dom.setAttribute(el1, "class", "static-content loaded");
        var el2 = dom.createTextNode("\n    If you have any questions or issues, shoot Aaron an email:\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2, "href", "mailto:aaron@whatsdueapp.com");
        var el3 = dom.createTextNode("aaron@whatsdueapp.com");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/welcome/my-name", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            dom.setAttribute(el1, "src", "assets/img/checked.png");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.2.0",
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
            dom.setAttribute(el1, "src", "assets/img/unchecked.png");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.2.0",
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
          dom.setAttribute(el1, "class", "over13");
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
          morphs[1] = dom.createMorphAt(element0, 1, 1);
          return morphs;
        },
        statements: [["element", "action", ["toggleAge"], [], ["loc", [null, [14, 18], [14, 40]]]], ["block", "if", [["get", "model.over12", ["loc", [null, [15, 18], [15, 30]]]]], [], 0, 1, ["loc", [null, [15, 12], [19, 19]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "my-name");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        My name is\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "name keyboard-top");
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
        dom.setAttribute(el2, "class", "box centered square white join");
        var el3 = dom.createTextNode("\n        See your tasks\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2, "class", "terms");
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
        dom.setAttribute(el2, "class", "static-content back-arrow");
        dom.setAttribute(el2, "src", "assets/img/back.png");
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
        morphs[0] = dom.createMorphAt(element2, 1, 1);
        morphs[1] = dom.createMorphAt(element2, 3, 3);
        morphs[2] = dom.createMorphAt(element1, 5, 5);
        morphs[3] = dom.createElementMorph(element3);
        morphs[4] = dom.createMorphAt(element4, 3, 3);
        morphs[5] = dom.createMorphAt(element4, 5, 5);
        morphs[6] = dom.createElementMorph(element5);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "placeholder", "First Name", "class", "box double square clear", "value", ["subexpr", "@mut", [["get", "model.first_name", ["loc", [null, [6, 91], [6, 107]]]]], [], []]], ["loc", [null, [6, 8], [6, 109]]]], ["inline", "input", [], ["type", "text", "placeholder", "Last Name", "class", "box double square clear", "value", ["subexpr", "@mut", [["get", "model.last_name", ["loc", [null, [8, 90], [8, 105]]]]], [], []]], ["loc", [null, [8, 8], [8, 107]]]], ["block", "unless", [["get", "model.isParent", ["loc", [null, [11, 14], [11, 28]]]]], [], 0, null, ["loc", [null, [11, 4], [22, 15]]]], ["element", "action", ["setName"], [], ["loc", [null, [23, 7], [23, 27]]]], ["inline", "external-link", ["http://whatsdueapp.com/terms", "terms of service"], [], ["loc", [null, [28, 8], [28, 75]]]], ["inline", "external-link", ["http://whatsdueapp.com/privacy-policy", "privacy policy"], [], ["loc", [null, [29, 8], [29, 82]]]], ["element", "action", ["transitionPage", "welcome.parent-student", "WhatsDue"], [], ["loc", [null, [32, 9], [32, 72]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("whats-due-cordova/templates/welcome/parent-student", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "parent-student");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        I am a\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "buttons");
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
      statements: [["attribute", "class", ["concat", ["box square double ", ["get", "studentActive", ["loc", [null, [6, 69], [6, 82]]]]]]], ["element", "action", ["setRole", "student"], [], ["loc", [null, [6, 11], [6, 41]]]], ["attribute", "class", ["concat", ["box square double ", ["get", "parentActive", ["loc", [null, [9, 68], [9, 80]]]]]]], ["element", "action", ["setRole", "parent"], [], ["loc", [null, [9, 11], [9, 40]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/welcome/under13", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "id", "under13");
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
        dom.setAttribute(el2, "class", "box square white centered");
        var el3 = dom.createTextNode("\n        See your tasks\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("img");
        dom.setAttribute(el2, "class", "static-content");
        dom.setAttribute(el2, "src", "assets/img/back.png");
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
        morphs[0] = dom.createMorphAt(element0, 7, 7);
        morphs[1] = dom.createElementMorph(element1);
        morphs[2] = dom.createElementMorph(element2);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "placeholder", "Email", "class", "box full square clear", "value", ["subexpr", "@mut", [["get", "model.parent_email", ["loc", [null, [13, 80], [13, 98]]]]], [], []]], ["loc", [null, [13, 4], [13, 100]]]], ["element", "action", ["parentEmail", ["get", "model", ["loc", [null, [15, 30], [15, 35]]]]], [], ["loc", [null, [15, 7], [15, 37]]]], ["element", "action", ["transitionPage", "welcome.my-name", "WhatsDue"], [], ["loc", [null, [18, 9], [18, 65]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("whats-due-cordova/templates/welcome", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "triple-curlies"
        },
        "revision": "Ember@2.2.0",
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
        dom.setAttribute(el1, "class", "welcome loaded");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "outer");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "middle");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "inner");
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
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1, 1]), 1, 1);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [5, 16], [5, 26]]]]],
      locals: [],
      templates: []
    };
  })());
});
define('whats-due-cordova/utils/cordova-stuff', ['exports', 'whats-due-cordova/config/environment', 'ember'], function (exports, _whatsDueCordovaConfigEnvironment, _ember) {
    exports['default'] = function () {

        var onSuccess = function onSuccess() {
            console.log('Success');
        };
        var onFail = function onFail(reason) {
            console.log('Failed: ' + reason);
        };

        window.mixpanel.init(_whatsDueCordovaConfigEnvironment['default'].mixpanelId, onSuccess, onFail);
        window.mixpanel.track('App Opened');
        window.mixpanel.identify(window.user.id.toString(), onSuccess, onFail);
        window.mixpanel.people.set({
            "$created": window.user.signup_date,
            "$last_login": new Date(),
            'System ID': window.user.id,
            '$first_name': window.user.first_name,
            '$last_name': window.user.last_name,
            'Parent\'s Email': window.user.parent_email,
            'Role': window.user.role,
            'Over 12': window.user.over12
        }, onSuccess, onFail);

        window.mixpanel.people.setPushId(window.pushId, onSuccess, onFail);

        window.flushMixpanel = setTimeout(function () {
            window.mixpanel.flush();
        }, 5000);

        window.addEventListener('native.keyboardshow', keyboardShowHandler);

        var activeInput;

        function keyboardShowHandler() {
            /*
             iPhone 4 hack
             */
            _ember['default'].$('#contentContainer').css({
                'overflow-y': 'scroll',
                '-webkit-overflow-scrolling': 'touch'
            });
            activeInput = _ember['default'].$(':focus');
        }

        window.addEventListener('native.keyboardhide', keyboardHideHandler);

        function keyboardHideHandler() {
            activeInput.blur();
        }

        document.addEventListener("resume", onResume, false);
        document.addEventListener("pause", onPause, false);

        window.initializeBranch = function () {
            alert('starting branch');
            window.branch.init(_whatsDueCordovaConfigEnvironment['default'].branchKey, function (err, data) {
                alert(err, data);
                if (!err && data.data) {
                    var parsed_data = JSON.parse(data.data);
                    window.trackJs.track("Branch:" + parsed_data);
                    var courseCode = parsed_data['course_code'];
                    if (courseCode) {
                        window.addCourse(courseCode);
                    }
                }
            });
        };

        function onResume() {
            window.initializeBranch();
        }
        function onPause() {
            window.mixpanel.flush();
            window.branch.logout();
        }

        // TODO: handle back button
        //document.addEventListener("backbutton", onBackKeyDown, false);
        //function onBackKeyDown() {
        //    controller.sendAction("transitionPage", "assignments", "Assignments");
        //}

        /* Deep linking hack */
        window.handleOpenURL = function (url) {
            console.log(url);
        };

        /* Universal stuff only on cordova */
        window.alert = function (message) {
            navigator.notification.alert(message, null, 'Whoops');
        };

        /* add course universally */
        window.addCourse = function (courseCode) {
            var element = _ember['default'].$('#addCourseProgrammatically');
            element.children('input').val(courseCode);
            element.children('input').trigger('keyup');
            element.trigger('click');
        };

        window.trackJs.configure({
            userId: window.user.id.toString() + " - " + window.user.firstName + " " + window.user.lastName
        });

        // Log Emberjs errors to TrackJS
        _ember['default'].onerror = function (error) {
            if (window.trackJs) {
                window.trackJs.track(error);
            }
            // Optional pass error through to embers error logger
            _ember['default'].Logger.assert(false, error);
            return true;
        };
        // Log Ember promise errors
        _ember['default'].RSVP.on('error', function (error) {
            if (window.trackJs) {
                window.trackJs.track(error);
            }
            // Optional pass error through to embers error logger
            _ember['default'].Logger.assert(false, error);
            return true;
        });
    };
});
/**
 * Created by Dan on 10/11/2015.
 */
define('whats-due-cordova/utils/group-by', ['exports', 'ember'], function (exports, _ember) {

    var get = _ember['default'].get,
        arrayComputed = _ember['default'].arrayComputed;

    exports['default'] = function (dependentKey, property) {
        var options = {
            initialValue: [],
            addedItem: function addedItem(array, item) {
                var key = get(item, property),
                    group = array.findBy('key', key);
                if (!group) {
                    group = _ember['default'].ArrayProxy.create({
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
    };
});
define("whats-due-cordova/utils/is-on-cordova", ["exports"], function (exports) {
  exports["default"] = isOnCordova;
  /**
   * Created by Dan on 09/11/2015.
   */

  function isOnCordova() {
    return !!window.cordova;
  }
});
define('whats-due-cordova/utils/missing-plugin', ['exports', 'ember-cli-cordova-shims/utils/missing-plugin'], function (exports, _emberCliCordovaShimsUtilsMissingPlugin) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliCordovaShimsUtilsMissingPlugin['default'];
    }
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

if (!runningTests) {
  require("whats-due-cordova/app")["default"].create({"name":"whats-due-cordova","version":"0.0.0+7d644022"});
}

/* jshint ignore:end */
//# sourceMappingURL=whats-due-cordova.map