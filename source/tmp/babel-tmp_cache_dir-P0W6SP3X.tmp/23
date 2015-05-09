/**
 * Created by Dan on 4/30/15.
 */

import Ember from 'ember';

var Pollster = Ember.Object.extend({
    start: function start() {
        this.timer = setInterval(this.onPoll, 5000);
    },
    stop: function stop() {
        clearInterval(this.timer);
    },
    onPoll: function onPoll() {}
});

export default Pollster;

// This gets defined when its called