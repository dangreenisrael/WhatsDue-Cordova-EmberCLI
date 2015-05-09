define('whats-due-cordova/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  /**
   * Created by dan on 2014-05-13.
   */

  var ApplicationAdapter = DS['default'].LSAdapter.extend({
    namespace: 'whatsdue'
  });

  exports['default'] = ApplicationAdapter;

});