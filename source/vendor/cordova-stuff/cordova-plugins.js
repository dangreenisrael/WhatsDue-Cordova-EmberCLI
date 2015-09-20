/**
 * Created by dan on 2014-07-06.
 */

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("resume", onResume, false);
document.addEventListener("pause", onPause, false);
var cordovaLoaded = false;

function onDeviceReady() {
    cordovaLoaded = true;
    $('#contentContainer').css("-webkit-transform", "translate3d(-33.33333%,0,0) scale3d(1,1,1)");
    $('nav > .overdue').click();
    $('nav > .due').click();

    CustomFunctions.trackEvent('App Opened');
    //cordova.plugins.Keyboard.disableScroll(true);
}

function onResume() {
}

function onPause() {
}

window.addEventListener('native.keyboardshow', keyboardShowHandler);

var activeInput;
function keyboardShowHandler(e){
    /*
     iPhone 4 hack
     */
    Ember.$('#contentContainer').css({
        'overflow-y': 'scroll',
        '-webkit-overflow-scrolling': 'touch'
    });
    activeInput = $(':focus');
}

window.addEventListener('native.keyboardhide', keyboardHideHandler);

function keyboardHideHandler(e){
    activeInput.blur();
    //$('.welcome').css('top', 0);
    //$('#settings').css('margin-top', 0);

}

document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    CustomFunctions.applicationController.sendAction("transitionPage", "assignments", "Assignments");
}