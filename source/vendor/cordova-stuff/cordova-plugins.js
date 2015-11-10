/**
 * Created by dan on 2014-07-06.
 */

document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("resume", onResume, false);
document.addEventListener("pause", onPause, false);
//var cordovaLoaded = false;

//var initializeBranch = function(){
//    //window.branch.init('key_live_gciLF5xo0PGSi2ijbxdlvmjlAwifbofU', function(err, data) {
//    //    if (!err && data.data) {
//    //        var parsed_data = JSON.parse(data.data);
//    //        console.log(parsed_data);
//    //        var courseCode = parsed_data['course_code'];
//    //        if (courseCode) {
//    //            $('#addCourseProgrammatically').children('input').val(courseCode).trigger("change").click();
//    //        }
//    //    }
//    //});
//};

function onDeviceReady() {
    //cordovaLoaded = true;
    //window.mixpanel.track('App Opened');
    //initializeBranch();
}

function onResume() {
    //initializeBranch();
}

function onPause() {
    //window.branch.logout();
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

}

document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    CustomFunctions.applicationController.sendAction("transitionPage", "assignments", "Assignments");
}
