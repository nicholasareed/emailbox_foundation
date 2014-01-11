define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),

        SearchEmailListView = require('app/views/SearchEmailList'),
        SearchFileListView = require('app/views/SearchFileList'),

        tpl                 = require('text!tpl/Search.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        initialize: function (options) {
            this.render();
            // this.collection.on("reset", this.render, this);

            this.search_type = options.search_type || 'emails';

        },

        events: {
            'click .quicklink' : 'quicklink',

            'click .nav-button-icon-text' : 'switch_search_type',
            'click .search-button' : 'search_button',
            'submit form' : 'search_button'
        },

        render: function () {

            this.$el.html(template({
                last_search: App.Data.Cache.last_search || 'jpg' // temporary cache
            }));
            return this;
        },

        switch_search_type: function(ev){
            // Change the search type
            // - emails, files/attachments, contacts/people
            var that = this,
                elem = ev.currentTarget;

            // Get type
            this.search_type = $(elem).attr('data-type');

            // Change actively selected
            this.$('.nav-button-icon-text').removeClass('active');
            $(elem).addClass('active');

            return false;

        },

        search_button: function(ev){
            // Search using the text/filters
            var that = this,
                elem = ev.currentTarget;

            // Update last search value
            App.Data.Cache.last_search = that.$('.search-input-val').val();

            // Switch the type of search we are displaying
            // - eventually save searches easily too
            switch(this.search_type){
                case 'emails':
                    // Create and insert a subView for displaying the results
                    var subView = new SearchEmailListView({
                        text: that.$('.search-input-val').val()
                    });

                    that.$('.search_results').empty(); // clear the HTML
                    that.$('.search_results').append(subView.$el); // append the View

                    break;
                case 'files':

                    // Create and insert a subView for displaying the results
                    var subView = new SearchFileListView({
                        text: that.$('.search-input-val').val()
                    });

                    that.$('.search_results').empty(); // clear the HTML
                    that.$('.search_results').append(subView.$el); // append the new SubView

                    break;
                case 'contacts':
                    break;
                default:
                    alert('Unable to find search type');
                    break;
            }

            return false;

        }

    });

});