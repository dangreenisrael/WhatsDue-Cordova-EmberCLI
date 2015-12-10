/**
 * Created by Dan on 5/26/15.
 */
import Ember from 'ember';

export default Ember.Component.extend({
    open: false,
    actions: {
        removeAssignment: function (assignment) {
            let controller=this;
            /* Hacks for older mobile devices */
            assignment.set('hiding', 'animateHide');
            setTimeout(function(){
                controller.sendAction('removeAssignment', assignment);
                Ember.$(window).scroll();
            },300);
        },
        toggleModal: function (assignment) {
            this.sendAction('toggleModal', assignment);
        },
        slideOver: function (assignment) {
            if (!assignment.get('open')){
                assignment.set('open', 'open');
            } else{
                assignment.set('open', null);
            }
        }
    }
});

