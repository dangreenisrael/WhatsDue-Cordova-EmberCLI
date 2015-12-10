import Ember from 'ember';
/* global Migration */
/* global moment */

export default Ember.Controller.extend({
    init: function () {


        CustomFunctions.setStore(this);
        let controller = this;
        controller.store.findAll('student').then(function(records){
            var student = records.get('firstObject');
            if (student.get('first_name') && student.get('last_name')){
                controller.transitionToRoute('assignments.due');
            } else{
                var defaultTime = moment();
                defaultTime.hours(18);
                defaultTime.minutes(0);
                student.set('notification_time_local', defaultTime.format('HHmm'));
                student.set('notification_time_utc', defaultTime.utcOffset('UTC').format('HHmm'));
                student.save().then(function(){
                    controller.transitionToRoute('welcome.parent-student');
                });
            }
        });
        /* Initialize Moment */
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
        }
    }
});