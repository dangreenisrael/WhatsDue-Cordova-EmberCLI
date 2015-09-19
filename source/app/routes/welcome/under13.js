import Ember from 'ember';

export default Ember.Route.extend({
    model: function(){
        return this.store.find('student').then(function(records){
            return records.get('firstObject');
        });
    }
});