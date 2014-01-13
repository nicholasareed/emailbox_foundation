define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone-adapter'),
        models              = require('app/models/thread'),
        models_email        = require('app/models/email'),
        tpl                 = require('text!tpl/ThreadSlide.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);


    return Backbone.View.extend({

        tagName: 'li',
        className: 'topcoat-list__item normal-thread slide-list-item',

        initialize: function () {
            var that = this;
            _.bindAll(this, 
                'thread_action_option',
                'threadslide_right',
                'threadslide_left',
                'thread_revert',
                'delegateEventsCustom');

            this.model.on('reset', that.render, this);
            this.model.on('change', function(){
                that.render();
                // debugger;
            }, this);
            this.model.on('related:reset', function(tmpModel){
                that.render();
                // console.log(that.$el);
                // console.log(tmpModel.toJSON());
                // debugger;
            }, that);

            this.model.on('related:change', function(tmpModel){
                that.render();
                // debugger;
                // console.log(that.$el);
                // console.log(tmpModel.toJSON());
                // debugger;
            }, that);

            // this.model.on('related:change', function(tmpModel){
            //     that.render();
            // }, that);

            this.model.fetchRelated({reset: true});

            this.model.on('change', function(sortNum){
                // console.log(sortNum);
                // alert('changed');
                // debugger;
                // that.$el.attr('data-sort-num', sortNum);
                // that.$el.attr('data-sort-num', this.model.attributes.attributes.last_message_datetime_sec);
            }, this);

            // Listen for newly-added emails
            this._apiEvents.push(
                Api.Event.on({
                    event: ['Email.new','Email.action','Thread.action']
                },function(result){
                    that.model.fetch();
                    that.model.fetchRelated();
                })
            );

            this.render();
        },

        events: {

            // 'click .slide-list-item' : 'thread_shorttap',
            'shorttap' : 'thread_shorttap',
            'longtap' : 'thread_longtap',

            // 'shorttap-undo' : 'thread_shorttap_undo', // not handling the "undo" automatically now (previously did)

            'click .undo-archive' : 'thread_unarchive',

            'click .slide-button-option' : 'slide_button'
        },

        delegateEventsCustom: function(){
            var that = this;
            this.initialize_slider(this.$el, this);

            this.off('slide_action_dragRightPastThreshold');
            this.off('slide_action_dragLeftPastThreshold');
            this.on('slide_action_dragRightPastThreshold', function(elem){
                console.log('slideRight');
                console.log(elem);
                that.threadslide_right();
            });
            this.on('slide_action_dragLeftPastThreshold', function(elem){
                console.log('slideLeft');
                console.log(elem);
                that.threadslide_left();
            });
        },

        // _redelegate: function(){

        //     // Remove events
        //     this.undelegateEvents();
        //     this.delegateEvents();

        //     // Custom delegation (if exists)
        //     if(this.delegateEventsCustom != undefined){
        //         this.delegateEventsCustom();
        //     }

        //     // Initiate _redelegate on child views
        //     _.each(this._subViews, function(subView){
        //         subView._redelegate();
        //     });

        // },

        render: function () {

            // Already written, and now just "updating?"

            // console.log(this.model.toJSON());

            // Write html through Template
            this.$el.html(template({
                model: this.model.toJSON()
            }));
            // console.log(this.model.toJSON());

            this.$el.attr('data-id',this.model.get('_id'));
            this.$el.attr('data-sort-num', this.model.attributes.attributes.last_message_datetime_sec);

            // this.setElement(template(this.model.toJSON()));

            // console.log('collection JSON');
            // console.log(this.collection.toJSON());
            // debugger;

            this.delegateEventsCustom();

            return this;
        },

        thread_shorttap: function(ev){
            // View Thread
            // - unless multi-select is enabled
            // alert('short tap');
            var that = this,
                elem = ev.currentTarget;
            
            // Navigate to Thread
            Backbone.history.navigate('thread/' + this.model.get('_id'),{trigger:true});

            // Is "read" status already == 1 ?
            if(this.model.attributes.attributes.read.status == 1){
                return false;
            }

            // Change "read" status
            this.model.save({'attributes.read.status' : 1});

            // Emit Thread.action event for "read"
            Api.event({
                data: {
                    event: 'Thread.action',
                    delay: 0,
                    obj: {
                        _id: this.model.get('_id'),
                        action: 'read'
                    }
                },
                response: {
                    'pkg.native.email' : function(response){
                        console.log('Email server response');
                        console.log(response);

                        // Fetch new emails for this Thread
                        that.model.fetchRelated();
                    }
                },
                success: function(){
                    // Created event?
                }
            });

        },

        thread_action_option: function(ev){
            var that = this;
            // action option has been triggered (depending on whichever was triggered, activate it)

            try {
                var actions = this.model._related['Email'].first().attributes.original.actions;
                if(actions.length > 0){
                    var action = actions[0];
                    if(action.obj['@type'] == "EmailMessage"){
                        switch(action.obj.action['@type']){
                            case 'ViewAction':
                                if(action.obj.action.url != undefined){
                                    if(action.obj.action.handler && action.obj.action.handler.requiresConfirmation == true){
                                        if(confirm("Sure you want to visit URL: " + action.obj.action.url)){
                                            var ref = window.open(action.obj.action.url, '_system');
                                            // var ref = window.open(action.obj.action.url, '_blank', 'location=yes');
                                        }
                                    } else {
                                        var ref = window.open(action.obj.action.url, '_system');
                                        // var ref = window.open(action.obj.action.url, '_blank', 'location=yes');
                                    }
                                }
                                break;
                            case 'ConfirmAction':
                                if(action.obj.action.handler && action.obj.action.handler.url != undefined){
                                    var runFunc = function(){
                                        var actionmethod = action.obj.action.handler.method || '',
                                            post = actionmethod.indexOf('POST') > -1,
                                            method = post ? 'POST' : 'GET';

                                        that.$('.action_item').addClass('in-transit');
                                        $.ajax({
                                            url: action.obj.action.handler.url,
                                            cache: false,
                                            method: method,
                                            success: function(response){
                                                // should have a notification here
                                                that.$('.action_item').removeClass('in-transit');
                                                that.$('.action_item').addClass('complete');
                                            },
                                            error: function(err){
                                                alert('Failed, sorry');
                                                console.log(err);
                                                that.$('.action_item').removeClass('in-transit');
                                                that.$('.action_item').addClass('complete');
                                            }
                                        });
                                    }
                                    if(action.obj.action.handler.requiresConfirmation == true){
                                        if(confirm("Are you sure?")){
                                            // Make ajax request
                                            runFunc();
                                        }
                                    } else {
                                        runFunc();
                                    }
                                }
                                break;
                            case 'SaveAction':
                                if(action.obj.action.handler && action.obj.action.handler.url != undefined){
                                    var runFunc = function(){
                                        var actionmethod = action.obj.action.handler.method || '',
                                            post = actionmethod.indexOf('POST') > -1,
                                            method = post ? 'POST' : 'GET';

                                        that.$('.action_item').addClass('complete');
                                        $.ajax({
                                            url: action.obj.action.handler.url,
                                            cache: false,
                                            method: method,
                                            success: function(response){
                                                // should have a notification here
                                                // that.$('.action_item').removeClass('in-transit');
                                                // that.$('.action_item').addClass('complete');
                                            },
                                            error: function(err){
                                                alert('Failed, sorry');
                                                console.log(err);
                                                that.$('.action_item').removeClass('in-transit');
                                                that.$('.action_item').addClass('complete');
                                            }
                                        });
                                    }
                                    if(action.obj.action.handler.requiresConfirmation == true){
                                        if(confirm("Are you sure?")){
                                            // Make ajax request
                                            runFunc();
                                        }
                                    } else {
                                        runFunc();
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            } catch(err){
                // alert('No actions for email');
                console.log(err);
                debugger;
            }

        },

        thread_longtap: function(ev){
            // Open up the options menu (if any actions exist)

            // // alert('long tap');
            // console.log(this.model.attributes.original.actions);

            try {
                this.thread_action_option(ev);
            } catch(err){
                alert('No actions for email');
            }

            return false;

        },

        thread_unarchive: function(ev){
            var that = this,
                elem = this.el;

            // Make sure multi-select is not enabled on the .list
            console.log('thread_unarchive');

            this.$el.removeClass('slider-display-right-complete');
            this.$el.removeClass('slider-display-left-complete');
            this.slider_builder.revert(elem);

            // Handle UnArchive/Inbox
            this.model.save({'attributes.labels.Inbox' : 0});

            // Emit Thread.action event
            Api.event({
                data: {
                    event: 'Thread.action',
                    delay: 0,
                    obj: {
                        _id: this.model.get('_id'),
                        action: 'inbox'
                    }
                },
                response: {
                    'pkg.native.email' : function(response){
                        console.log('Email server response');
                        console.log(response);

                        // Fetch new emails for this Thread
                        that.model.fetchRelated();
                    }
                },
                success: function(){
                    // Created event?
                }
            });

            return false;

        },

        thread_revert: function(ev){
            var elem = this.el;

            // Make sure multi-select is not enabled on the .list
            console.log('thread_revert via View');

            this.$el.removeClass('slider-display-right-complete');
            this.$el.removeClass('slider-display-left-complete');
            this.slider_builder.revert(elem);
        },

        threadslide_right: function(){
            var that = this;

            // Slid right
            // - "archive"
            // - option to Undo
            // - displays a different background 

            // alert('going right!');

            this.$el.addClass('slider-complete slider-display-right-complete');

            // Handle Archive
            this.model.save({'attributes.labels.Inbox' : 0});

            // Emit Thread.action event
            Api.event({
                data: {
                    event: 'Thread.action',
                    delay: 0,
                    obj: {
                        _id: this.model.get('_id'),
                        action: 'archive'
                    }
                },
                response: {
                    'pkg.native.email' : function(response){
                        console.log('Email server response');
                        console.log(response);

                        // Fetch new emails for this Thread
                        that.model.fetchRelated();
                    }
                },
                success: function(){
                    // Created event?
                }
            });

        },

        threadslide_left: function(){
            // Slid left
            // - "label" or other actions
            // - choose Todo level of importance (also could be defined by dragleft distance)
            this.$el.addClass('slider-display-left-complete');

        },

        slide_button: function(ev){
            var that = this,
                elem = ev.currentTarget;

            // Take a specific action on a Thread
            // - label, note, etc.
            switch($(elem).attr('data-action')){
                case 'label':
                    // Label/unlabel
                    // - predifined
                    var label = $(elem).attr('data-label');
                    console.log(label);
                    // Slugify label

                    // See if label exists
                    var saveData = {},
                        action = 'label';
                    if(this.model.attributes.attributes.labels[label] == 1){
                        // Unlabel
                        // this.model.set('attributes.labels.' + label, 1);
                        saveData['attributes.labels.' + label] = 0;
                        this.model.save(saveData);
                        action = 'unlabel';
                    } else {
                        // Apply new label
                        // this.model.set('attributes.labels.' + label, 0);
                        saveData['attributes.labels.' + label] = 1;
                        this.model.save(saveData);
                    }

                    // Emit Thread.action event
                    Api.event({
                        data: {
                            event: 'Thread.action',
                            delay: 0,
                            obj: {
                                _id: this.model.get('_id'),
                                action: action,
                                label: label
                            }
                        },
                        response: {
                            'pkg.native.email' : function(response){
                                console.log('Email server response');
                                console.log(response);
                                // Fetch new emails for this Thread
                                that.model.fetchRelated();
                            }
                        },
                        success: function(){
                            // Created event?
                        }
                    });

                    // Toggle button "active"
                    $(elem).toggleClass('active');

                    break;

                case 'star':
                    // Star/Unstar

                    // See if already starred
                    var saveData = {},
                        action = 'star';
                    if(this.model.attributes.attributes.labels.Starred == 1){
                        // Unlabel
                        // this.model.set('attributes.labels.' + label, 1);
                        saveData['attributes.labels.Starred'] = 0;
                        this.model.save(saveData);
                        action = 'unstar';
                    } else {
                        // Apply new label
                        // this.model.set('attributes.labels.' + label, 0);
                        saveData['attributes.labels.Starred'] = 1;
                        this.model.save(saveData);
                    }

                    // Emit Thread.action event
                    Api.event({
                        data: {
                            event: 'Thread.action',
                            delay: 0,
                            obj: {
                                _id: this.model.get('_id'),
                                action: action
                            }
                        },
                        response: {
                            'pkg.native.email' : function(response){
                                console.log('Email server response');
                                console.log(response);

                                // Fetch new emails for this Thread
                                that.model.fetchRelated();
                            }
                        },
                        success: function(){
                            // Created event?
                        }
                    });

                    // Toggle button "active"
                    $(elem).toggleClass('active');

                    break;
                    
                case 'note':
                    // Prompt for a note (and enter the existing one)
                    // app.AppPkgDevMinimail.note

                    var pre_text = '';
                    try {
                        pre_text = this.model.attributes.app.AppPkgDevMinimail.note ? this.model.attributes.app.AppPkgDevMinimail.note : "";
                    } catch(err){
                        // pass
                    }

                    // Prompt box for note
                    var note_text = prompt('Thread Note',pre_text);

                    // Update the note
                    if(!note_text){
                        // canceled, not updating
                        return;
                    }

                    note_text = $.trim(note_text);

                    // Update model
                    this.model.save({'app.AppPkgDevMinimail.note' : note_text});

                    if(note_text.length > 0){
                        $(elem).addClass('active');
                    } else {
                        $(elem).removeClass('active');
                    }

                    break;
                case 'back':
                default:
                    this.thread_revert($(elem).parents('li').get(0));
                    break;
            }

            return false;
        }

    });

});