define('whats-due-cordova/helpers/linkify-descriptions', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/30/15.
     */
    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (text) {
        if (typeof text === "undefined") {
            return Ember['default'].String.htmlSafe("");
        } else {
            var options = {
                callback: function callback(text, href) {
                    /* Make it open in the default browser */
                    var defaultBrowser = "onclick=\"window.open('" + href + "', '_system')\"";
                    return href ? "<span class=\"link\"" + defaultBrowser + " >" + text + "</a>" : text;
                }
            };
            return Ember['default'].String.htmlSafe(linkify(text, options));
        }
    });

});