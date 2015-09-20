/**
 * Created by Dan on 5/26/15.
 */
import Ember from 'ember';

export default Ember.Component.extend({
    open: false,
    actions: {
        remove: function (item) {
            this.sendAction('remove', item);
        },
        slideOver: function () {
            var element = this.$().find('.putBackable');
            element.css("-webkit-transform", "matrix(1, 0, 0, 1, 55, 0)");
            var component = this;
            setTimeout(function(){
                component.set('open', true);
            }, 50)
        },
        slideBack: function(){
            if (this.get('open')){
                var element = this.$().find('.putBackable');
                element.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, 0)");
                this.set('open', false);
            }
        }
    }
});

