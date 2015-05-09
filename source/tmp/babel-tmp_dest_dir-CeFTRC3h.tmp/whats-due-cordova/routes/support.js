import Ember from 'ember';
import CustomUI from 'customUI';

var SupportRoute = Ember.Route.extend({
    model: function model() {
        CustomUI.setTitle('Support');
    }
});

export default SupportRoute;