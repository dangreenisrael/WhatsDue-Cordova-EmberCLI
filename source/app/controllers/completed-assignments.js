import Ember from 'ember';
/* global CustomFunctions */

export default Ember.Controller.extend({
    filteredData: (function() {
        return this.get('model').filterBy('completed',true);
    }).property('model.@each.completed')
});