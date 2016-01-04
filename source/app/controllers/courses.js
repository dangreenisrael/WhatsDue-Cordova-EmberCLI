import Ember from 'ember';

export default Ember.Controller.extend({
    model:[],
    disabled: 'disabled',
    disableAddCourse: function(){
        if (this.get('course_code').length < 6){
            this.set('disabled', 'disabled');
        } else{
            this.set('disabled', null);
        }
    }.observes('course_code')
});