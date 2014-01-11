// Backbone.slidethread (used for sliding a Thread or ListItem back/forth
    // - made by Nick
(function (factory) {

    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone'], factory);
    } else {
        // Browser globals
        factory(_, Backbone);
    }
}(function (_, Backbone) {

    "use strict";


    var get_point_position = function(e){
        // Returns current (or last known) X,Y coordinates of a mouse or finger
        var point_x = 0,
            point_y = 0;

        // Get positions
        
        if(typeof e.pageX != 'undefined'){
            // Mouse
            
            point_x = e.pageX;
            point_y = e.pageY;
            
        } else {
            // Touch
            
            // Only 1 finger allowed
            if(e.originalEvent.touches.length != 1){
                // Multiple fingers

                // Did we recently have 1 finger on there?
                if(e.originalEvent.changedTouches.length == 1){
                    point_x = e.originalEvent.changedTouches[0].pageX;
                    point_y = e.originalEvent.changedTouches[0].pageY;
                } else {
                    return {};

                }

            } else {
                point_x = e.originalEvent.touches[0].pageX;
                point_y = e.originalEvent.touches[0].pageY;
            }

        }

        return {
            x: point_x,
            y: point_y
        };
    };

    _.extend(Backbone.View.prototype, {


        thread_move_x_threshold:    0.2, // default: .2
        thread_move_y_threshold:    50, // default: 50
        slider_max_elapsed:         1500, // default: 1500 (milliseconds)
        slider_restrict_drag:       0.50, // default: 0.40

        slideActions: {
            'dragLeftPastThreshold' : function(){
                alert('dragLeft');
            },
            'dragRightPastThreshold' : function(){
                alert('dragRight');
            }
        },

        viewContext: null,
        initialize_slider: function($elem, viewContext){
            // Builds the slider with actions for left-right
            // - css classes get added for left/right swipes (to keep most markup in HTML/CSS)
            // - events also get triggered (by default)

            // cancel on MultiSelect (touch multiple, then click multiple)
            var that = this;
            this.viewContext = viewContext;
            that.$parent_controller = $elem.parents('.slide-list-items');
            // console.log(that.$parent_controller);

            // console.log($elem);
            $elem.each(function(index, elem){

                // console.log(this); // li element - HTML

                // this.viewContext = viewContext
                $(this).data('$top', $($(this).find('.slide-list-item__top').get(0)));
                if(App.Data.usePg){
                    // Unbind before rebinding
                    $(this).off('touchstart');
                    $(this).off('touchmove');
                    $(this).off('touchend');
                    $(this).off('touchcancel');

                    $(this).on('touchstart',  $.proxy(that.slider_builder.start, that));
                    $(this).on('touchmove',   $.proxy(that.slider_builder.move, that));
                    $(this).on('touchend',    $.proxy(that.slider_builder.end, that));
                    $(this).on('touchcancel', $.proxy(that.slider_builder.cancel, that));
                } else {
                    // Unbind before rebinding
                    $(this).off('mousedown');
                    $(this).off('mousemove');
                    $(this).off('mouseup');
                    $(this).off('mouseleave');

                    $(this).on('mousedown',   $.proxy(that.slider_builder.start, that));
                    $(this).on('mousemove',   $.proxy(that.slider_builder.move, that));
                    $(this).on('mouseup',     $.proxy(that.slider_builder.end, that));
                    $(this).on('mouseleave',  $.proxy(that.slider_builder.cancel, that));
                }


            });

            // Load

        },

        slider_builder: {
            
            revert: function(elem, immediate_removal){
                var that = this;
                console.log('reverting');

                var $x = $(elem);
                $(elem).removeClass('touch_start');
                $(elem).removeClass('slide-list-item__tripped');
                $(elem).removeClass('slider-complete');
                if(immediate_removal){
                    // Remove immediately
                    $(elem).data('$top').css({
                        left: 0,
                        opacity: 1
                    });
                    console.log('Immediate removal');

                    $(elem).removeClass('sliding-left');
                    $(elem).removeClass('sliding-right');
                } else {
                    // Animate back
                    // - could potentially cause problems
                    $(elem).data('$top').animate({
                        left: 0,
                        opacity: 1
                    },
                    {
                        queue: false,
                        complete: function(){
                            $x.removeClass('sliding-left');
                            $x.removeClass('sliding-right');
                        }
                    });
                }

            },

            start: function(e){
                var that = this,
                    elem = e.currentTarget;

                // e.preventDefault();

                console.log(this);
                console.log($(elem).data('$top'));
                // this = $('.slide-list-item')

                // var $parent_controller = $(elem).parents('.slide-list-items');

                // Already in multi-select mode?
                if(that.$parent_controller.hasClass('multi-select-mode')){

                    // // Already selected?
                    // if($(elem).hasClass('multi-selected')){
                    //  // un-selected
                    //  $(elem).removeClass('multi-selected');

                    //  // Trigger check for anybody else selecte (or revert from display)
                    //  $parent_controller.trigger('multi-change');


                    // } else {
                    //  // select row
                    //  $(elem).addClass('multi-selected');

                    // }
                    

                    // return;

                } else {

                    // Are two fingers being used?
                    if(App.Data.usePg){
                        if(e.originalEvent.touches.length > 1){
                            // multi-finger

                            // add touch to all events
                            $(elem).addClass('touch_start');
                            $('.touch_start').addClass('multi-selected');

                            // might need to put in a delay here...
                            // - if it has trouble removing touch_start, then add a timer
                            $('.touch_start').removeClass('touch_start');

                            // $parent_controller.addClass('multi-select-mode');
                            that.$parent_controller.trigger('multi-change');

                            // clog('===firing');
                            return;
                        }
                    }
                }

                var coords = get_point_position(e);
                if(!coords.y){
                    // clog('Failed y');
                    console.log('failed y');
                    return;
                }

                // Add Class
                $(elem).addClass('touch_start');

                // Store original finger position
                $(elem).attr('finger-position-x',coords.x);
                $(elem).attr('finger-position-y',coords.y);

                // Store total amount moved
                $(elem).attr('x-total-diff',0);
                $(elem).attr('y-total-diff',0);

                // Store time started
                // - prevent firing if held for awhile
                $(elem).attr('finger-time',new Date().getTime());

            },

            move: function(e){
                var that = this,
                    elem = e.currentTarget;

                // Are we looking at this guy right now?
                if($(elem).hasClass('previewing')){
                    return false;
                }
                if($(elem).hasClass('slider-complete')){
                    return false;
                }
                
                if($(elem).hasClass('touch_start')){

                    // Get coordinates
                    var coords = get_point_position(e);
                    if(!coords.y){
                        return;
                    }

                    // Still hovering over this guy? 
                    var this_x = $(elem).attr('finger-position-x');
                    var this_y = $(elem).attr('finger-position-y');

                    var x_diff = coords.x - this_x;
                    var y_diff = coords.y - this_y;

                    // Add diff to existing diff values
                    var total_x_diff = parseInt($(elem).attr('x-total-diff'), 10) + Math.abs(x_diff);
                    var total_y_diff = parseInt($(elem).attr('y-total-diff'), 10) + Math.abs(y_diff);
                    $(elem).attr('x-total-diff', total_x_diff);
                    $(elem).attr('y-total-diff', total_y_diff);

                    // Moving up/down or sideways?
                    // - only called the first time
                    if(Math.abs(x_diff) < Math.abs(y_diff) || Math.abs(x_diff) < 5){
                        // console.log('x_diff > y_diff');
                        return;
                    }
                    e.preventDefault();


                    // if(Math.abs(x_diff) < 30 && total_x_diff < 30){
                    //     // Not moving yet, only moved 20 pixels
                    //     console.log('not yet 20');
                    //     return;
                    // }

                    // Restrict movement to 40% pixels left/right (150 px??)
                    if(that.slider_restrict_drag){
                        var max_x = $(elem).width() * that.slider_restrict_drag;
                        if(x_diff < (max_x * -1)){
                            x_diff = -1 * max_x; // 150
                        }
                        if(x_diff > max_x){
                            x_diff = max_x;
                        }
                    }

                    // var $parent_controller = $(elem).parents('.slide-list-items');

                    // Already in multi-select mode?
                    if(that.$parent_controller.hasClass('multi-select-mode')){
                        return;
                    }

                    // Moved finger/mouse too far vertically?
                    // - revert
                    // - do it over a timeframe? 
                    y_diff = Math.abs(y_diff);
                    if(y_diff > that.thread_move_y_threshold){ // || total_y_diff > that.thread_move_y_threshold*2){
                        // Revert! 
                        // App.Plugins.Minimail.revert_box(this);
                        console.log('revert1');
                        console.log(y_diff);
                        that.slider_builder.revert(elem);
                        // console.log(total_y_diff);

                        return;
                    }

                    // Disable vertical scrolling
                    // console.log('disabling vertical scroll');
                    // $(elem).parents('.scroller').css('overflow-y','hidden');

                    // Move it left-right the same amount as has already been moved
                    // - maximum of 50% movement
                    $(elem).data('$top').css({
                        position: 'relative',
                        left: x_diff
                    });
                    // console.log(x_diff);

                    var x_ratio_diff = Math.abs(x_diff / $(elem).width());


                    // Get direction of travel
                    var this_last_x = parseInt($(elem).attr('last-position-x'), 10);
                    if(coords.x != this_last_x){
                        $(elem).attr('last-position-x',coords.x);
                        if(coords.x > this_last_x){
                            $(elem).attr('last-x-dir',1);
                        } else {
                            $(elem).attr('last-x-dir',-1);
                        }
                    }

                    // Figure out which color to show as the bg
                    if(x_diff > 0){
                        // Dragging right
                        // - take an action
                        $(elem).addClass('sliding-right');
                        $(elem).removeClass('sliding-left');
                    } else {
                        // Dragging left
                        // - delaying
                        $(elem).addClass('sliding-left');
                        $(elem).removeClass('sliding-right');

                        // Change text to match
                        // - based on how far you pull it

                        // 2 options for delay when dragging
                        // - a few hours
                        // - select from list

                        // Doesn't take into account the why...?
                        // - lets go with the assumption that I'll remember the 'why' most of the time
                        // - keep it an extra step to do why, before saving

                        // // Past threshold for Option 1?
                        // // if(x_ratio_diff > .50){
                        // //  $(this).parents('.thread').find('.thread-bg-time p').html('Pick a Delay');
                        // // } else if(x_ratio_diff > App.Credentials.thread_move_x_threshold){
                        // if(x_ratio_diff > that.thread_move_x_threshold){
                        //     // $(this).parents('.thread').find('.thread-bg-time p').html('A Few Hours');
                        //     $(this).parents('.thread').find('.thread-bg-time p').html('Leisure');
                        // } else {
                        //     // Remove any text that is there
                        //     // $(this).parents('.thread').find('.thread-bg-time p').html('&nbsp;');
                        //     $(this).parents('.thread').find('.thread-bg-time p').html('Leisure');
                        // }


                    }

                    // Add class for tripped
                    if(x_ratio_diff > that.thread_move_x_threshold){
                        $(elem).addClass('slide-list-item__tripped');
                    } else {
                        $(elem).removeClass('slide-list-item__tripped');
                    }


                    // clog(x_diff + ', ' + y_diff);


                    // Figure out how far left-right the finger has moved
                }


            },

            end: function(e){
                var that = this,
                    elem = e.currentTarget;

                console.log('ENDENDENDENDEND');
                
                // $(elem).parents('.scroller').css('overflow-y','auto');

                if($(elem).hasClass('slider-complete')){

                    // shorttap or longtap
                    var newTime = new Date().getTime();
                    var elapsed = newTime - parseInt($(elem).attr('finger-time'), 10);
                    if(elapsed < 300 && !that.$parent_controller.hasClass('multi-select-mode')){
                        console.log('shorttap1');
                        $(elem).trigger('shorttap-undo', this);
                    } else {
                        // Do not allow longtap on "Undo" type elements (by design, can't think of a scenario where it is necessary)
                        // $(elem).trigger('longtap', this);
                    }

                    return;
                }
                if($(elem).hasClass('touch_start')){

                    // // Remove 'tripped' ? (any reason not to?)
                    // $(elem).removeClass('slide-list-item__tripped');
                    
                    var coords = get_point_position(e);
                    if(!coords.y){
                        return;
                    }

                    var this_x = $(elem).attr('finger-position-x');
                    var this_y = $(elem).attr('finger-position-y');

                    var x_diff = coords.x - this_x;
                    var y_diff = coords.y - this_y;

                    var x_ratio_diff = Math.abs(x_diff / $(elem).width());

                    // var $thread = $(this).parents('.thread');
                    // var $parent_controller = $(elem).parents('.slide-list-items');
                    // // Already in multi-select mode?
                    // if($parent_controller.hasClass('multi-select-mode')){
                    //  return;
                    // }

                    // Get direction of travel
                    // - must match the direction we are intending to go (cannot have gone slightly backwards)
                    var direction_of_travel = parseInt($(elem).attr('last-x-dir'), 10);


                    if(!$(elem).hasClass('previewing') && x_ratio_diff > that.thread_move_x_threshold && !that.$parent_controller.hasClass('multi-select-mode')){
                        // Moved far enough to take an action (delay/done)

                        // var thread_id = $(this).parents('.thread').attr('data-id');

                        // Swiped fast enough?
                        var newTime = new Date().getTime();
                        var elapsed = newTime - parseInt($(elem).attr('finger-time'), 10);
                        if(elapsed > that.slider_max_elapsed){
                            // Not fast enough, took more than 1 second

                            // // Revert back to original position
                            console.log('revert_time1');
                            that.slider_builder.revert(elem);
                            return false;
                        }



                        // Which action to take?
                        if(x_diff > 0){
                            // Sliding right
                            // - mark as done
                            if(direction_of_travel != 1){
                                // Went the wrong direction for a moment, so reverting
                                // App.Plugins.Minimail.revert_box(this);
                                // alert('revert4');
                                console.log('wrong_dir1');
                                that.slider_builder.revert(elem);
                                return false;
                            }

                            that.trigger('slide_action_dragRightPastThreshold', this);

                            // App.Utils.toast('Marked as done');

                            // Mark as Complete
                            $(elem).addClass('slider-complete');

                            // App.Plugins.Minimail.saveAsDone(thread_id, true)
                            //     .then(function(){
                            //         // emit thread.delay 
                            //         App.Events.trigger('Thread.done', thread_id);
                            //     }); 

                            // // Scroll the window
                            // if($(this).parents('.thread').is(':last-child')){
                            //     var now_scroll_height = $(this).parents('.threads_holder').scrollTop();
                            //     $(this).parents('.threads_holder').scrollTo(now_scroll_height - 74,500);
                            // }

                            // // Hide it
                            // // $(this).parents('.thread').slideUp('slow');
                            // $(elem).find('.slide-list-item__top').animate({
                            //     left: $(elem).width()
                            //     // opacity: 0
                            // },{
                            //     duration: 500,
                            //     complete: function(){
                            //         // $(this).parents('.thread').slideUp();
                            //         $(elem).removeClass('touch_start');
                            //     }
                            // });

                        } else {
                            // Sliding left
                            // - bring up delay screen
                            
                            if(direction_of_travel != -1){
                                // Went the wrong direction for a moment, so reverting
                                // App.Plugins.Minimail.revert_box(this);
                                // alert('revert5');
                                console.log('wrong_dir2');
                                that.slider_builder.revert(elem);
                                return;
                            }

                            // App.Utils.toast('Delayed');

                            // Move further to the left

                            // // Hide it
                            // // $(this).parents('.thread').slideUp('slow');
                            // $(elem).find('.slide-list-item__top').animate({
                            //     left: -1 * $(elem).width()
                            // },{
                            //     complete: function(){
                            //         // $(this).parents('.thread').slideUp();
                            //         $(elem).removeClass('touch_start');
                            //     }
                            // });

                            // Mark as Complete
                            // - includes CSS for moving the thing
                            $(elem).addClass('slider-complete');
                            
                            // Trigger event on View
                            that.trigger('slide_action_dragLeftPastThreshold', this);

                            // // emit thread.delay 
                            // App.Events.trigger('Thread.label', {
                            //     thread_id: thread_id,
                            //     label: 'Leisure'
                            // });
                            // console.info('Marked as labeled!');

                            // // Save to leisure
                            // Api.event({
                            //     data: {
                            //         event: 'Thread.action',
                            //         obj:  {
                            //             '_id' : thread_id, // allowed to pass a thread_id here
                            //             'action' : 'archive'
                            //         }
                            //     },
                            //     success: function(resp){

                            //     }
                            // });
                            // Api.event({
                            //     data: {
                            //         event: 'Thread.action',
                            //         obj:  {
                            //             '_id' : thread_id, // allowed to pass a thread_id here
                            //             'action' : 'label',
                            //             'label' : 'Leisure'
                            //         }
                            //     },
                            //     success: function(resp){

                            //     }
                            // });

                            // // Mark as finished
                            // $(this).parents('.thread').addClass('finished');

                            // // Alter text
                            // $(this).parents('.thread').find('.thread-bg-time p').html('Leisure');

                            // // $(this).parents('.thread').find('.thread-bg-time p').html('A Few Hours');

                            // // Used to be a delay chooser

                            // // // Already delayed, because "Immediate" has no effect here
                            // // // alert($thread.attr('data-thread-type'));
                            // // if($thread.attr('data-thread-type') == 'delayed'){
                            // //  App.Utils.Notification.toast('Already delayed');
                            // //  App.Plugins.Minimail.revert_box(this);
                            // //  return false;
                            // // }

                            // // $(this).parents('.thread').find('.thread-bg-time p').html('Immediate');

                            // // // Make wait_for be A Few Hours (or immediate)
                            // // $(this).parents('.thread').addClass('finished');

                            // // // Scroll the window
                            // // // - if last element
                            
                            // // if($(this).parents('.thread').is(':last-child')){
                            // //  var now_scroll_height = $(this).parents('.threads_holder').scrollTop();
                            // //  $(this).parents('.threads_holder').scrollTo(now_scroll_height - 74, 500);
                            // // }

                            // // // Save delay
                            // // // var delay_seconds = 60 * 60 * 3; // 3 hours
                            // // var delay_seconds = 0; // immediate
                            // // var now = new Date();
                            // // var now_sec = parseInt(now.getTime() / 1000, 10);
                            // // var in_seconds = now_sec + (delay_seconds);//(60*60*3);

                            // // // save the delay
                            // // App.Plugins.Minimail.saveNewDelay(thread_id,in_seconds,delay_seconds)
                            // //  .then(function(){

                            // //      // emit event
                            // //      App.Events.trigger('Thread.delay', thread_id);
                            // //  });
                        }

                    } else {
                        // Did not move far enough
                        // - trigger a "shorttap" or "longtap" event on thread-preview

                        // Total distance traveled too far?
                        var x_total_diff = parseInt($(elem).attr('x-total-diff'), 10) + Math.abs(x_diff);
                        var y_total_diff = parseInt($(elem).attr('y-total-diff'), 10) + Math.abs(y_diff);
                        if(x_total_diff < 40 && y_total_diff < 10){
                            // Didn't travel too far

                            // shorttap or longtap
                            var newTime = new Date().getTime();
                            var elapsed = newTime - parseInt($(elem).attr('finger-time'), 10);
                            if(elapsed < 300){

                                // Triggered a short_tap when in multi-select mode?
                                if(that.$parent_controller.hasClass('multi-select-mode')){
                                    
                                    // Already selected?
                                    if($(elem).hasClass('multi-selected')){
                                        // un-selected
                                        $(elem).removeClass('multi-selected');

                                        // Trigger check for anybody else selecte (or revert from display)
                                       that.$parent_controller.trigger('multi-change');


                                    } else {
                                        // select row
                                        $(elem).addClass('multi-selected');

                                    }
                                    
                                } else {
                                    console.log('shorttap2');
                                    $(elem).trigger('shorttap', this);
                                }

                            } else {
                                $(elem).trigger('longtap', this);
                            }

                        }

                        // alert('revert7');
                        console.info('revert7');

                        // Revert back to original position
                        that.slider_builder.revert(elem, true);


                    }
                }
                    

            },

            cancel: function(e){
                var that = this,
                    elem = e.currentTarget;

                // $(elem).parents('.scroller').css('overflow-y','auto');
                
                if($(elem).hasClass('slider-complete')){
                    $(elem).removeClass('touch_start');
                    return false;
                }
                if($(elem).hasClass('touch_start')){
                    
                    // alert('revert8');
                    console.info('revert8');
                    console.log(e.type);

                    // Revert back to original position
                    that.slider_builder.revert(elem);

                }
                    

            }
        },

    });
    return Backbone;
}));