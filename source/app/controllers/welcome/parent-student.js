import Ember from 'ember';

/* Migration */
export default Ember.Controller.extend({
    actions: {
        setRole: function(role){
            if (role == "parent"){
                this.set('parentActive', "white");
                this.set('studentActive', "clear");
            } else{
                this.set('studentActive', "white");
                this.set('parentActive', "clear");
            }
            var route = this;
            return this.store.find('student').then(function(records){
                var record =  records.get('firstObject');
                record.set('signup_date', moment().format());
                record.set('role', role);
                record.save();
                route.transitionToRoute('welcome.my-name');
                CustomFunctions.setUserProperty('Role', role);
                Migration.setDefaultSettings();
            });
        }
    }
});