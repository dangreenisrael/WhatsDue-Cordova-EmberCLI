import Ember from 'ember';

var MessagesRoute = Ember.Route.extend({
    model: function(){
        return this.store.findAll('message');
    }
});

export default MessagesRoute;
