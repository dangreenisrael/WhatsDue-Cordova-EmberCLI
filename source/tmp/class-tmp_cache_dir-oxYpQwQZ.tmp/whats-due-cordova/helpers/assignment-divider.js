define('whats-due-cordova/helpers/assignment-divider', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/29/15.
     */
    var dueDays = [];
    var assignmentCount = 0;
    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (daysAway, totalDue) {
        assignmentCount++;
        var count = CustomFunctions.countInArray(dueDays, daysAway);
        dueDays.push(daysAway);

        if (totalDue === assignmentCount) {
            assignmentCount = 0;
            dueDays = [];
        }

        var escaped = Ember['default'].Handlebars.Utils.escapeExpression(daysAway);
        if (count === 0) {
            return new Ember['default'].Handlebars.SafeString('<div class="day-divider">' + escaped + '</div>');
        }
    });

});