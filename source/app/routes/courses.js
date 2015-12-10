import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        return this.store.findAll('course');
    },
    beforeModel: function(){
        this.controllerFor('application').set('loading', 'loading');
    },
    afterModel: function(){
        this.controllerFor('application').set('loading', null);
    }
});