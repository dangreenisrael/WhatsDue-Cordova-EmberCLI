import Ember from 'ember';
import groupBy from 'ember-group-by';

export default Ember.Controller.extend({
    groupedCards: groupBy('due', 'daysAway'),
    due:function() {
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',false).sortBy('due_date');
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived')
});