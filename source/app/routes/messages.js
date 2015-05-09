import Ember from 'ember';

var MessagesRoute = Ember.Route.extend({
    model: function(){
        return this.store.find('message');
    }
});

export default MessagesRoute;
