import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.route('courses', function(){
    });
    this.route('assignments', {path: '/'}, function(){
        this.route('due', function () {
        });
        this.route('over-due', function () {
        });
    });
    this.route('completedAssignments', function(){
    });

    this.route('support', function(){
    });
    this.route('messages', function(){
    });
    this.route('settings', function(){
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
