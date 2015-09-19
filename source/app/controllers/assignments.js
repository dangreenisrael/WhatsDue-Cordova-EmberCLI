import Ember from 'ember';
import groupBy from '../utils/group-by';

/* global CustomFunctions */
var AssignmentsController = Ember.ArrayController.extend({
    due:(function() {
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',false).sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    groupedCards: groupBy('due', 'daysAway'),
    overdue:(function() {
        return this.get('model').filterBy('completed',false).filterBy('archived',false).filterBy('overdue',true).filterBy('hidden',false).sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalDue: function() {
        return this.get('due.length');
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    stuffDue: function(){
        if(this.get('due.length') > 0){
            return "hidden";
        }
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalOverdue: function() {
        return this.get('overdue.length');
    }.property('model.@each.due_date', 'model.@each.completed'),
    isShowingModal: false,
    shareContent: "",
    actions: {
        clickElement: function(assignment){
          this.set('activeElement', assignment);
        },
        removeAssignment: function(assignment) {
            CustomFunctions.trackEvent('Assignment Completed');
            assignment.set('completed', true);
            assignment.set('date_completed', Date.now());
            assignment.save();
            var putData = {
                assignment: {
                    completed:       true,
                    completed_date:  Date.now()
                }
            };
            Ember.$.ajax({
                url: CustomFunctions.site()+"/assignments/"+assignment.get('id'),
                type: 'PUT',
                data: JSON.stringify(putData),
                contentType: "application/json"
            });
        },
        toggleModal: function(assignment){
            var context = this;
            if (this.isShowingModal === false){
                assignment.get('course_id').then(function(course){
                    context.shareContent = assignment.get('daysAway') + " at " + assignment.get('timeDue') + ":\n\n" + assignment.get('assignment_name') + " is due for " + course.get('course_name');
                });
            }
            this.toggleProperty('isShowingModal');
        },
        share: function(){
            CustomFunctions.share(this.shareContent);
            this.toggleProperty('isShowingModal');
        },
        cancel:function(){
            this.toggleProperty('isShowingModal');
        }
    }
});

export default AssignmentsController;