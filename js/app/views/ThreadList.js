define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone-adapter'),
        // EmployeeListView    = require('app/views/EmployeeList'),
        ThreadSlideView     = require('app/views/ThreadSlide'),

        models              = require('app/models/thread'),
        models_email        = require('app/models/email'),
        tpl                 = require('text!tpl/ThreadList.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);


    return Backbone.View.extend({

        className: 'topcoat-list__container scroller main-content',

        initialize: function (options) {
            var that = this;
            _.bindAll(this, 
                'multi_options',
                'multi_deselect',
                'sort_list_elem',
                'appendSubview',
                'clearSubviews',
                '_refreshData',
                // '_redelegate',
                'delegateEventsCustom',
                // '_close',
                '_closeCustom');

            this.options = options;

            this.$el.css('top', '3.0rem');

            // this.collection.on('all', function(e){
            //     console.log('Event:', e);
            // });
            this.collection.on('reset', function(collection){

                // Re-render base view
                that.render();

                // Fetch the emails for this Thread
                collection.each(function(model){

                    // Setup the subview for this model
                    that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
                        model: model
                    }));

                });
            }, this);
            this.collection.on('add', function(model){

                // Make sure element doesn't already exist in the list
                var found = false;
                _.each(that._subViews, function(sv){
                    if(sv.model.get('_id') == model.get('_id')){
                        found = true;
                    }
                });

                // Setup the subview for this model
                if(!found){
                    that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
                        model: model
                    }));
                }

                that.sort_list_elem();

            });
            this.collection.on('remove', function(model){
                // Model has been removed from collection
                // - might still have an "Undo" option and we don't want to immediately remove it
                
                var subView = _.find(that._subViews, function(elem){
                    if(elem.model == model){
                        return true;
                    }
                });

                if(subView.$el.hasClass('slider-complete') || subView.actedOn == true){
                    // has been slid, don't remove it right now
                    console.log("DO NOT REMOVE IT! (has been slid)");
                    return false;
                }

                // Remove subview
                subView.remove();
                that._subViews = _.without(that._subViews, subView);

                // // Setup the subview for this model
                // that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
                //     model: model
                // }));

                // that.sort_list_elem();

            });
            this.collection.on('sort', function(collection){
                // Update the sort values for each model
                collection.each(function(model, index){
                    // Emit event on model (tell it the new position)
                    model.trigger('resorted', index); // the subView is listening on the model
                });

                that.sort_list_elem();
            });

            // Listen for newly-added emails
            this._apiEvents.push(
                Api.Event.on({
                    event: ['Email.new', 'Email.action', 'Thread.action']
                },function(result){
                    that.collection.fetch();
                })
            ); 

            // Initiate .fetch for getting records
            this.collection.fetch({reset: true});

            // Render
            this.render();

        },

        _subViews: [],
        appendSubview: function($elem, subView){
            this._subViews.push(subView);
            $elem.append(subView.$el);
            // $el.html(subView.render().$el);
        },
        clearSubviews: function(){
            // Clear subviews
            _.each(this._subViews, function(subView){
                // subView.close();
                subView.remove();
            });

            this._subViews = [];
        },

        _closeCustom: function(){
            // Update the _lastScrollerPosition for re-displaying this view later (keeps positioning)
            this._lastScrollerPosition = this.$('.slide-list-items').scrollTop();
            // console.log('ThreadList _closeCustom');
            // console.log(this._lastScrollerPosition);
            // debugger;
        },

        delegateEventsCustom: function(){
            // Unbind and re-bind events
            // - assuming it has been rendered, removed, and then gets placed back on the DOM

            // Scroll to correct location
            // console.log('ThreadList delegateEventsCustom');
            // console.log(this._lastScrollerPosition);
            this.$el.scrollTop(this._lastScrollerPosition);
            this.$('.slide-list-items').scrollTop(this._lastScrollerPosition);

        },

        _refreshData: function(){
            var that = this;
            this.collection.fetch();

            var ids = _.pluck(this.collection.toJSON(), '_id');

            // Remove views that are "expired" (not in the existing collection)
            _.each(this._subViews, function(subView){
                // Make sure subView's model exists in the collection
                if($.inArray(subView.model.get('_id'), ids) == -1){
                    that._subViews = _.without(that._subViews, subView);

                    subView.$el.slideUp('slow', function(){
                        subView.remove();
                    });

                }
            });

        },

        render: function () {

            // Create a subview for each Thread?

            // Already written, and now just "updating?"

            this.clearSubviews();

            // Write html through Template
            this.$el.html(template());

            // console.log('collection JSON');
            // console.log(this.collection.toJSON());
            // debugger;

            // this.delegateEventsCustom();

            return this;
        },

        events: {
            'click .quicklink' : 'quicklink',
            'multi-change .slide-list-items' : 'multi_options', // multi-change event on List container
            'click .multi-deselect' : 'multi_deselect',

            'click .multi-middle-button' : 'multi_middle', // archive
            'click .multi-right-button' : 'multi_right' // options

        },

        sort_list_elem: function(){
            this.$('.slide-list-items > li').tsort({
                attr: 'data-sort-num',
                order: 'desc' // reverse
            });
        },

        multi_options: function(){
            // Displays (or hides) multi-select options
            var that = this;

            this.collection.sort();

            // Add backbutton tracking if we are displaying the multi_options

            // See if there are any views that are multi-selected
            if(this.$('.multi-selected').length > 0){


                this.$('.slide-list-items').addClass('multi-select-mode');
                this.$el.addClass('show-multi-select');

                // this.$('.multi_select_options').removeClass('no_multi_select');

                // this.$('.lot_options_flag').addClass('nodisplay');
                // this.$('.footer2').addClass('nodisplay');
            } else {
                this.$('.slide-list-items').removeClass('multi-select-mode');
                this.$el.removeClass('show-multi-select');
                // this.$('.multi_select_options').addClass('no_multi_select');

                // this.$('.lot_options_flag').removeClass('nodisplay');
                // this.$('.footer2').removeClass('nodisplay');
            }

            // // On or off?
            // // if(this.$('.all_threads').hasClass('multi-select-mode')){
            // if(this.show_multi_options){
            //  // Just turned on
            //  this.$('.multi_select_options').removeClass('no_multi_select');
            // } else {
            //  // Turned off
            //  this.$('.multi_select_options').addClass('no_multi_select');
            // }
            
            return false;
        },

        multi_deselect: function(ev){
            // De-select any that are selected
            var that = this;

            // Remove selected
            this.$('.multi-selected').removeClass('multi-selected')

            // Remove multi-select-mode
            this.$('.slide-list-items').removeClass('multi-select-mode');

            // Call multi-options
            that.multi_options();

            return false;
        },

        multi_middle: function(ev){
            // Archive
            // - collapse 
            // - single option to undo

            var that = this,
                elem = ev.currentTarget;

            // Get all selected
            // - get Thread._id
            // - make sure to not select ones that are already processed

            // Get all elements above this one
            // - and including this one
            // - but not ones that have already been processed (wouldn't anyways)

            var incl_thread_ids = [];
            // $('.multi-selected').each(function(i, threadElem){
            //     // Wait for this element to get triggered
            //     var $threadParent = $(threadElem).parent();
            //     incl_thread_ids.push($threadParent.attr('data-id'));
            //     // if(incl_thread_ids.length > 0){
            //     //  // Already found this element
            //     //  incl_thread_ids.push($(threadElem).attr('data-id'));
            //     // } else if($(threadElem).attr('data-id') == that.options.threadid){
            //     //  incl_thread_ids.push($(threadElem).attr('data-id'));
            //     // }
            // });

            incl_thread_ids = _.map(this.$('.multi-selected'), function(elem){
                return $(elem).attr('data-id');
            });

            // Make sure some are included
            if(!incl_thread_ids || incl_thread_ids.length < 1){
                alert('None Selected');
                return false;
            }
            
            // Update models
            _.each(this._subViews, function(sv, idx){
                // get model
                if($.inArray(sv.model.get('_id'), incl_thread_ids) > -1){
                    // subView is affected
                    // sv.actedOn = true;
                    sv.threadslide_right();
                    // sv.threadslide_right();
                }
                
            });

            // // Run update command
            // // - updates them all at once
            // Api.update({
            //     data: {
            //         model: 'Thread',
            //         conditions: {
            //             '_id' : {
            //                 '$in' : incl_thread_ids
            //             }
            //         },
            //         multi: true, // edit more than 1? (yes)
            //         paths: {
            //             "$set" : {
            //                 "app.AppPkgDevMinimail.done" : 1
            //             }
            //         }
            //     },
            //     success: function(response){
            //         // Successfully updated
            //         response = JSON.parse(response);
            //         if(response.code != 200){
            //             // Updating failed somehow
            //             // - this is bad, it means the action we thought we took, we didn't take
            //             alert('Update may have failed');
            //         }
            //     }
            // });

            
            // // Fire event to modify move Email/Thread to Archive (it will be brought back later when wait_until is fired)
            // _.each(incl_thread_ids, function(tmp_thread_id){
                
            //     Api.event({
            //         data: {
            //             event: 'Thread.action',
            //             obj: {
            //                 '_id' : tmp_thread_id, // allowed to pass a thread_id here
            //                 'action' : 'archive'
            //             }
            //         },
            //         success: function(response){
            //             response = JSON.parse(response);

            //             if(response.code != 200){
            //                 // Failed launching event
            //                 alert('Failed launching Thread.action2');
            //                 dfd.reject(false);
            //                 return;
            //             }

            //         }
            //     });

            // });
                

            // // Add to waitingToRemove
            // _.each(incl_thread_ids, function(tmp_thread_id){

            //     var viewToRemove = _(that._subViews).filter(function(cv) { return cv.model.get('_id') === tmp_thread_id; });
            //     if(viewToRemove.length < 1){
            //         return;
            //     }
            //     viewToRemove = _.first(viewToRemove);

            //     // that._subViews[this.threadType] = _(that._subViews[this.threadType]).without(viewToRemove);
            //     // console.log(viewToRemove);
            //     // Change the view's opacity:
            //     // - or change based on whatever happened to it?
            //     // - also depends on if it was a remote change, right? 
            //     // $(viewToRemove.el).css('opacity', 0.8);

            //     // don't actually remove it?
            //     // - only remove it when refresh is called
            //     // console.log('pushed here');
            //     that._waitingToRemove.push(viewToRemove);
            // });


            // // Take mass action
            // that.mass_action('done', incl_thread_ids);

            // De-select
            this.multi_deselect();

            return false;

        },

        multi_right: function(ev){
            // Options menu 
            // - 
            alert('options');
        }

    });

});