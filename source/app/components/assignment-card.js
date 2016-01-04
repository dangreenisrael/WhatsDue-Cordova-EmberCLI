/**
 * Created by Dan on 5/26/15.
 */
import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin,{
    open: false,
    didEnterViewport() {
        let assignment = this.get('assignment');
       // if (assignment.get('seen') != true){
            assignment.set('seen', true);
            /* We need the timestamp in seconds for HHVM */
            let timestamp = Math.round(new Date().getTime() / 1000);
            assignment.set('seen_date', timestamp);
            console.log(assignment.get('seen_date'));
            assignment.save();
       // }
    },
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

