import Ember from 'ember';
/* global CustomUI */
/* global pageWidth */
var AssignmentsView = Ember.View.extend({
    contentDidChange: function() {
        CustomUI.swipeRemove();
    }.observes('controller.filteredData'),
    afterRender: function(){
        CustomUI.swipeRemove();
    },
    hammerOptions: {
    },
    activeElement: null,
    gestures: {
        drag: function (event) {
            // do something like send an event down the controller/route chain
            var x = event.gesture.deltaX;
            var percent = 1 - Math.abs(x / pageWidth);
            this.activeElement.css({
                "-webkit-transform": "translate3d(" + x + "px,0,0) scale3d(1,1,1)",
                "opacity": percent
            });
            return false; // return `false` to stop bubbling
        },
        release: function (event) {
            // do something like send an event down the controller/route chain
            console.log(this.activeElement);
            var deltaX          = event.gesture.deltaX;
            var percent         = Math.abs(deltaX / pageWidth);
            var swiped          = percent > 0.3;
            var direction       = event.gesture.direction;
            var width = this.activeElement.width();
            var distanceRemaining = width - Math.abs(event.gesture.deltaX);
            console.log(percent);
            ///* Prevent wonky scrolling */
            if (!swiped) {
                console.log('Reset');
                CustomUI.fastAnimate(this.activeElement);
                CustomUI.customAnimate(this.activeElement, (percent*750) );
                this.activeElement.css({
                    "-webkit-transform": "translate3d(0,0,0) scale3d(1,1,1)",
                    "opacity": 1
                });
            } else {
                CustomUI.complete(this.activeElement, (1-percent)*500 );
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
            }
            return false; // return `false` to stop bubbling
        },
        touch: function(event){
            this.activeElement = CustomUI.closest(event, '.removable');
        }
    }
});

export default AssignmentsView;
