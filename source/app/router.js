import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.resource('courses', function(){
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

    this.route('welcome', function() {
        this.route('parent-student', function () {
        });
        this.route('my-name', function () {
        });
        this.route('under13', function () {
        });
    });
});

export default Router;
