/**
 * Created by Dan on 09/11/2015.
 */
import Ember from 'ember';

export function initializeTrackJS() {
    // Log Emberjs errors to TrackJS
    Ember.onerror = function(error){

        if(window.trackJs) {
            window.trackJs.track(error);
        }

        // Optional pass error through to embers error logger
        Ember.Logger.assert(false, error);

    };

    // Log Ember promise errors
    Ember.RSVP.on('error', function(error) {

        if(window.trackJs) {
            window.trackJs.track(error);
        }

        // Optional pass error through to embers error logger
        Ember.Logger.assert(false, error);

    });
}

export default {
    name: 'track-js',
    initialize: initializeTrackJS
};