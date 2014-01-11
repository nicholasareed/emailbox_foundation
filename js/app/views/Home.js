define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone-adapter'),
        // EmployeeListView    = require('app/views/EmployeeList'),
        ThreadListView     = require('app/views/ThreadList'),
        ThreadSlideView     = require('app/views/ThreadSlide'),

        models              = require('app/models/thread'),
        models_email        = require('app/models/email'),
        tpl                 = require('text!tpl/Home.html'),

        Utils               = require('utils'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);


    return Backbone.View.extend({

        initialize: function (options) {
            var that = this;
            _.bindAll(this, 
                'appendSubview',
                'clearSubviews',
                'switch_labelview');

            this.options = options;

            // Initialized, so create the collection (that can be switched out later, for different folder/label views

            this.render();

            // Setup the default (Inbox) label/folder view
            that.switch_labelview(options.type, options.text);

            // Load UserEmailAccount
            if(App.Data.UserEmailAccount == undefined){

                require(["app/models/user_email_account"], function (models_UEA) {
                    // var models_UEA = require('app/models/user_email_account');
                    App.Data.UserEmailAccount = new models_UEA.UserEmailAccountCollection();
                    App.Data.UserEmailAccount_Quick = [];
                    App.Data.UserEmailAccount.on('reset', function(collection){
                        // debugger;
                        App.Data.UserEmailAccount_Quick = _.map(collection.toJSON(),function(account){
                            return account.email;
                        });
                    });
                    App.Data.UserEmailAccount.fetch({reset: true});
                });

            }

            // Load Contacts
            if(App.Data.Store.Contact == null){

                require(["app/models/contact"], function (models_Contact) {
                    // var models_UEA = require('app/models/user_email_account');
                    App.Data.Store.Contact = new models_Contact.ContactCollection();
                    // App.Data.Store.Contact_Quick = [];
                    App.Data.Store.Contact.on('reset', function(collection){
                        console.log('App.Data.Contact reset');
                        App.Data.Store.Contact.parse_and_sort_contacts();
                        // App.Data.Store.Contact_Quick = _.map(collection.toJSON(),function(contact){
                        //     return account.email;
                        // });
                    });
                    App.Data.Store.Contact.search_limit = 5000;
                    App.Data.Store.Contact.fetch({reset: true});
                    // debugger;
                });

            }
        },

        _subViews: [],
        appendSubview: function($elem, subView){
            // Append subView to DOM element
            // - make sure View doesn't already exist
            if(_.indexOf(this._subViews, subView) == -1){
                // Push to subView (doesn't exist yet)
                this._subViews.push(subView);
            }
            
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

        _folderViews: {},
        _currentFolderView: undefined,

        switch_labelview: function(type, text){
            var that = this;
            // Clear any existing ones

            // that.$('.main-content').empty();
            if(this._currentFolderView != undefined){
                this._currentFolderView.remove();
            }

            // See if view already exists for this "search" type
            var token = Utils.base64.encode(JSON.stringify({
                type: type,
                text: text
            }));

            // console.log(token);

            // Collection exists?
            var tmpView = undefined;
            if(this._folderViews[token] == undefined){
                // view not created
                this._folderViews[token] = new ThreadListView({
                    collection: new models.ThreadCollection([],{
                        type: type,
                        text: text
                    })
                });

            }

            this._currentFolderView = this._folderViews[token];
            this._currentCollection = this._currentFolderView.collection;

            // console.log(this._currentCollection);

            that.appendSubview( that.$el, this._folderViews[token] );

            console.log(this._subViews);

            // // re-delegate events
            that._currentFolderView._redelegate();
            // this._currentCollection.fetch();
            that._currentFolderView._refreshData();

        },

        render: function () {

            // Create a subview for each Thread?

            // Already written, and now just "updating?"

            this.clearSubviews();

            this.navigation_labels = [
                {
                    text: "Inbox"
                },
                {
                    text: "Starred"
                },
                {
                    text: "All Threads",
                    type: "all"
                },
                {
                    text: "todo"
                },
                {
                    text: "Sent"
                }
            ];

            // Write html through Template
            this.$el.html(template({
                title: this.options.title,
                navigation_labels: this.navigation_labels
            }));


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

            'click .side-nav__button' : 'view_label'

        },

        sort_list_elem: function(){
            this.$('.slide-list-items > li').tsort({
                attr: 'data-sort-num'
            });
        },

        slide_menu: function(e){
            var cl = this.el.classList;
            if (cl.contains('left-nav')) {
                cl.remove('left-nav');
            } else {
                cl.add('left-nav');
            }
            // this.$el.addClass('show-multi-select');

            // this._currentCollection.fetch();
            // this._currentCollection.sort();

            this._currentFolderView._refreshData();

        },

        view_label: function(ev){
            // Displays a different label/folder
            var that = this,
                elem = ev.currentTarget;

            var idx = parseInt($(elem).attr('data-index'), 10);
            var label = this.navigation_labels[idx];

            label.type = label.type != undefined ? label.type : 'label';

            // Switch folder/label view
            that.switch_labelview(label.type, label.text);

            // Create a new collection and disregard the existing collection
            // - re-initialize this collection

            // Slide back the view
            this.el.classList.remove('left-nav');

            // Change the text
            this.$('.slide-menu-button').text(label.text);

            // Change the selection
            this.$('.side-nav__button').removeClass('active');
            $(elem).addClass('active');
            
            return false;

        }

    });

});