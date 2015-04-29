import Ember from 'ember';

/**
 * Created by dan on 2014-05-14.
 */

var EnrolledView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
        console.log('loaded')
    }.observes('controller.filteredData'),
    afterRender: function(){
        makeSpinnable();
        var addCourse = $('#addCourse');
        addCourse.find('input').val("");
    }
});
/*
 * Handlebars Helpers
 */
var dueDays = [];
var assignmentCount = 0;
Ember.Handlebars.helper('divider', function(daysAway, totalDue) {
    assignmentCount++;

    var count = countInArray(dueDays, daysAway);
    dueDays.push(daysAway);

    if (totalDue == assignmentCount) {
        assignmentCount = 0;
        dueDays = [];
    }

    var escaped = Handlebars.Utils.escapeExpression(daysAway);
    if (count == 0){
        return new Ember.Handlebars.SafeString('<div class="day-divider">' + escaped + '</div>');
    }
});

export default EnrolledView;
