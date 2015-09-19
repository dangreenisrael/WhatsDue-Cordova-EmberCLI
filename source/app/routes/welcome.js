/**
 * Created by Dan on 7/22/15.
 */
import Ember from 'ember';

/* global moment */
/* global CustomFunctions */
export default Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'welcome' });
    }
});