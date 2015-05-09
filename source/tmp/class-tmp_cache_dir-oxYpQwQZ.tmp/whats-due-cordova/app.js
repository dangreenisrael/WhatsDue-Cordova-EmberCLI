define('whats-due-cordova/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'whats-due-cordova/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

    'use strict';

    var App;

    Ember['default'].MODEL_FACTORY_INJECTIONS = true;

    App = Ember['default'].Application.extend({
        modulePrefix: config['default'].modulePrefix,
        podModulePrefix: config['default'].podModulePrefix,
        Resolver: Resolver['default'],
        outputPaths: {
            app: {
                css: {
                    'themes/speech-bubbles': '/app/styles/speech-bubbles.less'
                }
            }
        }
    });

    loadInitializers['default'](App, config['default'].modulePrefix);

    exports['default'] = App;

});