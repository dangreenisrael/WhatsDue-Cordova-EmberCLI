/**
 * Created by Dan on 4/30/15.
 */

import Ember from 'ember';

var Pollster = Ember.Object.extend({
    start: function(){
        this.timer = setInterval(this.onPoll, 5000);
    },
    stop: function(){
        clearInterval(this.timer);
    },
    onPoll: function(){
        // This gets defined when its called
    }
});


export default Pollster;
