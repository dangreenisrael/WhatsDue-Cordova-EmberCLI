define('whats-due-cordova/adapters/course', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var CourseAdapter = DS['default'].LSAdapter.extend({
    namespace: 'whatsdue-courses'
  });

  exports['default'] = CourseAdapter;

});