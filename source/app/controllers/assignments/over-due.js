import Ember from 'ember';
import groupBy from 'ember-group-by';


/* global CustomFunctions */
export default Ember.Controller.extend({
    overdue:(function() {
        return this.get('model').sortBy('due_date');
    })
});

