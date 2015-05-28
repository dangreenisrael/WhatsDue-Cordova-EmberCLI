import Ember from "ember";
/* global linkifyCordova */

export default Ember.Handlebars.makeBoundHelper( function(text) {
    console.log((linkifyCordova(text)));
    return new Ember.Handlebars.SafeString(linkifyCordova(text));
});