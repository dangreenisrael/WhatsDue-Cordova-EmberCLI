import Ember from 'ember';

var UnenrolledView = Ember.View.extend({
    contentDidChange: function() {
        putBackable();
    }.observes('controller.filteredData'),
    afterRender: function(){
        if (cordovaLoaded == true){
            setTimeout(function(){
                cordova.plugins.Keyboard.show();
                $('#search').focus();
            }, 500)
        }
        makeSpinnable();
        setTimeout(function() {
            filter('search')
        }, 1);
    }
});

export default UnenrolledView;
