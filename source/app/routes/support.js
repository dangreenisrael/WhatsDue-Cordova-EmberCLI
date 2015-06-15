import Ember from 'ember';
/* global CustomUI */

var SupportRoute = Ember.Route.extend({
    model: function(){
        CustomUI.setTitle('Support');
    }
});

export default SupportRoute;
