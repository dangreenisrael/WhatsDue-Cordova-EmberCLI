import Ember from 'ember';
/* global CustomUI */
var RemindersRoute = Ember.Route.extend({
    model: function model() {
        CustomUI.setTitle('Reminders');
        this.store.find('setReminder');
        return this.store.find('reminder');
    }
});

export default RemindersRoute;