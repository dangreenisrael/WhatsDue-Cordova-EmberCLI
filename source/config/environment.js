/* jshint node: true */
var os     = require('os');
var ifaces = os.networkInterfaces();
var addresses = [];
for (var dev in ifaces) {
    ifaces[dev].forEach(function(details){
        if(details.family === 'IPv4' && details.address !== '127.0.0.1') {
            addresses.push(details.address);
        }
    });
}
module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'whats-due-cordova',
        environment: environment,
        baseURL: '/',
        namespace: "api/v1/student",
        locationType: 'hash',
        EmberENV: {
            FEATURES: {
            // Here you can enable experimental features on an ember canary build
            // e.g. 'with-controller': true
          }
        },
        contentSecurityPolicy: {
            'default-src': "*",
            'script-src': "* 'self' 'unsafe-inline' 'unsafe-eval'",
            'font-src': "'self'",
            'connect-src': "*",
            'img-src': "*",
            'style-src': "'self' 'unsafe-inline' "
        },
      APP: {
          // Here you can pass flags/options to your application instance
          // when it is created
      }
    };

    if (environment === 'development') {
        ENV.host = "http://test.whatsdueapp.com/app_dev.php";
        ENV.branchKey = "key_test_pnpGrYydWQUPl7fgotkbxojgrBkdnpe4";
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
        ENV.branchKey = "key_test_pnpGrYydWQUPl7fgotkbxojgrBkdnpe4";
    }

    if (environment === 'wifi') {
        ENV.host = "http://192.168.0.10/app_dev.php";
        ENV.mixpanelId = "38749de545164d92aac16ff263eb5898";
        ENV.branchKey = "key_test_pnpGrYydWQUPl7fgotkbxojgrBkdnpe4";

    }

    if (environment === 'stage') {
        ENV.host = "http://stage.whatsdueapp.com";
        ENV.mixpanelId = "38749de545164d92aac16ff263eb5898";
        ENV.branchKey = "key_test_pnpGrYydWQUPl7fgotkbxojgrBkdnpe4";

    }
    if (environment === 'production') {
        ENV.host = "http://admin.whatsdueapp.com";
        ENV.mixpanelId = "05a7faf77162927e0773b9f3646b2a2c";
        ENV.branchKey = "key_live_gciLF5xo0PGSi2ijbxdlvmjlAwifbofU";

    }

  return ENV;
};
