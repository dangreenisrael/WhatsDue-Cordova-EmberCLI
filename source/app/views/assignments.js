import Ember from 'ember';
/* global CustomUI */

export default Ember.View.extend({
    afterRender: function(){
       CustomUI.swipeRemove();
        //setTimeout(function(){
        //    new Dragdealer('demo-simple-slider');
        //},1000);
    }
//    activeElement: false,
//    allowSwiping: false,
//    startPos: false,
//    swipePosition: 0,
//    swipeOpacity:1,
//    hello: "display:none",
//    panMove: function (event) {
//        var x = event.originalEvent.gesture.deltaX;
//        //if (this.allowSwiping){
//            //Swipe
//            var percent = 1 - Math.abs(x / pageWidth);
//            //var percent = 1;
//            //console.log(x);
//            //this.currentPos = x;
//            this.get('controller').set('xOffset', x);
//            this.set('swipeOpacity', percent);
//
//            //this.get('controller').get('activeElement').set('style',"-webkit-transform: translate3d(" + x + "px, 0px, 0px) scale3d(1,1,1)");
//
//            console.log(this.activeElement);
//            this.activeElement.css({
//                "opacity": percent,
//                "position": "relative",
//                 "-webkit-transform": "translate3d(" + x + "px,0,0) scale3d(1,1,1)",
//                "perspective": "1000px",
//                "backface-visibility": "hidden",
//                "transform": "translateX("+x+"px)"
//            });
//            //});
//        //}
//        event.preventDefault();
//        return false; // return `false` to stop bubbling
//    },
//    panStart: function(event){
//
//        console.log(this.get('controller').get('activeElement'));
//        //this.set('activeElement', this.get('controller').get('activeElement'));
//
//        var gesture = event.originalEvent.gesture;
//        if (Math.abs(gesture.deltaY) < 15){
//            //this.allowSwiping = true;
//            this.activeElement = CustomUI.closest(event, '.removable');
//            //this.set('activeElement', this.get('controller').get('activeElement'));
//            console.log(this.get('controller').get('activeElement'));
//            //CustomUI.closest(event,'.removable').addClass('swiping');
//            Ember.$(document).bind('touchmove', function(e) {
//                e.preventDefault();
//            });
//        } else{
//            this.activeElement = false;
//            this.allowSwiping = false;
//        }
//    },
//    panEnd: function (event) {
//        Ember.$(document).unbind('touchmove');
//        // do something like send an event down the controller/route chain
//        //console.log(this.sendAction('removeAssignment'));
//        //console.log(this.get('controller').send('removeAssignment'));
//        var gesture         = event.originalEvent.gesture;
//        var percent         = Math.abs(gesture.deltaX) / pageWidth;
//        var swiped          = percent > 0.3;
//        var direction       = gesture.direction;
//        console.log(this);
//        if (swiped) {
//            CustomUI.complete(this.activeElement, (1-percent)*200 );
//            var position;
//            if (direction === "left"){
//                position = "-100%";
//            } else if (direction === "right"){
//                position = "100%";
//            }
//            this.activeElement.css({
//                "-webkit-transform": "translate3d(" +position+ ",0,0)",
//                "opacity": 0
//            });
//        } else {
////            CustomUI.customAnimate(Ember.$.(this.activeElement), (percent*100) );
//            if (this.activeElement){
//                this.activeElement.css({
//                    "-webkit-transform": "translate3d(0,0,0)",
//                    "opacity": 1
//                });
//            }
//        }
//        this.activeElement = false;
//        return false; // return `false` to stop bubbling
//    }
});

///**
// * requestAnimationFrame and cancel polyfill
// */
//(function() {
//    var lastTime = 0;
//    var vendors = ['ms', 'moz', 'webkit', 'o'];
//    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
//        window.cancelAnimationFrame =
//            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
//    }
//
//    if (!window.requestAnimationFrame)
//        window.requestAnimationFrame = function(callback, element) {
//            var currTime = new Date().getTime();
//            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
//                timeToCall);
//            lastTime = currTime + timeToCall;
//            return id;
//        };
//
//    if (!window.cancelAnimationFrame)
//        window.cancelAnimationFrame = function(id) {
//            clearTimeout(id);
//        };
//}());
