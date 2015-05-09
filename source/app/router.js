import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
    this.resource('enrolled', function(){
    });

    //this.resource('unenrolled', function(){
    //});

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
