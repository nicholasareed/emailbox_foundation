define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        tpl                 = require('text!tpl/ThreadEmail.html'),

        Hammer              = require('hammer'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        className: 'email-single',

        initialize: function (options) {
            var that = this;

            this.$scroller = options.$scroller;

            this.threadModel = options.threadModel;

            this.model.on('change', this.render, this);
            this.render();

        },

        events: {
            'click .quicklink' : 'quicklink',
            'click .action-menu' : 'email_menu',
            'click .action-star' : 'toggle_star',

            'click .expander' : 'toggle_parseddata',

            'hold' : 'show_minimized',
            'pinch' : 'show_minimized',
            'rotate' : 'show_minimized'

        },

        render: function () {

            var media_attachments = _.map(this.model.toJSON().original.attachments, function(attachment){
                switch(attachment.type){
                    case 'image/jpeg':
                    case 'image/jpg':
                    case 'image/png':
                        return attachment;
                    default:
                        break;
                }
                return false;
            });

            media_attachments = _.compact(media_attachments);

            // Write the html
            this.$el.html(template({
                model: this.model.toJSON(),
                threadModel: this.threadModel.toJSON(),
                media_attachments: media_attachments
            }));

            // Change class based on read/unread status
            if($.inArray('\\Seen', this.model.toJSON().original.flags) > -1){
                this.$el.addClass('simple');
                this.events['click'] = 'show_full';
            } else {
                this.$el.addClass('full');
            }

            // Hammer(this.el).off('doubletap');
            // Hammer(this.el).on('doubletap', this.show_minimized, this);
            // Hammer(this.$el).on('swipeleft', function(){
            //     alert('swipe2');
            // });

            return this;
        },

        show_full: function(){
            if(this.$el.hasClass('simple')){
                this.$el.removeClass('simple');
                this.$el.addClass('full');
                return false;
            }
        },

        show_minimized: function(){
            // Minimize

            if(this.$el.hasClass('full')){
                this.$el.removeClass('full');
                this.$el.addClass('simple');
                return false;
            }

            return false;
        },

        email_menu: function(ev){
            var that = this,
                elem = ev.currentTarget;

            alert(this.model.get('_id'));

            return false;

        },

        toggle_star: function(ev){
            var that = this,
                elem = ev.currentTarget;

            // Toggle the star display
            

            // See if already starred
            var saveData = {},
                action = 'star';
            if($.inArray("\\Starred", this.model.attributes.original.labels) > -1){
                // Unlabel
                // this.model.set('attributes.labels.' + label, 1);
                saveData['original.labels'].push("\\Starred");
                this.model.save(saveData);
                action = 'unstar';
            } else {
                // Apply new label
                // this.model.set('attributes.labels.' + label, 0);
                // saveData['attributes.labels.Starred'] = 1;
                saveData['original.labels'] = _.without(this.model.attributes.original.labels, "\\Starred");
                this.model.save(saveData);
            }

            // Emit Thread.action event
            Api.event({
                data: {
                    event: 'Email.action',
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
                        that.model.fetch();
                    }
                },
                success: function(){
                    // Succeeded
                }
            });

            // // Toggle button "active"
            // $(elem).toggleClass('active');

            // // Slide back the menu
            // this.slide_menu_back();

            return false;
        },

        toggle_parseddata: function (ev){
            // Display any hidden emails (previous parts of the conversation)
            var elem = ev.currentTarget,
                that = this;

            var message = this.$('.message');

            //var count = $(content_holder).find('.ParsedDataContent').length;

            // console.log(this.threadEmails);

            // Toggle
            if($(message).hasClass('showAllParsedData')){
                $(message).removeClass('showAllParsedData')
                
                $(message).find('.ParsedDataContent:not([data-level="0"])').hide();

                $(elem).text('...');
            } else {
                $(message).addClass('showAllParsedData')

                $(message).find('.ParsedDataContent:not([data-level="0"])').show();

                $(elem).text('Hide');
            }

            return false;

        },

    });

});