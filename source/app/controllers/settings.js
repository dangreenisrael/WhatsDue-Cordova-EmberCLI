import Ember from 'ember';


export default Ember.Controller.extend({
    studentActive: function(){
        var role = this.get('model.role');
        if (role === 'student'){
            return 'active';
        } else{
            return 'not-active';
        }
    }.property('model.role'),
    parentActive: function(){
        var role = this.get('model.role');
        if (role === 'parent'){
            return 'active';
        } else{
            return 'not-active';
        }
    }.property('model.role')
});