define('whats-due-cordova/views/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ApplicationView = Ember['default'].View.extend({
        didInsertElement: function didInsertElement() {
            CustomUI.readyFunction();
        }
    });

    exports['default'] = ApplicationView;

});