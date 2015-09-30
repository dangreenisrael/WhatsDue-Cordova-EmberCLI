/**
 * Created by Dan on 5/26/15.
 */
import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
    viewportOptionsOverride: Ember.on('didInsertElement', function() {
        Ember.setProperties(this, {
            viewportSpy: true
        });
    }),
    classNames: ['in-viewport'],
    didEnterViewport() {
        this.sendAction('triggered');
    }
});