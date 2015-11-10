/**
 * Created by Dan on 09/11/2015.
 */
import isOnCordova from  'whats-due-cordova/utils/is-on-cordova';
import initializeCordova from 'whats-due-cordova/utils/cordova-stuff' ;

export function initialize(container, application) {
    application.deferReadiness();
    document.addEventListener('deviceready', function() {
        application.advanceReadiness();
        if (window.cordova){
            initializeCordova();
        }
    }, false);
    if(!isOnCordova()){
        document.dispatchEvent(new Event('deviceready'));
    }
}

export default {
    name: 'cordova-device-ready',
    initialize: initialize
};