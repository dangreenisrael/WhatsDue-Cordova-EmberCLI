import Ember from 'ember';

var Route = Ember.Route.extend({

});
/**
* Created by dan on 2014-05-13.
*/

Router.map(function(){
    this.resource('enrolled', function(){
    });

    this.resource('unenrolled', function(){
    });

    this.resource('assignments', {path: '/'}, function(){
    });

    this.resource('completedAssignments', function(){
    });

    this.resource('support', function(){
    });

    this.resource('messages', function(){
    });

    this.resource('reminders', function(){

    });

    this.resource('welcome', function(){

    });
});

export default Route;
