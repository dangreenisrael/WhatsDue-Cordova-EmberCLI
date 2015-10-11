/**
 * Created by dan on 2014-05-13.
 */
import DS from 'ember-data';
import ENV from 'whats-due-cordova/config/environment';
/* global baseURL, device*/

/* Hack for Cordova */
baseURL = ENV.host + "/"+ENV.namespace;

export default DS.RESTAdapter.extend({
    host: function(){
        return ENV.host;
    }.property(),
    namespace: function(){
        return ENV.namespace;
    }.property(),
    headers: function(){
        console.log(ENV.environment);
        if (ENV.environment === 'development' || ENV.environment === ('wifi')) {
            return {"X-Student-Id": 1};
        } else{
           return {"X-Student-Id": device.uuid};
        }
    }.property()
});