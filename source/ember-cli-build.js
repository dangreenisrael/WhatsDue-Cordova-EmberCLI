/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    fingerprint: {
      enabled: false
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  //  app.import('vendor/cordova-stuff/push-notifications.js');
  //app.import('vendor/cordova-stuff/cordova-plugins.js');
  //app.import('vendor/cordova-stuff/index.js');

    app.import('bower_components/moment/moment.js');
    app.import('bower_components/moment-timezone/moment-timezone.js');

    app.import('vendor/custom-js/custom-functions.js');
    app.import('vendor/custom-js/LS-LF-migration.js');
    app.import('vendor/custom-js/linkify-cordova.js');

  return app.toTree();
};
