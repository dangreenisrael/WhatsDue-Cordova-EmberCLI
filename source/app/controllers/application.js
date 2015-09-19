import Ember from 'ember';
/* global CustomFunctions */
/* global Migration */


export default Ember.Controller.extend({
    init: function () {


        /* Start store injection */
        CustomFunctions.setStore(this);
        CustomFunctions.setApplicationController(this);

        /* End store injection */

        var controller = this;
        setInterval(function () {
            CustomFunctions.updateAssignments(controller);
            CustomFunctions.updateCourses(controller);
        }, 5000);

        function checkVersion(version){
            version = parseFloat(version);
            if(version < 2){
                CustomFunctions.setSetting('version', 2.1);
                controller.transitionToRoute('welcome.parent-student');
                controller.set('pageTitle', "Courses");
                Migration.runMigration();
            } else if (version === 2){
                CustomFunctions.setSetting('version', 2.1);
                setTimeout(function(){
                    Migration.setDefaultSettings();
                },5000)
            }
        }
        CustomFunctions.getSetting('version', checkVersion);
    },
    pageTitle: "Assignments"
});