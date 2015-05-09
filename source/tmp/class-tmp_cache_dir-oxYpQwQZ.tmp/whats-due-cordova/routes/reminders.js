define('whats-due-cordova/routes/reminders', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var RemindersRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI.setTitle('Reminders');
            this.store.find('setReminder');
            return this.store.find('reminder');
        }
    });

    exports['default'] = RemindersRoute;

});