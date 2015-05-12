/* Start Moment */

/* End Moment */

/* Start Global Variables */
var pageWidth = $(window).width();
var currentPage = 1;
var page = {
    0 : - 0,
    1 : - pageWidth,
    2 : - pageWidth * 2
};

/* End Global Variables */


/* Start Helper Functions */

var CustomUI = {
    closest: function(event, selector) {
        return Ember.$(event.target).closest(selector)
    },
    animate: function(element) {
        element.addClass('animate');
        setTimeout(function () {
            element.removeClass('animate')
        }, 300);
    },
    fastAnimate: function(element) {
        element.addClass('fastAnimate');
        setTimeout(function () {
            element.removeClass('fastAnimate')
        }, 100);
    },
    customAnimate: function(element, ms) {
        element.css('transition', 'all '+ms+'ms linear');
        console.log('all '+ms+'s linear');
        setTimeout(function () {
            element.css('transition', 'none');
        }, ms + 200);
    },
    complete: function(element, ms) {
        CustomUI.customAnimate(element, ms);
        setTimeout(function () {
            element.siblings('.reveal').click();
        }, ms);
    },
    toggleMenu: function() {
        var element = $('#contentContainer');

        // fastAnimate(element);

        document.getElementById('contentContainer').scrollTop = 0;
        if (currentPage >= 1) {
            element.css({"-webkit-transform": "translate3d(0,0,0) scale3d(1,1,1)", "overflow": "hidden"});
            currentPage = 0;
        } else {
            currentPage = 1;
            element.css({"-webkit-transform": "translate3d(-33.333%,0,0) scale3d(1,1,1)", "overflow": "visible"});
        }
        if (typeof cordovaLoaded != 'undefined') {
            cordova.plugins.Keyboard.close();
        }

    },
    goHome: function(){
        var element = $('#contentContainer');
        CustomUI.animate(element);
        element.css({"-webkit-transform": "translate3d(-33.33%,0,0) scale3d(1,1,1)", "overflow": "auto"});
        currentPage = 1;
    },

    sliderSize: function() {
        var assignmentWidth;
        assignmentWidth = Ember.$(document).width() - 180;
        var style = '#newAssignments .slider .info { width:' + assignmentWidth + 'px; }';
        Ember.$('#dynamicStyle').text(style);
    },

/* End Helper Functions */

    putBackable: function() {
        /* Click Events */

        setTimeout(function () {
            var removeButton = $('.putBackable img');
            var putBackable = $('.putBackable');
            removeButton.off('click');
            putBackable.siblings('.reveal').off();
            putBackable.not('.keep').siblings('.reveal').click(function () {
                $(this).parent('.slider');
                var context = this;
                setTimeout(function () {
                    $(context).parent('.slider').detach();
                }, 1);
            });

            removeButton.on('click', function (event) {
                event.stopPropagation();
                var parent = $(this).closest('.putBackable');
                if (parent.hasClass('open')) {
                    parent.css("-webkit-transform", "translate3d(0,0,0) scale3d(1,1,1)");
                    parent.removeClass('open');
                } else {
                    putBackable.removeClass('open');
                    putBackable.css("-webkit-transform", "translate3d(0,0,0) scale3d(1,1,1)");
                    parent.css("-webkit-transform", "translate3d(63px,0,0) scale3d(1,1,1)");
                    parent.addClass('open');
                }
            });

            putBackable.on('click', function () {
                if (($(this).hasClass('open'))) {
                    $(this).removeClass('open');
                    $(this).css("-webkit-transform", "translate3d(0,0,0) scale3d(1,1,1)");
                }
            });

            /*
             * Adding Course Stuff
             */
            var addCourse = $('#addCourse');
            addCourse.find('input').keyup(function () {
                $('.courses .bubble').addClass('hidden');
                var count = $(this).val().length;
                var button = addCourse.find('button');
                if (count >= 6) {
                    button.removeClass('disabled');
                    button.disable(false);
                    $(this).val($(this).val().substring(0, 6))

                } else {
                    button.addClass('disabled');
                    button.disable(true);
                }

            });

            /*
             * Run if no courses are added
             */
            var courseCount = $('.courses .slider').length;
            if (!courseCount) {
                $('.courses .bubble').removeClass('hidden');
            }

        }, 1)
    },



    setTitle: function(title) {
        $('#page-title').html(title);
    },
    swipeRemove: function() {
        setTimeout(function () {


        Ember.$('nav > .due').on('click', function () {
            Ember.$('#assignments-due').show();
            Ember.$('#assignments-overdue').hide();

        });
        Ember.$('nav > .overdue').on('click', function () {
            Ember.$('#assignments-due').hide();
            Ember.$('#assignments-overdue').show();
        });

    }, 1);
    },
    swiperSet: false,

    showSupport: function(){
        var content = $('#support');
        $.get("http://whatsdueapp.com/live-content/support.php", function (data) {
            content.html(data);
        });

        $.ajax("http://whatsdueapp.com/live-content/support.php")
            .done(function (data) {
                content.html(data);
            })
            .fail(function () {
                $.get("live-content/support.html", function (data) {
                    welcome.html(data);
                    initializeSlider();
                });
            })
    },

    makeSpinnable: function() {
        setTimeout(function () {
            $('.add-something img, .reveal img').on('click', function (element) {
                $(this).addClass('spin')
            })
        }, 50);
    },
    reminderTips: function() {
        var reminders = $('#reminders');
        var time = $('input.time');
        if (!reminders.find('.putBackable').length) {
            reminders.find('.bubble').removeClass('hidden');
            reminders.find('figure').on('click', function () {
                reminders.find('.bubble').addClass('hidden');
            });
        }
    },
    share: function(message) {
        if (typeof cordovaLoaded != 'undefined') {
            window.plugins.socialsharing.share(message + "\n\nSent via ",
                null,
                null, //'http://whatsdueapp.com/img/logo-text-white.png',
                'http://whatsdueapp.com')
        } else {
            console.log(message);
        }
    },
    shareModal: function(assignment, course, message) {
        $("#share-modal").modal({
        onShow: function (dialog) {
            // Access elements inside the dialog
            $(".assignment-name", dialog.data).text(assignment);

            /* Prevent accidental click*/
            setTimeout(function () {
                $(".button", dialog.data).hover(function () {
                        $(this).css('opacity', '0.5')
                    }, function () {
                        $(this).css('opacity', '1')
                    }
                );

                $(".share", dialog.data).click(function () {
                    share(message);
                    setTimeout(function () {
                            $.modal.close()
                        },
                        20);
                    trackEvent('Assignment Shared');
                    return false;
                });
                $(".report", dialog.data).click(function () {
                    var subject = "WhatsDue%20Change%20Report";
                    var body = "School:%20" + getSchool() + "%0D%0ACourse:%20" + course + "%0D%0AAssignment:%20" + assignment + "%0D%0A-------------------------------------------%0D%0APlease%20write%20your%20correction%20here:";
                    window.location = 'mailto:aaron@whatsdueapp.com?subject=' + subject + '&body=' + body;
                    $.modal.close();
                    trackEvent('Assignment Reported');
                });
                $(".close", dialog.data).click(function () {
                    $.modal.close();
                    trackEvent('Assignment Reported');
                });
            }, 200)
        }
    });
    },

    filter: function(textArea) {
        $('#' + textArea).keyup(function () {
            var searchTerm = $(this).val().toUpperCase();
            $('.list li').each(function () {
                var text = $(this).find('.courseCode').text().toUpperCase().trim();
                if ((searchTerm == text) && (searchTerm != "" )) {
                    $(this).removeClass('hidden');
                } else {
                    $(this).addClass('hidden');
                }
            });
        });
    },
    readyFunction: function(){

        /*
         * Main Page Control
         */
        // Set dimensions relative to page
        console.log('ready');
        var headerHeight = $('#appHeader').outerHeight();
        var pageHeight = $(window).height() - headerHeight;
        Ember.$('div#content, div#content > div > div ').css({'width':pageWidth});
        Ember.$('div#contentContainer').css({
            'height': pageHeight,
            "-webkit-transform":"translate3d(-33.3333%,0,0) scale3d(1,1,1)"
        });
       Ember. $('div#content > div').css({'width': pageWidth*3});
        CustomUI.sliderSize();
        Ember.$( window ).resize(function() {
            var pageWidth = Ember.$(window).width();
            var headerHeight = Ember.$('#appHeader').outerHeight();
            var pageHeight = Ember.$(window).height() - headerHeight;
            Ember.$('div#content, div#content > div > div ').css('width',pageWidth);
            Ember.$('div#contentContainer').css('height', pageHeight);
            Ember.$('div#content > div').css({'width': pageWidth*3, 'margin-top':headerHeight});
            CustomUI.sliderSize();
        });

        /*
         * Fix for "Blank text bug
         */
        Ember.$('head').append('<style type="text/css">* {font-family:GibsonFixed, sans-serif;}</style>');

        /*
         * Helper Functions
         */

        var context = this;

        /* Toggles */

        Ember.$('#menuToggle, #left').off('click').on('click', function(){
            console.log('toggle');
            CustomUI.toggleMenu();
        });


        Ember.$('body').on({
            'touchmove': function(e) {
                $('.removable').css({
                    "-webkit-transform":"translate3d(0,0,0) scale3d(1,1,1)",
                    "opacity":1
                });
                if(typeof cordovaLoaded != 'undefined'){
                    cordova.plugins.Keyboard.close();
                }
            }
        });
    }

};

/*
 * Extend jQuery to allow changing disabled state
 */
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});

moment.locale('en', {
    calendar : {
        lastDay : '[Yesterday] ',
        sameDay : '[Today] ',
        nextDay : '[Tomorrow]',
        nextWeek : '[This] dddd',
        sameElse : 'dddd MMM Do'
    },
    relativeTime : {
        future: "%s ",
        past:   "%s",
        s:  "seconds",
        m:  "a minute",
        mm: "%d minutes",
        h:  "an hour",
        hh: "%d hours",
        d:  "a day",
        dd: "%d days",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});
