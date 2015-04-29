/**
 * Created by dan on 2014-05-13.
 */

var OS = "ios";
var loaderObj = {

    templates : [
        'application.hbs',
        'assignments.hbs',
        'completedAssignments.hbs',
        'enrolled.hbs',
        'unenrolled.hbs',
        'support.hbs',
        'messages.hbs',
        'reminders.hbs'
    ]
};


loadTemplates(loaderObj.templates);
//This function loads all templates into the view
function loadTemplates(templates) {
    $(templates).each(function() {
        var tempObj = $('<script>');
        tempObj.attr('type', 'text/x-handlebars');
        var dataTemplateName = this.substring(0, this.indexOf('.'));
        tempObj.attr('data-template-name', dataTemplateName);
        $.ajax({
            async: false,
            type: 'GET',
            url: 'templates/' + this,
            success: function(resp) {
                tempObj.html(resp);
                $('body').append(tempObj);
            }
        });
    })
}

var helperObj = {
    templates : [
    ]
};


loadHelpers(helperObj.templates);
//This function loads all templates into the view
function loadHelpers(templates) {
    $(templates).each(function() {
        var tempObj = $('<script>');
        tempObj.attr('type', 'text/x-handlebars');
        var name = this.substring(0, this.indexOf('.'));
        var firstHalf = name.substring(0, name.indexOf('_'));
        var secondHalf = name.substr(name.indexOf("_") + 1);
        var dataTemplateName = firstHalf+"/"+secondHalf;

        tempObj.attr('data-template-name', dataTemplateName);
        $.ajax({
            async: false,
            type: 'GET',
            url: 'templates/' + this,
            success: function(resp) {
                tempObj.html(resp);
                $('body').append(tempObj);
            }
        });
    })
}

var App = Ember.Application.create();

App.ApplicationAdapter = DS.LSAdapter.extend({
    namespace: 'whatsdue'
});


App.Pollster = Ember.Object.extend({
    start: function(){
        this.timer = setInterval(this.onPoll, 5000);
    },
    stop: function(){
        clearInterval(this.timer);
    },
    onPoll: function(){
        // This gets defined when its called
    }
});

Ember.Handlebars.helper('icon', function(name, classes, id) {
    name = Handlebars.Utils.escapeExpression(name);
    id = Handlebars.Utils.escapeExpression(id);
    classes = Handlebars.Utils.escapeExpression(classes);
    return new Ember.Handlebars.SafeString('<img src="assets/icons/'+OS+'/'+name+'.png" id="'+id+'" class="'+classes+'"/>');
});

Ember.Handlebars.helper('linkify', function(text) {
    if (typeof text === "undefined") {
        return Ember.String.htmlSafe("");
    } else{
        var options = {
            callback: function( text, href ) {
                /* Make it open in the default browser */
                var defaultBrowser = "onclick=\"window.open('"+href+"', '_system')\"";
                return href ? '<span class="link"'+defaultBrowser+' >' + text + '</a>' : text;
            }
        };
        return Ember.String.htmlSafe(linkify(text, options));
    }
});