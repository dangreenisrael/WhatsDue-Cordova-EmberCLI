/**
 * Created by Dan on 5/26/15.
 */
import Ember from 'ember';

var AssignmentCardComponent = Ember.Component.extend({
    actions: {
        removeAssignment: function(assignment) {
            this.sendAction('removeAssignment', assignment);
        },
        toggleModal: function(assignment) {
            this.sendAction('toggleModal', assignment);
        }
    }
});

export default AssignmentCardComponent;
