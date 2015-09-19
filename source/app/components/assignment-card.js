/**
 * Created by Dan on 5/26/15.
 */
import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        removeAssignment: function (assignment) {
            this.sendAction('removeAssignment', assignment);
        },
        toggleModal: function (assignment) {
            this.sendAction('toggleModal', assignment);
        },
        slideOver: function (assignment) {
            var element = Ember.$("#"+ assignment.get('id'));
            Ember.$('.removable:not(#' + assignment.get('id')+')').css("-webkit-transform", "translateX(0)");
            if (element.css("-webkit-transform") !== "matrix(1, 0, 0, 1, -100, 0)") {
                element.css("-webkit-transform", "translateX(-100px)");
            } else{
                element.css("-webkit-transform", "translateX(0)");
            }
        }
    }
});

