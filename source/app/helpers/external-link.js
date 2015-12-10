import Ember from "ember";

export default Ember.Helper.helper(function(params) {
    var data = "<a onclick=\"window.open('"+params[0]+"', '_system');\">"+params[1]+"</a>";
    return new Ember.String.htmlSafe(data);
});