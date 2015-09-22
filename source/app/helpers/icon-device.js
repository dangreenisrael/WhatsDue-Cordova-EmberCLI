/**
 * Created by Dan on 4/29/15.
 */
import Ember from "ember";


export default Ember.Helper.helper( function(name) {
    return new Ember.Handlebars.SafeString('<img src="assets/icons/ios/'+name+'.png"/>');
});