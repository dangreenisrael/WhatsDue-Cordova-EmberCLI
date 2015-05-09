import Ember from 'ember';
import CustomUI from 'customUI';

var SupportRoute = Ember.Route.extend({
    model: function(){
        CustomUI.setTitle('Support');
    }
});

export default SupportRoute;
