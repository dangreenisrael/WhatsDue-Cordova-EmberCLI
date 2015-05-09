/**
 * Created by dan on 2014-05-13.
 */

import DS from 'ember-data';

//var App = Ember.Application.create();

var ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'whatsdue'
});

export default ApplicationAdapter;