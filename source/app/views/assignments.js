import Ember from 'ember';
/* global CustomUI */
/* global pageWidth */
var AssignmentsView = Ember.View.extend({
    afterRender: function(){
        CustomUI.swipeRemove();
    },
    activeElement: false,
    allowSwiping: false,
    startPos: false,
    panMove: function (event) {
        // do something like send an event down the controller/route chain
        var gesture = event.originalEvent.gesture;
        //console.log(gesture);
        var x = gesture.deltaX;

        if (this.allowSwiping){
            //Block Scrolling

            //Swipe
            var percent = 1 - Math.abs(x / pageWidth);
            this.activeElement.css({
                "-webkit-transform": "translate3d(" + x + "px,0,0) scale3d(1,1,1)",
                "opacity": percent
            });
        }
        event.preventDefault();
        return false; // return `false` to stop bubbling
    },
    panStart: function(event){

        var gesture = event.originalEvent.gesture;
        if (Math.abs(gesture.deltaY) < 15){
            this.allowSwiping = true;
            this.activeElement = CustomUI.closest(event, '.removable');
            Ember.$(document).bind('touchmove', function(e) {
                e.preventDefault();
            });
        } else{
            this.activeElement = false;
            this.allowSwiping = false;
        }
    },
    panEnd: function (event) {
        Ember.$(document).unbind('touchmove');
        // do something like send an event down the controller/route chain
        //console.log(this.sendAction('removeAssignment'));
        //console.log(this.get('controller').send('removeAssignment'));
        var gesture         = event.originalEvent.gesture;
        var percent         = Math.abs(gesture.deltaX) / pageWidth;
        var swiped          = percent > 0.3;
        var direction       = gesture.direction;
        if (swiped) {
            CustomUI.complete(this.activeElement, (1-percent)*200 );
            var position;
            if (direction === "left"){
                position = "-100%";
            } else if (direction === "right"){
                position = "100%";
            }
            this.activeElement.css({
                "-webkit-transform": "translate3d(" +position+ ",0,0) scale3d(1,1,1)",
                "opacity": 0
            });
        } else {
//            CustomUI.customAnimate(Ember.$.(this.activeElement), (percent*100) );
            this.activeElement.css({
                "-webkit-transform": "translate3d(0,0,0) scale3d(1,1,1)",
                "opacity": 1
            });
        }
        return false; // return `false` to stop bubbling
    }
});
export default AssignmentsView;