import Ember from "ember";

export default Ember.Handlebars.makeBoundHelper( function(link, text) {
    var data = "<a onclick=\"window.open('"+link+"', '_system');\">"+text+"</a>";
    return new Ember.Handlebars.SafeString(data);
});