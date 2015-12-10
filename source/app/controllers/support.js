import Ember from 'ember';

export default Ember.Controller.extend({
    data: null,
    init: function(){
        var controller = this;
        Ember.$.get("http://whatsdueapp.com/live-content/support.php", function (data) {
            controller.set('data', data);
        });
    }
});