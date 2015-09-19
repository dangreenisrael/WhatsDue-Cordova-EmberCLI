/**
 * Created by Dan on 5/11/15.
 */

/* global moment*/

import DS from 'ember-data';

export default DS.Model.extend({
    notifications:                DS.attr('boolean'),
    notification_updates:         DS.attr('boolean'),
    notification_time_utc:        DS.attr('string'),
    notification_time_local:      DS.attr('string'),
    first_name:                   DS.attr('string'),
    last_name:                    DS.attr('string'),
    role:                         DS.attr('string'),
    over12:                       DS.attr('boolean'),
    parent_email:                 DS.attr('string'),
    signup_date:                  DS.attr('string'),
    isParent: function(){
        return (this.get('role')==="parent");
    }.property('role'),
    isStudent: function(){
        return (this.get('role')==="student");
    }.property('role'),
    displayTime: function(){
        var time = moment().hours(this.get('hours')).minutes(this.get('minutes'));
        return time.format('hh:mm A');
    }.property('hours','minutes'),
    hours: function(){
        return this.get('notification_time_local').substring(0, 2);
    }.property('notification_time_local'),
    minutes: function(){
        return this.get('notification_time_local').substring(2, 4);
    }.property('notification_time_local'),
    parentActive: function(){
        if (this.get('isParent')){
            return "white";
        } else{
            return "clear";
        }
    }.property('isParent'),
    studentActive: function(){
        if (this.get('isStudent')){
            return "white";
        } else{
            return "clear";
        }
    }.property('isParent')
});