define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        tpl                 = require('text!tpl/Thread.html'),

        ThreadEmailView     = require('app/views/ThreadEmail'),
        ThreadWriteView     = require('app/views/ThreadWrite'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        initialize: function () {
            var that = this;
            _.bindAll(this, 
                'appendSubview',
                'clearSubviews',
                'createReplySubview',
                'createSentAndWaitingSubview');

            // this.model.on('change', this.render, this); // need to re-render a bunch of views on 'change'!
            this.model.on('related:Email:reset', function(tmpModel){
                // Create subViews for each email
                that.render();

                // Fetch the emails for this Thread
                // - reverse the order after we get them (most recent == last)
                that.model._related['Email'].each(function(model){ //  ====> .reverse()...

                    // Setup the subview for this model
                    that.appendSubview(that.$('.email-list'), new ThreadEmailView({
                        model: model,
                        threadModel: that.model,
                        $scroller: that.$('.scroller').get(0) // used for sticky headers (not working)
                    }));

                });

            }, that);
            this.model.on('related:Email:add', function(tmpModel){
                // A new email has been added
                // - make sure the "New Emails" display is shown

                // Show new emails button
                that.$('.email-show-new').removeClass('nodisplay');

                // scroll to "new" button
                that.$('.scroller').scrollTop( that.$('.email-show-new').offset().top );

            }, that);

            this.model.on('change:attributes', this.render, this);

            // Listen for newly-added emails
            this._apiEvents.push(
                Api.Event.on({
                    event: ['Email.new','Email.action','Thread.action'],
                },function(result){
                    that.model.fetch();
                    that.model.fetchRelated();
                })
            );
            
            this.model.fetch();
            this.model.fetchRelated({reset: true});

            this.render();
        },

        events: {
            'click .quicklink' : 'quicklink',
            'click .slide-menu-button' : 'slide_menu',

            'click .email-show-new' : 'email_show_new',

            'click .note' : 'modify_note', // fires on note-display element
            'click .side-nav__button' : 'slide_button'
        },

        render: function () {
            this.$el.html(template({
                model: this.model.toJSON()
            }));

            // Clear subviews
           this.clearSubviews();

           // Create Reply SubView
           this.createReplySubview();

            return this;
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
                subView.remove();
            });

            this._subViews = [];
        }, 

        createReplySubview: function(){
            var that = this;

            // Only create "Write" view if models.Email has been fetched
            if(this.model._fetched){
                
                // Kill any existing WriteView
                if(this._replyView != undefined){
                    // this._replyView.close();
                    this._replyView.remove();
                    this._subViews = _.without(this._subViews, this._replyView);
                }
                this._replyView = undefined;

                var write_elem = this.$('#ThreadWrite > div').get(0);
                if(!write_elem){
                    this.$('#ThreadWrite').append('<div class="reply-holder"></div>');
                    write_elem = this.$('#ThreadWrite > div').get(0)
                }
                this._replyView = new ThreadWriteView({
                    el: write_elem,
                    model: this.model, // pass along the model
                    $scroller: that.$('.scroller').get(0)
                });

                // Attach listeners for subView actions (like sending email)
                this._replyView.on('sent', function(sendingServerResponse, emailObj){

                    // Insert a new "Waiting on new Email" placeholder in the HTML
                    // - eventually we should have a Draft/Waiting handling in the View (and then just add this to the collection?)
                    // var waitingSubView = 
                    // that._replyView.$el.before();
                    that.createReplySubview();

                    // Add a new "An email has been sent" type of view
                    // - todo: 
                    that.createSentAndWaitingSubview();

                }, this);

                this._subViews.push(this._replyView.render());
            }
        },

        createSentAndWaitingSubview: function(){
            var that = this;

            // Only create "Write" view if models.Email has been fetched
            if(this.model._fetched){
                
                // Kill any existing WriteView
                if(this._sentAndWaitingView != undefined){
                    // already exists, no need to remove/recreate it
                    return false;
                }

                // Only adding via HTML for now
                this.$('.email-list').append('<div class="waiting-on-sent-email">Sent!<div class="with-fake-shadow"></div></div>');
                this._sentAndWaitingView = true;

                // Remove whenever a new email arrives


                // this._subViews.push(this._sentAndWaitingView.render());
            }
        },

        slide_menu: function(e){
            var cl = this.el.classList;
            if (cl.contains('right-nav')) {
                cl.remove('right-nav');
            } else {
                cl.add('right-nav');
            }
        },

        slide_menu_back: function(){
            var cl = this.el.classList;
            if (cl.contains('right-nav')) {
                cl.remove('right-nav');
            }
        },

        email_show_new: function(ev){
            // Show the new emails
            // - just re-rendering the whole page for now
            var that = this;

            var scroll_location = that.$('.email-show-new').offset().top;

            // Create subViews for each email
            that.render();

            // Fetch the emails for this Thread
            // - reverse the order after we get them (most recent == last)
            that.model._related['Email'].each(function(model){ //  ====> .reverse()...

                // Setup the subview for this model
                that.appendSubview(that.$('.email-list'), new ThreadEmailView({
                    model: model,
                    $scroller: that.$('.scroller').get(0) // used for sticky headers (not working)
                }));

            });

            // Scroll back to correct location
            // - might be wrong if read/unread status changes for an email
            that.$('.scroller').scrollTop( scroll_location );

            return false;

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

                    // Slide back the menu
                    this.slide_menu_back();

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

                    // Slide back the menu
                    this.slide_menu_back();

                    break;
                    
                case 'note':
                    // Prompt for a note (and enter the existing one)
                    // app.AppPkgDevMinimail.note

                    this.modify_note(ev);

                    // var pre_text = '';
                    // try {
                    //     pre_text = this.model.attributes.app.AppPkgDevMinimail.note ? this.model.attributes.app.AppPkgDevMinimail.note : "";
                    // } catch(err){
                    //     // pass
                    // }

                    // // Prompt box for note
                    // var note_text = prompt('Thread Note',pre_text);

                    // // Update the note
                    // if(!note_text){
                    //     // canceled, not updating
                    //     return;
                    // }

                    // note_text = $.trim(note_text);

                    // // Update model
                    // this.model.save({'app.AppPkgDevMinimail.note' : note_text});

                    // if(note_text.length > 0){
                    //     $(elem).addClass('active');
                    // } else {
                    //     $(elem).removeClass('active');
                    // }

                    break;
                case 'back':
                default:
                    this.thread_revert($(elem).parents('li').get(0));
                    break;
            }

            return false;
        },

        modify_note: function(ev){
            var that = this,
                elem = ev.currentTarget;

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

            // Update HTML
            if(note_text.length > 0){
                // Remove active class for the .note-init containers
                this.$('.note-init').addClass('active');
            } else {
                this.$('.note-init').removeClass('active');
            }

            // Update local text
            this.$('.note .note_content').text(note_text);

            // Make sure the side panel is slid back
            this.slide_menu_back();

            return false;

        }

    });

});