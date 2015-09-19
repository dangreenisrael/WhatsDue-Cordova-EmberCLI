import Ember from "ember";
/* global linkifyCordova */

export default Ember.Handlebars.makeBoundHelper( function(link, text) {
    var data = "<a onclick=\"window.open('"+link+"', '_system');\">"+text+"</a>";
    return new Ember.Handlebars.SafeString(data);
});