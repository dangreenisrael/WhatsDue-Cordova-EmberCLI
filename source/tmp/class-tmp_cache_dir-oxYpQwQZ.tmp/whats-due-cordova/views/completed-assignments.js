define('whats-due-cordova/views/completed-assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CompletedAssignmentsView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
        }).observes('controller.filteredData')
    });

    exports['default'] = CompletedAssignmentsView;

});