import Ember from 'ember';
/* global CustomUI */

var RemindersView = Ember.View.extend({
    contentDidChange: function() {
        CustomUI.putBackable();
    }.observes('controller.model'),
    afterRender: function(){
    setTimeout(function(){
            CustomUI.putBackable();
            CustomUI.reminderTips();
        }, 50
    );
}

});

export default RemindersView;
