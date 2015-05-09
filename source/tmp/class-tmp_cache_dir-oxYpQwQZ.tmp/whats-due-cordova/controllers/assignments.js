define('whats-due-cordova/controllers/assignments', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AssignmentsController = Ember['default'].ArrayController.extend({
        due: (function () {
            var context = this;

            setTimeout(function () {
                var total = context.get('totalDue') + context.get('totalOverdue');
                if (total === 0) {
                    Ember['default'].$('.nothing-due').removeClass('hidden');
                    Ember['default'].$('.day-divider').addClass('hidden');
                } else {
                    Ember['default'].$('.nothing-due').addClass('hidden');
                    Ember['default'].$('.day-divider').removeClass('hidden');
                }
            }, 5);
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalDue: (function () {
            return this.get('due.length');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        totalOverdue: (function () {
            return this.get('overdue.length');
        }).property('model.@each.due_date', 'model.@each.completed'),
        overdue: (function () {
            return this.get('model').filterBy('completed', false).filterBy('archived', false).filterBy('overdue', true).filterBy('hidden', false).sortBy('due_date');
        }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
        actions: {
            removeAssignment: function removeAssignment(assignment) {
                console.log('removed');
                CustomFunctions.trackEvent('Assignment Completed');
                this.store.find('setReminder', { assignment: assignment.get('id') }).then(function (setReminders) {
                    CustomFunctions.removeSetReminders(setReminders);
                });
                assignment.set('completed', true);
                assignment.set('date_completed', Date.now());
                assignment.save();
                this.send('invalidateModel');
            },
            getLatest: function getLatest() {
                this.send('invalidateModel');
            }
        }
    });

    exports['default'] = AssignmentsController;

});