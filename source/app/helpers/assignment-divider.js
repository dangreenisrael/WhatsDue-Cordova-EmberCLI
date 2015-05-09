/**
 * Created by Dan on 4/29/15.
 */
import Ember from "ember";
/*global CustomFunctions */


var dueDays = [];
var assignmentCount = 0;
export default Ember.Handlebars.makeBoundHelper(function(daysAway, totalDue) {
    assignmentCount++;
    var count = CustomFunctions.countInArray(dueDays, daysAway);
    dueDays.push(daysAway);

    if (totalDue === assignmentCount) {
        assignmentCount = 0;
        dueDays = [];
    }

    var escaped = Ember.Handlebars.Utils.escapeExpression(daysAway);
    if (count === 0){
        return new Ember.Handlebars.SafeString('<div class="day-divider">' + escaped + '</div>');
    }

});