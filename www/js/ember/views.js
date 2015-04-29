/**
 * Created by dan on 2014-05-14.
 */

App.EnrolledView = Ember.View.extend({
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

App.UnenrolledView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
    }.observes('controller.filteredData'),
    afterRender: function(){
        if (cordovaLoaded == true){
            setTimeout(function(){
                cordova.plugins.Keyboard.show();
                $('#search').focus();
            }, 500)
        }
        makeSpinnable();
        setTimeout(function() {
            filter('search')
        }, 1);
    }
});

App.AssignmentsView = Ember.View.extend({
    contentDidChange: function() {
        swipeRemove();
    }.observes('controller.filteredData'),
    afterRender: function(){
        sliderSize();
    }
});

App.CompletedAssignmentsView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
    }.observes('controller.filteredData')
});

App.RemindersView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
    }.observes('controller.model'),
    afterRender: function(){
    setTimeout(function(){
            reminderTips();
        }, 50
    );
}

});

App.SupportView = Ember.View.extend({
    afterRender: function(){
        sliderSize();
        setTimeout(function(){
                showSupport();
            }, 50
        );
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