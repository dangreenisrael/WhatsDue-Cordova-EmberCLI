
var CustomFunctions = {

    setStore: function(context){
        this.store = context.store;
    },
    /*
     Analytics
     */
    
    setSetting: function(key, value){
        var settingExists = this.store.hasRecordForId('setting', key);
        if (settingExists) {
            // Update Record
            this.store.findRecord('setting', key).then(
                function (record) {
                    record.set('value', value);
                    record.save();
                })
        } else{
            // Create Record
            this.store.createRecord('setting', {
                id: key,
                value: value
            }).save();
        }
    },
    getSetting: function(key, callback){
        var store = this.store;
        store.findAll('setting').then(function(){
            var settingExists = store.hasRecordForId('setting', key);
            if (settingExists) {
                store.findRecord('setting', key).then(
                    function (record) {
                        var value = record.get('value');
                        callback(value);
                    });
            } else{
                callback(0)
            }
        });
    },

    dealWithUser: function(user){
        //console.log(user.id);
        //mixpanel.identify(user.id);
        //mixpanel.people.set({
        //    "$created":         user.signup_date,
        //    "$last_login":      new Date(),
        //    'System ID':        user.id,
        //    '$first_name':      user.first_name,
        //    '$last_name':       user.last_name,
        //    'Parent\'s Email':  user.parent_email,
        //    'Role':             user.role,
        //    'Over 12':          user.over12
        //});
    },
    setUserProperty: function(property, value){
        var json = {};
        json[property]=value;
        mixpanel.people.set(json);
    }

};