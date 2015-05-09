/**
 * Created by Dan on 4/29/15.
 */
import Ember from "ember";


export default Ember.Handlebars.makeBoundHelper( function(name, classes, id) {
    name = Ember.Handlebars.Utils.escapeExpression(name);
    id = Ember.Handlebars.Utils.escapeExpression(id);
    classes = Ember.Handlebars.Utils.escapeExpression(classes);
    return new Ember.Handlebars.SafeString('<img src="assets/icons/ios/'+name+'.png" id="'+id+'" class="'+classes+'"/>');
});