import Ember from 'ember';
import CustomUI from 'customUI';

var SupportView = Ember.View.extend({
    afterRender: function afterRender() {
        setTimeout(function () {
            CustomUI.showSupport();
        }, 50);
    }
});

export default SupportView;