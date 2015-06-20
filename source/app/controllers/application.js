import Ember from 'ember';
/* global CustomFunctions */
/* global CustomUI */
/* global cordovaLoaded */
/* global Migration */
/* global cordova */


var ApplicationController = Ember.Controller.extend({
    actions: {
        test: function () {
            this.transitionToRoute('assignments');
        }
    },
    init: function () {
        /* Start store injection */
        CustomFunctions.setStore(this);
        /* End store injection */

        Ember.$.ajax({
            url: 'http://ipinfo.io/json',
            type: 'GET',
            context: this,
            success: function (data) {
                var locationInfo = CustomFunctions.LocationInfo(data);
                CustomFunctions.trackEvent('App Opened', "City", locationInfo.city, "Region", locationInfo.region, "Country", locationInfo.country);
            }
        });

        var context = this;


        //setInterval(function () {
        //    CustomFunctions.updateAssignments(context);
        //    CustomFunctions.updateCourses(context);
        //}, 5000);


        ///*
        // *  This updates record on push notifications
        // */
        //window.addEventListener('updatedAssignment', function () {
        //    CustomFunctions.updateAssignments(context);
        //});
    }
});
/**
 * Created by dan on 2014-05-13.
 */

export default ApplicationController;
