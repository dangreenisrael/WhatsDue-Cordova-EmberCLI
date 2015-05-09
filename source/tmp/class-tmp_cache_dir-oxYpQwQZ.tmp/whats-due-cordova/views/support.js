define('whats-due-cordova/views/support', ['exports', 'ember', 'customUI'], function (exports, Ember, CustomUI) {

    'use strict';

    var SupportView = Ember['default'].View.extend({
        afterRender: function afterRender() {
            setTimeout(function () {
                CustomUI['default'].showSupport();
            }, 50);
        }
    });

    exports['default'] = SupportView;

});