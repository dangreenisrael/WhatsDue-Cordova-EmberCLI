/**
 * Created by Dan on 7/22/15.
 */
import Ember from 'ember';

export default Ember.Route.extend({
    renderTemplate: function() {
        this.render({ outlet: 'welcome' });
    }
});