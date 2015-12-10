/**
 * Created by Dan on 09/11/2015.
 */
import isOnCordova from  'whats-due-cordova/utils/is-on-cordova';
import initializeCordova from 'whats-due-cordova/utils/cordova-stuff' ;

export function initialize(container, application) {
    application.deferReadiness();
    document.addEventListener('deviceready', function() {
        if (window.cordova){
            initializeCordova();
        } else{
            console.log('no cordova');
        }
        setTimeout(function(){
            application.advanceReadiness();
        }, 500);
    }, false);
    if(!isOnCordova()){
        document.dispatchEvent(new Event('deviceready'));
    }
}

export default {
    name: 'cordova-device-ready',
    initialize: initialize
};