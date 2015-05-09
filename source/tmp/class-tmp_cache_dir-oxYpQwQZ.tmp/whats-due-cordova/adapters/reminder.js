define('whats-due-cordova/adapters/reminder', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var ReminderAdapter = DS['default'].LSAdapter.extend({
        namespace: 'whatsdue-reminder'
    });

    exports['default'] = ReminderAdapter;

});