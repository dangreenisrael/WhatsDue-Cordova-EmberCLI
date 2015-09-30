import Ember from 'ember';
import groupBy from 'ember-group-by';

export default Ember.Controller.extend({
    totalVisible: 10,
    groupedCards: groupBy('visible', 'daysAway'),
    due:function() {
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',false).sortBy('due_date');
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    visible: function(){
        return this.get('due').slice(0, this.get('totalVisible'));
    }.property('due', 'totalVisible'),
    actions:{
        more: function(){
            var totalVisible = this.get('totalVisible')+10;
            this.set('totalVisible', totalVisible);
        }
    }
});