cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-customurlscheme/www/ios/LaunchMyApp.js",
        "id": "cordova-plugin-customurlscheme.LaunchMyApp",
        "pluginId": "cordova-plugin-customurlscheme",
        "clobbers": [
            "window.plugins.launchmyapp"
        ]
    },
    {
        "file": "plugins/cordova-plugin-datepicker/www/ios/DatePicker.js",
        "id": "cordova-plugin-datepicker.DatePicker",
        "pluginId": "cordova-plugin-datepicker",
        "clobbers": [
            "datePicker"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "id": "cordova-plugin-dialogs.notification",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
        "id": "cordova-plugin-inappbrowser.inappbrowser",
        "pluginId": "cordova-plugin-inappbrowser",
        "clobbers": [
            "cordova.InAppBrowser.open",
            "window.open"
        ]
    },
    {
        "file": "plugins/cordova-plugin-mixpanel/www/mixpanel.js",
        "id": "cordova-plugin-mixpanel.Mixpanel",
        "pluginId": "cordova-plugin-mixpanel",
        "clobbers": [
            "mixpanel"
        ]
    },
    {
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/io.branch.sdk/dist/build.min.js",
        "id": "io.branch.sdk.branch",
        "pluginId": "io.branch.sdk",
        "clobbers": [
            "branch",
            "Branch"
        ]
    },
    {
        "file": "plugins/ionic-plugin-keyboard/www/ios/keyboard.js",
        "id": "ionic-plugin-keyboard.keyboard",
        "pluginId": "ionic-plugin-keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    },
    {
        "file": "plugins/phonegap-plugin-push/www/push.js",
        "id": "phonegap-plugin-push.PushNotification",
        "pluginId": "phonegap-plugin-push",
        "clobbers": [
            "PushNotification"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-customurlscheme": "4.1.0",
    "cordova-plugin-datepicker": "0.8.5",
    "cordova-plugin-device": "1.1.0",
    "cordova-plugin-dialogs": "1.2.0",
    "cordova-plugin-inappbrowser": "1.1.1",
    "cordova-plugin-mixpanel": "2.1.0",
    "cordova-plugin-splashscreen": "3.0.0",
    "cordova-plugin-transport-security": "0.1.1",
    "cordova-plugin-whitelist": "1.2.0",
    "io.branch.sdk": "1.8.0",
    "ionic-plugin-keyboard": "1.0.8",
    "phonegap-plugin-push": "1.5.2"
}
// BOTTOM OF METADATA
});