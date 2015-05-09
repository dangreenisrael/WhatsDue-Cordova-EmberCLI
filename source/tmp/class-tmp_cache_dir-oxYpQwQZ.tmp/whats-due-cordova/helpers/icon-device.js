define('whats-due-cordova/helpers/icon-device', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /**
     * Created by Dan on 4/29/15.
     */
    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (name, classes, id) {
        name = Ember['default'].Handlebars.Utils.escapeExpression(name);
        id = Ember['default'].Handlebars.Utils.escapeExpression(id);
        classes = Ember['default'].Handlebars.Utils.escapeExpression(classes);
        return new Ember['default'].Handlebars.SafeString('<img src="assets/icons/ios/' + name + '.png" id="' + id + '" class="' + classes + '"/>');
    });

});