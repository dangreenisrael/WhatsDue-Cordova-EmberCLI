/**
 * Created by dan on 2014-05-13.
 */


import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    host: 'http://127.0.0.1/app_dev.php',
    namespace: "student"
});