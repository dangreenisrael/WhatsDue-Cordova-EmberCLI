import DS from 'ember-data';

var ReminderAdapter = DS.LSAdapter.extend({
    namespace: 'whatsdue-reminder'
});

export default ReminderAdapter;
