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
                'createReplySubview');

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

            'click .email-show-new' : 'email_show_new'
        },

        render: function () {
            this.$el.html(template(this.model.toJSON()));

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
                // alert('createReplySubview');
                var subView = new ThreadWriteView({
                    el: this.$('#ThreadWrite'),
                    model: this.model, // pass along the model
                    $scroller: that.$('.scroller').get(0)
                });
                this._subViews.push(subView.render());
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

        }

    });

});