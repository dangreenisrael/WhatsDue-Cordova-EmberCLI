define('whats-due-cordova/views/reminders', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var RemindersView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
        }).observes('controller.model'),
        afterRender: function afterRender() {
            setTimeout(function () {
                CustomUI.putBackable();
                CustomUI.reminderTips();
            }, 50);
        }

    });

    exports['default'] = RemindersView;

});