import Ember from 'ember';
import ENV from 'whats-due-cordova/config/environment';

export default Ember.Route.extend({
    init: function(){
        let route = this;
        let timeout =  function() {
            setTimeout(function () {
                let onSuccess = function(){
                    route.transitionTo('assignments');
                };
                let onFail = function(){
                    timeout();
                };
                Ember.$.get(ENV.host +"/"+ENV.namespace+"/test/connection")
                    .done(onSuccess)
                    .fail(onFail);
            }, 500);
        };
        timeout();
    }
});