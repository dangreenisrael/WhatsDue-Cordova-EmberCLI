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