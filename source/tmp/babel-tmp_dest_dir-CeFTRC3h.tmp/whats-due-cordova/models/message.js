import DS from 'ember-data';
/* global moment */

var Message = DS.Model.extend({
    username: DS.attr('string'),
    body: DS.attr('string'),
    updated_at: DS.attr('number'),
    course_id: DS.belongsTo('course', { async: true }),
    date: (function () {
        return moment(this.get('updated_at'), 'X').format('MMM Do, hh:mm A');
    }).property('updated_at')
});

export default Message;