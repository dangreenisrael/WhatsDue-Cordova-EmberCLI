import Ember from 'ember';
/* global CustomUI */

export default Ember.Route.extend({
    actions:{
        transitionPage: function(destination, title){
            this.transitionTo(destination);
            this.set('controller.pageTitle', title);
            CustomUI.closeMenu();
        },
        gotoMenu: function(){
            //this.transitionTo("reminders");
            CustomUI.openMenu();
        }
    }
});

