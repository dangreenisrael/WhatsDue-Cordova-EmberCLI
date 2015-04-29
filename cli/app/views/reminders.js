import Ember from 'ember';

var RemindersView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
    }.observes('controller.model'),
    afterRender: function(){
    setTimeout(function(){
            reminderTips();
        }, 50
    );
}

});

export default RemindersView;
