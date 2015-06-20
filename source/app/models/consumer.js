/**
 * Created by Dan on 5/11/15.
 */

/* Settings */
import DS from 'ember-data';

export default DS.Model.extend({
    "notifications":                DS.attr('boolean'),
    "notification_updates":         DS.attr('boolean'),
    "notification_time_utc":        DS.attr('string'),
    "notification_time_local":      DS.attr('string')
});

