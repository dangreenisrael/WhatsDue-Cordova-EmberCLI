import Ember from 'ember';
import groupBy from 'ember-group-by';
import ENV from 'whats-due-cordova/config/environment';

/* global device, localforage */
export default Ember.Controller.extend({
    groupedCards: groupBy('due', 'daysAway'),
    due:function() {
        return this.store.peekAll('assignment')
            .filterBy('completed',false)
            .filterBy('archived',false)
            .filterBy('overdue',false)
            .sortBy('due_date');
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived', 'updateCount'),
    overdue:(function() {
        return this.get('model')
            .filterBy('completed',false)
            .filterBy('archived',false)
            .filterBy('overdue',true)
            .filterBy('hidden',false)
            .sortBy('due_date');
    }).property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalDue: function() {
        var dueLength = this.get('due.length');
        if (dueLength > 10){
            return "10+";
        } else{
            return dueLength;
        }
    }.property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    stuffDue: function(){
        return (this.get('model.length') > 0);
    }
    .property('model.@each.due_date', 'model.@each.completed', 'model.@each.archived'),
    totalOverdue: function() {
        var overdueLength = this.get('overdue.length');
        if (overdueLength > 10){
            return "10+";
        } else{
            return overdueLength;
        }
    }.property('model.@each.due_date', 'model.@each.completed'),
    getUpdates: function(){
        let controller = this;
        let baseURL = ENV.host+"/"+ENV.namespace;
        let headers;
        if (ENV.environment === 'development' || ENV.environment === 'wifi') {
            headers =  {"X-Student-Id": 1};
        } else{
            headers = {"X-UUID": device.uuid};
        }
        localforage.getItem('assignmentTimestamp').then(function(timestamp){
            Ember.$.ajax({
                url: baseURL+"/updates/"+timestamp+"/assignments",
                headers: headers
            }).done(function(data) {
                localforage.setItem('assignmentTimestamp', data.meta.timestamp);
                if (data.records.assignment.length > 0){
                    controller.store.pushPayload('assignment', data.records);
                    controller.set('updateCount', Math.random());
                }
            });
        });
    },
    updateCount: 0.1,
    updateTimer: function() {
        let controller=this;
        setInterval(function(){
            Ember.run(this, function() {
                controller.getUpdates();
            });
        }, 5000);
    }.on('init'),
    showOverdue: "hidden",
    actions:{
        getUpdates: function(){
            this.getUpdates();
        },
        showDue: function(){
            this.set('showDue', null);
            this.set('showOverdue', "hidden");
        },
        showOverdue: function(){
            this.set('showOverdue', null);
            this.set('showDue', "hidden");
        }
    }
});