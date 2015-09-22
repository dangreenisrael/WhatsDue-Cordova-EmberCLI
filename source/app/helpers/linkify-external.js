import Ember from "ember";
/* global linkifyCordova */

export default Ember.Helper.helper( function(text) {
    return new Ember.Handlebars.SafeString(linkifyCordova(text));
});