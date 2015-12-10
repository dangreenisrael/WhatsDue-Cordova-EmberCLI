import Ember from 'ember';

/* global CustomFunctions */
export default Ember.Controller.extend({
    actions: {
        toggleAge: function(){
            this.get('model').toggleProperty('over12');
            this.get('model').save();
            CustomFunctions.setUserProperty('Over 12', this.model.get('over12'));
        },
        setName: function(){
            if (this.get('model').get('first_name') && this.get('model').get('last_name')){
                this.model.save();
                CustomFunctions.setUserProperty('$first_name',   this.get('model').get('first_name'));
                CustomFunctions.setUserProperty('$last_name',    this.get('model').get('last_name'));
                if ((this.get('model').get('role') !== "parent") && (this.get('model').get('over12') !== true)){
                    this.transitionToRoute('welcome.under13');
                    CustomFunctions.setUserProperty('Under 13',  true);

                } else{
                    CustomFunctions.setUserProperty('Under 13',  false);
                    this.transitionToRoute('assignments.due');
                }
            } else{
                alert('We need your first and last name');
            }
        }
    }
});