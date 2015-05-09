import DS from 'ember-data';

var AssignmentAdapter = DS.LSAdapter.extend({
    namespace: 'whatsdue-assignment'
});

export default AssignmentAdapter;