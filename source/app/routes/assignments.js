import Ember from 'ember';
/* global CustomFunctions */

export default Ember.Route.extend({
    model: function() {
        return this.store.findAll('assignment');
    },
    afterModel() {
        this.transitionTo('assignments.due');
    },
    pageLeave: function(){
        let store = this.store;
        store.peekAll('assignment').filterBy('completed', false).forEach(function(record){
            store.unloadRecord(record);
        })
    }.on('deactivate'),
    actions: {
        removeAssignment: function(assignment) {
            let store = this.store;
            assignment.set('completed', true);
            assignment.set('date_completed', Date.now());
            assignment.save().then(function(record){
                store.unloadRecord(record);
            });
            CustomFunctions.trackEvent('Assignment Completed');
        }
    }
});