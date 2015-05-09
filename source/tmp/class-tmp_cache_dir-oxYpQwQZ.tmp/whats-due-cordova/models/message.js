define('whats-due-cordova/models/message', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Message = DS['default'].Model.extend({
        username: DS['default'].attr('string'),
        body: DS['default'].attr('string'),
        updated_at: DS['default'].attr('number'),
        course_id: DS['default'].belongsTo('course', { async: true }),
        date: (function () {
            return moment(this.get('updated_at'), 'X').format('MMM Do, hh:mm A');
        }).property('updated_at')
    });

    exports['default'] = Message;

});