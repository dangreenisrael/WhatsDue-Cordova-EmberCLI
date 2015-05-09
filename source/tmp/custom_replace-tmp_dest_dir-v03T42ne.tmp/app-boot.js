/* jshint ignore:start */

define('source/config/environment', ['ember'], function(Ember) {
  var prefix = 'source';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("source/tests/test-helper");
} else {
  require("source/app")["default"].create({"name":"whats-due-cordova","version":"0.0.0."});
}

/* jshint ignore:end */
