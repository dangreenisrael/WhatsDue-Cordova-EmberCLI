/**
 * Created by dan on 2014-05-13.
 */


import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    host: 'http://test.whatsdueapp.com/app_dev.php',
    namespace: "api/v1/student"
});