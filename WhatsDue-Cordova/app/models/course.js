import DS from 'ember-data';

var Course = DS.Model.extend({
    course_name:         DS.attr('string'),
    course_code:         DS.attr('string'),
    instructor_name:     DS.attr('string'),
    admin_id:            DS.attr('string'),
    last_modified:       DS.attr('number'),
    created_at:          DS.attr('number'),
    school_name:         DS.attr('string',  {defaultValue: "IDC Herzliya"}),
    enrolled:            DS.attr('boolean', {defaultValue: true}),
    archived:            DS.attr('boolean', {defaultValue: false}),
    assignments:         DS.hasMany('assignment'),
    hidden: function(){
        if (this.get('archived') === true){
            return "hidden";
        }
        else{
            return " ";
        }
    }.property('archived')
});

export default Course;
