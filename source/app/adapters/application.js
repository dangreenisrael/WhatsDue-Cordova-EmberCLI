/**
 * Created by dan on 2014-05-13.
 */
import DS from 'ember-data';
import ENV from 'whats-due-cordova/config/environment';
/* global baseURL, device*/

/* Hack for Cordova */

export default DS.RESTAdapter.extend({
    host: function(){
        return ENV.host;
    }.property(),
    namespace: function(){
        return ENV.namespace;
    }.property(),
    headers: function(){
        if (ENV.environment === 'development') {
            return {"X-Student-Id": 3714};
        } else{
            while (typeof device === 'undefined') {
            }
           return {"X-UUID": device.uuid};
        }
    }.property()
});