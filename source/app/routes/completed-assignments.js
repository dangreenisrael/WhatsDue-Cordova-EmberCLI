import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        return this.store.query('assignment', {
            'completed': true
        });
    },
    pageLeave: function(){
        let store = this.store;
        store.peekAll('assignment').filterBy('completed', true).forEach(function(record){
            store.unloadRecord(record);
        });
    }.on('deactivate'),
    actions: {
        unRemoveAssignment: function(assignment) {
            let store = this.store;
            assignment.set('completed', false);
            assignment.set('date_completed', null);
            assignment.save().then(function(record){
                store.unloadRecord(record);
            });
        }
    },
    beforeModel: function(){
        this.controllerFor('application').set('loading', 'loading');
    },
    afterModel: function(){
        this.controllerFor('application').set('loading', null);
    }
});
