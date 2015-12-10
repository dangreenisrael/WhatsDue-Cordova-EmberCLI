import Ember from 'ember';
/* global CustomFunctions */
export default Ember.Controller.extend({
    actions: {
        parentEmail: function(){
            var emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            var emailValid = emailRegEx.test(this.get('model').get('parent_email'));
            if (emailValid) {
                this.get('model').save();
                this.transitionToRoute('assignments.due');
                CustomFunctions.setUserProperty('Parent\'s Email', this.get('model').get('parent_email'));
            }else{
               alert('Double check that email');
            }
        }
    }
});