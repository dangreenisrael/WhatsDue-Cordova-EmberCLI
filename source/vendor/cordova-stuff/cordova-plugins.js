/**
 * Created by dan on 2014-07-06.
 */

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("resume", onResume, false);
document.addEventListener("pause", onPause, false);
var cordovaLoaded = false;

function onDeviceReady() {
    cordovaLoaded = true;
    CustomFunctions.trackEvent('App Opened');
    //cordova.plugins.Keyboard.disableScroll(true);
    initializeBranch();
}

function onResume() {
    initializeBranch();
}

function onPause() {
    initializeBranch();
}

var initializeBranch = function(){
    branch.init('key_test_pnpGrYydWQUPl7fgotkbxojgrBkdnpe4', function(err, data) {
        if (!err && data.data) {
            var parsed_data = JSON.parse(data.data);
            console.log(parsed_data);
            var courseCode = parsed_data['course_code'];
            if (courseCode) {
                $('#addCourseProgrammatically').children('input').val(courseCode).trigger("change").click();
            }
        }
    });
};
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
}

document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    CustomFunctions.applicationController.sendAction("transitionPage", "assignments", "Assignments");
}