/**
 * Created by Dan on 4/30/15.
 */
import Ember from "ember";
/*global linkify */

export default Ember.Handlebars.makeBoundHelper(function(text) {
    if (typeof text === "undefined") {
        return Ember.String.htmlSafe("");
    } else{
        var options = {
            callback: function( text, href ) {
                /* Make it open in the default browser */
                var defaultBrowser = "onclick=\"window.open('"+href+"', '_system')\"";
                return href ? '<span class="link"'+defaultBrowser+' >' + text + '</a>' : text;
            }
        };
        return Ember.String.htmlSafe(linkify(text, options));
    }
});

