import Ember from 'ember';
import InfinityRoute from "ember-infinity/mixins/route";
/* global CustomFunctions */
/* global localforage */

export default Ember.Route.extend(InfinityRoute,{
    model: function() {
        return this.infinityModel("assignment", {perPage: 10, startingPage: 1}).then(function (data) {
            localforage.setItem('assignmentTimestamp', data.get('meta').timestamp);
            return data;
        });
    },
    afterModel() {
        this.controllerFor('application').set('loading', null);
    },
    beforeModel: function(){
        this.controllerFor('application').set('loading', 'loading');
    },
    actions: {
        removeAssignment: function(assignment) {
            assignment.set('completed', true);
            assignment.set('completed_date', Date.now());
            //Ember.run.later(function(){
                assignment.save().then(function(){
                    CustomFunctions.trackEvent('Assignment Completed');
                }, function(){
                    CustomFunctions.trackEvent('Assignment Complete Failed');
                });
            //},50);
        }
    }
});