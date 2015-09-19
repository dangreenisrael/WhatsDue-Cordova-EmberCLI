/**
 * Created by dan on 2014-05-13.
 */


import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    host: 'http://stage.whatsdueapp.com',
    namespace: "student"
});


//export default DS.RESTAdapter.extend({
//    host: 'http://test.whatsdueapp.com/app_dev.php',
//    namespace: "student"
//});

//export default DS.RESTAdapter.extend({
//    host: 'http://192.168.1.100/app_dev.php',
//    namespace: "student"
//});