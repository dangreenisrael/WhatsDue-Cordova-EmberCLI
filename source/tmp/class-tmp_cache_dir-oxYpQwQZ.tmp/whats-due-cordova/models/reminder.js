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