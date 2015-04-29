    /**
 * Created by dan on 2014-05-13.
 */

App.Router.map(function(){
    this.resource('enrolled', function(){
    });

    this.resource('unenrolled', function(){
    });

    this.resource('assignments', {path: '/'}, function(){
    });

    this.resource('completedAssignments', function(){
    });

    this.resource('support', function(){
    });

    this.resource('messages', function(){
    });

    this.resource('reminders', function(){

    });

    this.resource('welcome', function(){

    });
});


App.Route = Ember.Route.extend({

});

App.RemindersRoute = Ember.Route.extend({
    model: function(){
        setTitle('Reminders');
        this.store.find('setReminder');
        return this.store.find('reminder');
    }
});

App.SupportRoute = Ember.Route.extend({
    model: function(){
        setTitle('Support');
    }
});

App.MessagesRoute = Ember.Route.extend({
    model: function(){
        return this.store.find('message');
    }
});

App.UnenrolledRoute = Ember.Route.extend({
    model: function() {
        updateCourses(this);
        setTitle('Add Courses');
        return this.store.find('course');
    }
});

App.EnrolledRoute = Ember.Route.extend({
    model: function() {
        setTitle('My Courses');
        return this.store.find('course');
    }
});

App.AssignmentsRoute = Ember.Route.extend({
    model: function() {
        updateAssignments(this);
        setTitle('Assignments Due');
        return this.store.find('assignment');
    },
    actions: {
        invalidateModel: function() {
            swipeRemove();
            this.refresh();
        }
    },
    afterModel: function() {
        sliderSize();
    }
});


App.CompletedAssignmentsRoute = Ember.Route.extend({
    model: function() {
        updateAssignments(this);
        setTitle('Recently Completed');
        return this.store.find('assignment');
    },
    afterModel: function() {
        putBackable();
    }
});
