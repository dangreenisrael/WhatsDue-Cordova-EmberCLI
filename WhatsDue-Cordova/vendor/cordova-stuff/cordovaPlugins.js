/**
 * Created by dan on 2014-07-06.
 */
/* global Localytics */

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("resume", onResume, false);
document.addEventListener("pause", onPause, false);
var cordovaLoaded = false;

function onDeviceReady() {

    cordovaLoaded = true;
    Ember.$('#contentContainer').css("-webkit-transform", "translate3d(-33.33333%,0,0) scale3d(1,1,1)");
    setTimeout(readyFunction(), 500);
    Ember.$('nav > .overdue').click();
    Ember.$('nav > .due').click();
    Localytics.init("343efcc05aba1feeedd4ce3-3f4a6c12-5e6b-11e4-4dc6-00a426b17dd8");
    Localytics.resume();
    Localytics.upload();
    trackEvent('App Opened');


}

function onResume() {
    Localytics.resume();
    Localytics.upload();
}

function onPause() {
    Localytics.close();
    Localytics.upload();
}

window.addEventListener('native.keyboardshow', keyboardShowHandler);

function keyboardShowHandler(e){
    var newReminder = Ember.$('#new-reminder').position();
    if (typeof newReminder !== 'undefined') {
        var scrollTop = newReminder.top;
        //Ember.$('#reminders').css('margin-top',-scrollTop)
    }

}

window.addEventListener('native.keyboardhide', keyboardHideHandler);

function keyboardHideHandler(e){
    //Ember.$('#reminders').css('margin-top', 0)
}


document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    Ember.$.modal.close();
    goHome();
}