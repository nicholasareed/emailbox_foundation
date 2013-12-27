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
                'delegateEventsCustom',
                'thread_action_option');

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

            this.model.on('resorted', function(sortNum){
                // console.log(sortNum);
                that.$el.attr('data-sort-num', sortNum);
            });

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

            'shorttap-undo' : 'thread_shorttap_undo'
        },

        delegateEventsCustom: function(){
            this.initialize_slider(this.$el, this);

            this.on('slide_action_dragRightPastThreshold', function(elem){
                console.log('slideRight');
                console.log(elem);
            });
            this.on('slide_action_dragLeftPastThreshold', function(elem){
                console.log('slideLeft');
                console.log(elem);
            });
        },

        render: function () {

            // Already written, and now just "updating?"

            // console.log(this.model.toJSON());

            // Write html through Template
            this.$el.html(template(this.model.toJSON()));
            console.log(this.model.toJSON());

            this.$el.attr('data-id',this.model.get('_id'));

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
            var elem = ev.currentTarget;
            Backbone.history.navigate('thread/' + this.model.get('_id'),{trigger:true});
            
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
        thread_shorttap_undo: function(ev){
            var elem = ev.currentTarget;

            // Make sure multi-select is not enabled on the .list
            console.log('thread_shorttap_undo');
            this.slider_builder.revert(elem);
        }

    });

});