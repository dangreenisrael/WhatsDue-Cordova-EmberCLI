import Ember from 'ember';
import groupBy from 'ember-group-by';

/* global CustomFunctions */
export default Ember.Controller.extend({
    due:(function() {
        return this.get('model')
            .filterBy('completed',false)
            .filterBy('archived',false)
            .filterBy('overdue',false)
            .sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    groupedCards: groupBy('due', 'daysAway'),
    overdue:(function() {
        return this.get('model')
            .filterBy('completed',false)
            .filterBy('archived',false)
            .filterBy('overdue',true)
            .filterBy('hidden',false)
            .sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalDue: function() {
        return this.get('due.length');
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    stuffDue: function(){
        return (this.get('due.length') > 0);
    }
    .property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalOverdue: function() {
        return this.get('overdue.length');
    }.property('model.@each.due_date', 'model.@each.completed')
});

