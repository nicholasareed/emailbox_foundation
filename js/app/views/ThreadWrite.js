define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),

        ComposeContactsView = require('app/views/ComposeContacts'),
        tpl                 = require('text!tpl/ThreadWrite.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        initialize: function (options) {
            var that = this;

            // also expects this.model to be a Thread model with fetchRelated available
            this.$scroller = options.$scroller;

            // this.model.on('change', this.render, this);
            this.render();

        },

        events: {
            'click .quicklink' : 'quicklink',
            'click .reply-init' : 'reply_init',
            'click .add-picture-button' : 'add_photo',
            'click .add-file-button' : 'add_file',

            'click .send-button' : 'send_email'
        },

        render: function () {
            // Write the html
            this.$el.html(template());
            // alert('threadwrite2_render');

            // Render Contacts SubView
            this._contactsSubView = new ComposeContactsView({
                el: this.$('#contacts-holder').get(0),
                model: this.model
            });

            return this;
        },

        reply_init: function(ev){
            this.$('.reply-bar').addClass('nodisplay');
            this.$('.compose-bar').removeClass('nodisplay');

            this.$('textarea').focus();
            $(this.$scroller).scrollTop(1000000);
        },

        send_email: function(ev){
            // Send an email!
            var that = this,
                elem = ev.currentTarget;

            alert('Sending...(todo)');

            return false;
        },

        add_photo: function(ev){
            var that = this,
                elem = ev.currentTarget;
            
            if(App.Data.usePg){
                
                var sourceType = Camera.PictureSourceType.CAMERA;
                if($(elem).attr('data-source-type') == 'library'){
                    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                }
                // Launch Camera
                // - also allow photo album? Anything else by default? 
                navigator.camera.getPicture(function(imageURI){

                    // Todo: Save file to filepicker
                    // - save it where? To dropbox? File upload API? 

                    // Write template
                    var newImg = new Image();
                    newImg.src = imageURI;
                    that.$('.attachment-holder-bar').append($(newImg).wrap('<div> </div>'));
                    console.log(newImg.src);

                    // var template = App.Utils.template('t_common_photo_preview_image');

                    // // Append
                    // $('.compose_attachments').append(template({url: 'missing.png'}));

                    // // clog(imageURI);

                }, function(err){
                    console.log('Error getting image');
                    console.log(err);
                }, { 
                    sourceType: sourceType,
                    quality: 80, 
                    destinationType: Camera.DestinationType.FILE_URI,
                    correctOrientation: true,
                    allowEdit: true, 
                    encodingType: Camera.EncodingType.PNG,
                    targetWidth: 1000,
                    targetHeight: 1000
                });

            }

            return false;
        },

        add_file: function(ev){
            var that = this,
                elem = ev.currentTarget;
            
            if(App.Data.usePg){
                
                var sourceType = Camera.PictureSourceType.CAMERA;
                if($(elem).attr('data-source-type') == 'library'){
                    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                }
                // Launch Camera
                // - also allow photo album? Anything else by default? 
                navigator.camera.getPicture(function(imageURI){

                    // Todo: Save file to filepicker
                    // - save it where? To dropbox? File upload API? 

                    // Write template
                    var newImg = new Image();
                    newImg.src = imageURI;
                    that.$('.attachment-holder-bar').append($(newImg).wrap('<div> </div>'));
                    console.log(newImg.src);

                    // var template = App.Utils.template('t_common_photo_preview_image');

                    // // Append
                    // $('.compose_attachments').append(template({url: 'missing.png'}));

                    // // clog(imageURI);

                }, function(err){
                    console.log('Error getting image');
                    console.log(err);
                }, { 
                    sourceType: sourceType,
                    quality: 80, 
                    destinationType: Camera.DestinationType.FILE_URI,
                    correctOrientation: true,
                    allowEdit: true, 
                    encodingType: Camera.EncodingType.PNG,
                    targetWidth: 1000,
                    targetHeight: 1000
                });

            }

            return false;
        }

    });

});