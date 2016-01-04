import Ember from 'ember';

export default Ember.Controller.extend({
    overdue:(function() {
        return this.get('model')
            .filterBy('completed',false)
            .filterBy('archived',false)
            .filterBy('overdue',true)
            .filterBy('hidden',false)
            .sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived')
});