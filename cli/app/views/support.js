import Ember from 'ember';

var SupportView = Ember.View.extend({
    afterRender: function(){
        sliderSize();
        setTimeout(function(){
                showSupport();
            }, 50
        );
    }
});

export default SupportView;
