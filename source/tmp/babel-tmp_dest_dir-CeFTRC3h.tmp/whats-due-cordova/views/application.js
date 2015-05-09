import Ember from 'ember';
/* global CustomUI */

var ApplicationView = Ember.View.extend({
    didInsertElement: function didInsertElement() {
        CustomUI.readyFunction();
    }
});

export default ApplicationView;