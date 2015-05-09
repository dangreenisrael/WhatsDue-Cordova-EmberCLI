define('whats-due-cordova/views/enrolled', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var EnrolledView = Ember['default'].View.extend({
        contentDidChange: (function () {
            CustomUI.putBackable();
            console.log('loaded');
        }).observes('controller.filteredData'),
        afterRender: function afterRender() {
            CustomUI.makeSpinnable();
            var addCourse = Ember['default'].$('#addCourse');
            addCourse.find('input').val('');
            CustomUI.putBackable();
        }
    });

    exports['default'] = EnrolledView;

});