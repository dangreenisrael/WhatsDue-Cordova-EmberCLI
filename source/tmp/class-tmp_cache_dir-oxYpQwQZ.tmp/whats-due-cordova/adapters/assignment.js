define('whats-due-cordova/adapters/assignment', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var AssignmentAdapter = DS['default'].LSAdapter.extend({
        namespace: 'whatsdue-assignment'
    });

    exports['default'] = AssignmentAdapter;

});