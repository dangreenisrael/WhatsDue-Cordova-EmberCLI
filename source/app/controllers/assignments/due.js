import Ember from 'ember';
import groupBy from 'ember-group-by';
import ENV from 'whats-due-cordova/config/environment';
/* global localforage */

export default Ember.Controller.extend({
    groupedCards: groupBy('due', 'daysAway'),
    due:function() {
        return this.get('model').
            filterBy('completed',false).
            filterBy('archived',false).
            filterBy('overdue',false).
            sortBy('due_date');
    }.property('model.[]','model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    assignmentsController: Ember.inject.controller('assignments'),
    getUpdates: function(){
        let controller = this;
        let baseURL = ENV.host+"/"+ENV.namespace;
        let headers = ENV.APIHeaders;
        localforage.getItem('assignmentTimestamp').then(function(timestamp){
            Ember.$.ajax({
                url: baseURL+"/updates/"+timestamp+"/assignments",
                headers: headers
            }).done(function(data) {
                controller.store.pushPayload('assignment', data.records);
                let newModel = controller.store.
                    peekAll('assignment').
                    filterBy('archived',false).
                    sortBy('due_date');
                controller.set('due', newModel);
                controller.get('assignmentsController').set('due', newModel);
                localforage.setItem('assignmentTimestamp', data.meta.timestamp);
            });
        });
    },
    updateTimer: function() {
        setInterval(function(){
            Ember.run(this, function() {
               //controller.getUpdates();
            });
        }, 5000);
    }.on('init'),
    loaded: null,
    actions:{
        getUpdates: function(){
            this.getUpdates();
        }
    }
});