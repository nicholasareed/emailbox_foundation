define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        tpl                 = require('text!tpl/ThreadEmail.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        className: 'email-single',

        initialize: function (options) {
            var that = this;

            this.$scroller = options.$scroller;

            this.model.on('change', this.render, this);
            this.render();

        },

        events: {
            'click .quicklink' : 'quicklink',
            'click .action-menu' : 'email_menu',
            'click .action-star' : 'toggle_star',

            'click .expander' : 'toggle_parseddata'
        },

        render: function () {
            // Write the html
            this.$el.html(template(this.model.toJSON()));

            // Change class based on read/unread status
            if($.inArray('\\Seen', this.model.toJSON().original.flags) > -1){
                this.$el.addClass('simple');
                this.events['click'] = 'show_full';
            } else {
                this.$el.addClass('full');
            }

            return this;
        },

        show_full: function(){
            if(this.$el.hasClass('simple')){
                this.$el.removeClass('simple');
                this.$el.addClass('full');
                return false;
            }
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
            alert('toggle star (todo)');

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