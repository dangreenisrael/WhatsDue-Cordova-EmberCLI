import Ember from 'ember';
/*global CustomUI */
var SupportView = Ember.View.extend({
    afterRender: function(){
        setTimeout(function(){
                CustomUI.showSupport();
            }, 50
        );
    }
});

export default SupportView;
