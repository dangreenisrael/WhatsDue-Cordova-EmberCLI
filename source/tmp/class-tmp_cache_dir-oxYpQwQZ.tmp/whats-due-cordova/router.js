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