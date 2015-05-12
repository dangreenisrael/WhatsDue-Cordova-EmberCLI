/**
 * Created by Dan on 5/11/15.
 */

/* Settings */
import DS from 'ember-data';

var Setting = DS.Model.extend({
    value:         DS.attr('string',  {defaultValue: null})
});

export default Setting;
