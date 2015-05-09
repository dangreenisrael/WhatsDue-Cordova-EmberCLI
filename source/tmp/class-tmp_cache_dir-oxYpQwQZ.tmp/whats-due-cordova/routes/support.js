define('whats-due-cordova/routes/support', ['exports', 'ember', 'customUI'], function (exports, Ember, CustomUI) {

    'use strict';

    var SupportRoute = Ember['default'].Route.extend({
        model: function model() {
            CustomUI['default'].setTitle('Support');
        }
    });

    exports['default'] = SupportRoute;

});