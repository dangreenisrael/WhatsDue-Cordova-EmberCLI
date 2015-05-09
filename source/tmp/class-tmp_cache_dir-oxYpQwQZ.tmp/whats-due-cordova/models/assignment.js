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