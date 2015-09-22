import Ember from "ember";
/* global linkifyCordova */

export default Ember.Helper.helper( function(text) {
    if (typeof text === "undefined") {
        return Ember.String.htmlSafe("");
    } else{
        text = Ember.Handlebars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        return Ember.String.htmlSafe(linkifyCordova(text));
    }
});