define('whats-due-cordova/routes/messages', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var MessagesRoute = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find('message');
        }
    });

    exports['default'] = MessagesRoute;

});