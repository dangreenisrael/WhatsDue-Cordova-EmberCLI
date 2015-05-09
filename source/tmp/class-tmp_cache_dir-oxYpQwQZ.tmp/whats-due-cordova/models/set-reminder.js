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