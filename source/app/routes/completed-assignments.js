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
        })
    }.on('deactivate')
});
