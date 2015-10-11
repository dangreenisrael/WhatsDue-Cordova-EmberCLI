import Ember from 'ember';
/* global CustomFunctions */
/* global Migration */
/* global moment */

export default Ember.Controller.extend({
    init: function () {
        CustomFunctions.setStore(this);

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
                },5000);
            }
        }
        CustomFunctions.getSetting('version', checkVersion);
        moment.locale('en', {
            calendar : {
                lastDay : '[Yesterday] ',
                sameDay : '[Today] ',
                nextDay : '[Tomorrow]',
                nextWeek : '[This] dddd',
                sameElse : 'dddd MMM Do'
            },
            relativeTime : {
                future: "%s ",
                past:   "%s",
                s:  "seconds",
                m:  "a minute",
                mm: "%d minutes",
                h:  "an hour",
                hh: "%d hours",
                d:  "a day",
                dd: "%d days",
                M:  "a month",
                MM: "%d months",
                y:  "a year",
                yy: "%d years"
            }
        });

    },
    pageTitle: "Assignments",
    menuOpen: "menuClosed",
    loading: null,
    actions:{
        menuToggle: function(){
            if (this.get('menuOpen') === "menuOpen"){
                this.set('menuOpen', "menuClosed");
            } else{
                this.set('menuOpen', "menuOpen");
            }
        },
        transitionPage: function(destination, title){
            this.transitionToRoute(destination);
            this.set('pageTitle', title);
            this.set('menuOpen', 'menuOpen');
        }
    }
});