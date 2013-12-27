define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone-adapter'),
        // EmployeeListView    = require('app/views/EmployeeList'),
        ThreadSlideView     = require('app/views/ThreadSlide'),

        models              = require('app/models/thread'),
        models_email        = require('app/models/email'),
        tpl                 = require('text!tpl/Home.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);


    return Backbone.View.extend({

        initialize: function () {
            var that = this;
            _.bindAll(this, 
                'multi_options',
                'multi_deselect',
                'sort_list_elem',
                'appendSubview',
                'clearSubviews');

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

                // Setup the subview for this model
                that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
                    model: model
                }));

                that.sort_list_elem();

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

            this.collection.fetch({reset: true});

            this.render();


            // Load UserEmailAccount
            if(App.Data.UserEmailAccount == undefined){

                require(["app/models/user_email_account"], function (models_UEA) {
                    // var models_UEA = require('app/models/user_email_account');
                    App.Data.UserEmailAccount = new models_UEA.UserEmailAccountCollection();
                    App.Data.UserEmailAccount_Quick = [];
                    App.Data.UserEmailAccount.on('reset', function(collection){
                        App.Data.UserEmailAccount_Quick = _.map(collection.toJSON(),function(account){
                            return account.email;
                        });
                    });
                    App.Data.UserEmailAccount.fetch({reset: true});
                });

            }
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
                subView.close();
                subView.remove();
            });

            this._subViews = [];
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
            'click .slide-menu-button' : 'slide_menu',

            'multi-change .slide-list-items' : 'multi_options', // multi-change event on List container
            'click .multi-deselect' : 'multi_deselect',

        },

        sort_list_elem: function(){
            this.$('.slide-list-items > li').tsort({
                attr: 'data-sort-num'
            });
        },

        slide_menu: function(e){
            // var cl = this.el.classList;
            // if (cl.contains('left-nav')) {
            //     cl.remove('left-nav');
            // } else {
            //     cl.add('left-nav');
            // }
            // // this.$el.addClass('show-multi-select');
            this.collection.fetch();
            this.collection.sort();
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
        }

    });

});