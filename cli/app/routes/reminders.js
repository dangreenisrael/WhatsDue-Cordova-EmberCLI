import Ember from 'ember';

var RemindersRoute = Ember.Route.extend({
    model: function(){
        setTitle('Reminders');
        this.store.find('setReminder');
        return this.store.find('reminder');
    }
});

export default RemindersRoute;
