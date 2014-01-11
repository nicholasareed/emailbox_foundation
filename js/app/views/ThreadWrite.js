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

            _.bindAll(this, 'send_email', 'after_init_send', 'after_sent', 'cancel_sending');

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

            'click .waiting-on-sent' : 'button_cancel_sending',

            'click .send-button' : 'send_email'
        },

        render: function () {
            var that = this;

            // Write the html
            this.$el.html(template());
            // alert('threadwrite2_render');

            // Create auto-grower
            this.$('.compose-textarea').autogrow();

            // Listen for keyboard change
            // - make sure the cursor is in the viewport
            this.stopListening(App.Events, 'keyboard-enabled');
            this.listenTo(App.Events, 'keyboard-enabled', function(){
                // Get the cursor position and bring it into the viewport 

                // Make sure the textarea has focus
                if(that.$('.compose-textarea:focus').length < 1){
                    return false;
                }

                // http://stackoverflow.com/questions/7464282/javascript-scroll-to-selection-after-using-textarea-setselectionrange-in-chrome
                
                // Get textarea and start of cursor position
                var textArea = that.$('.compose-textarea').get(0),
                    selectionStart = textArea.selectionStart; // no need for selectionEnd

                // now lets do some math
                // we need the number of chars in a row
                var charsPerRow = textArea.cols;

                // we need to know at which row our selection starts
                var selectionRow = (selectionStart - (selectionStart % charsPerRow)) / charsPerRow;

                // we need to scroll to this row but scrolls are in pixels,
                // so we need to know a row's height, in pixels
                var lineHeight = textArea.clientHeight / textArea.rows;

                // Scroll to the top of the textarea
                $(that.$scroller).scrollTo('.compose-textarea', {
                    margin: true,
                    offset: lineHeight * selectionRow
                });


            });

            // Render Contacts SubView
            this._contactsSubView = new ComposeContactsView({
                el: this.$('#contacts-holder').get(0),
                model: this.model
            });

            return this;
        },

        reply_init: function(ev){
            // Clicked "reply" to open up the reply details (textarea, etc.)
            var that = this;
            this.$('.reply-bar').addClass('nodisplay');
            this.$('.compose-bar').removeClass('nodisplay');

            this.$('textarea').focus();

            window.setTimeout(function(){
                $(that.$scroller).scrollTop(1000000);
            },10);
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
        },

        send_email: function(ev){
            // Validate sending the email
            // Send the email
            var that = this,
                elem = ev.currentTarget;

            // Disable buttons
            if(this.disable_buttons == true){
                // already disabled
                return false;
            }
            
            // Change display status of button
            this.disable_buttons = true;
            $(elem).attr('data-status', 'yellow');


            // Throw into a different view after success?

            var Emails = this.model.toJSON().Email;

            // In Reply To
            console.log(Emails);
            var in_reply = _.last(Emails).common['Message-Id']; //[this.thread_data.Email.length - 1].common['Message-Id'];
            var subject = _.last(Emails).original.headers.Subject;

            // References (other message-ids)
            var references = _.map(Emails,function(email){
                return email.common['Message-Id'];
            });

            // To
            var to = [];
            this.$('.address_list[data-type="To"] .participant').each(function(index){
                to.push($(this).attr('data-email'));
            });
            to = to.join(',');

            // CC
            var cc = [];
            this.$('.address_list[data-type="CC"] .participant').each(function(index){
                cc.push($(this).attr('data-email'));
            });
            cc = cc.join(',');
            
            // BCC
            var bcc = [];
            this.$('.address_list[data-type="BCC"] .participant').each(function(index){
                bcc.push($(this).attr('data-email'));
            });
            bcc = bcc.join(',');
            

            var from = App.Data.UserEmailAccount.at(0).get('email');
            var textBody = that.$('.compose-textarea').val();

            // Do a little bit of validation
            try {
                if(to.length < 1){
                    alert('You need to send to somebody!');
                    that.cancel_sending(that, elem);
                    return false;
                }
                if(from.length < 1){
                    alert('Whoops, we cannot send from your account right now');
                    that.cancel_sending(that, elem);
                    return false;
                }
                if(subject.length < 1){
                    alert('You need to write a subject line!');
                    that.cancel_sending(that, elem);
                    return false;
                }
                if(textBody.length < 1){
                    alert('You need to write something in your email!');
                    that.cancel_sending(that, elem);
                    return false;
                }

            } catch(err){
                console.error('Failed validation');
                console.error(err);
                that.cancel_sending(that, elem);
                return false;

            }

            // Send return email
            var eventData = {
                event: 'Email.send.validate',
                delay: 0,
                obj: {
                    To: to,
                    From: from,
                    Subject: subject,
                    Text: textBody,
                    headers: {
                        "In-Reply-To" : in_reply,
                        "References" : references.join(',')
                    },
                    attachments: []
                }
            };

            // CC and BCC
            if(cc.length > 0){
                eventData.obj.headers.CC = cc;
            }
            if(bcc.length > 0){
                eventData.obj.headers.BCC = bcc;
            }

            // // Add attachments
            // // - not required
            // that.$('.file_attachment').each(function(idx, fileElem){
            //     eventData.obj.attachments.push({
            //         _id: $(fileElem).attr('data-file-id'),
            //         name: $(fileElem).attr('data-file-name')
            //     });
            // });

            // Validate sending
            Api.event({
                data: eventData,
                response: {
                    "pkg.native.email" : function(response){
                        // Handle response (see if validated to send)

                        // Update the view code
                        if(response.body.code == 200){
                            // Ok, validated sending this email
                            console.log('Valid email to send');
                        } else {
                            // Failed, had an error

                            alert('Sorry, Invalid Email');

                            // $(elem).text('Send');
                            // $(elem).attr('disabled',false);
                            // that.disable_buttons = false;
                            that.cancel_sending(that, elem);
                            return false;
                        }

                        // Get rate-limit info
                        var tmp_rate_limit = response.body.data;

                        // Over rate limit?
                        if(tmp_rate_limit.current + 1 >= tmp_rate_limit.rate_limit){

                            alert('Sorry, Over the Rate Limit (25 emails per 6 hours)');

                            that.cancel_sending(that, elem);
                            return false;
                            
                        }

                        // All good, SEND Email (with a delay)
                        eventData.event = 'Email.send';
                        eventData.delay = 15;

                        // // Log
                        // clog('sending reply Email');
                        // clog(eventData);

                        Api.event({
                            data: eventData,
                            response: {
                                "pkg.native.email" : function(response){
                                    
                                    // Update the view code
                                    if(response.body.code == 200){
                                        // Sent successfully

                                    } else {
                                        // Failed, had an error sending

                                        alert('Sorry, we might have failed sending this email');
                                        
                                        that.failed_sending(that, elem);
                                        return false;
                                    }


                                    // Sent successfully! 

                                    // Add to Email thread?
                                    // - no, wait for the Email to be received, and it was be updated

                                    console.log(response);
                                    // debugger;
                                    that.after_sent(response, eventData.obj);

                                }
                            }, 
                            success: function(response, code, data, msg){
                                // Event at least got created OK (assume it is going to Send OK as well, because it passed validation)
                                // User can still cancel the event!
                                console.log(response);

                                if(code != 200){
                                    alert('Code not 200');
                                    console.log(data);
                                }

                                that.after_init_send(data.event_id);

                            }
                        });



                        // if validation ok, then continue to the next one
                        // - resolve or call?

                    }
                }
            });


            return false;

        },

        cancel_sending: function(that, elem){

            $(elem).attr('data-status','green');
            that.disable_buttons = false;
        },

        failed_sending: function(that, elem){
            // Actually Failed sending the email (via the email server, most likely, not a local failure)
            alert('failed sending!');
        },

        after_init_send: function(event_id){
            // Called after the Email.send action has been created, but is delayed (OK to still cancel it)

            this.$('.major-elem').addClass('nodisplay');
            this.$('.waiting-on-sent').removeClass('nodisplay');

            this.$('.waiting-on-sent').attr('data-event-id', event_id);

        },

        button_cancel_sending: function(ev){
            // re-opens the Draft of the email
            var that  = this,
                elem = ev.currentTarget;

            // Try and cancel sending (wait for confirmation of cancelation OK)
            var event_id = this.$('.waiting-on-sent').attr('data-event-id');
            console.info(event_id);

            this.$('.major-elem').addClass('nodisplay');
            this.$('.waiting-on-cancel-sent').removeClass('nodisplay');

            Api.event_cancel({
                data: {
                    event_id: event_id
                },
                success: function(response, code, data, msg){
                    // Make sure it was "DELETED"

                    if(data.data != "DELETED"){
                        // Failed deleting probably
                        // - todo: diagnose error codes (NOT_FOUND, etc.)

                    }

                    // Show compose pane/bar
                    that.$('.major-elem').addClass('nodisplay');
                    that.$('.compose-bar').removeClass('nodisplay');

                    // Re-enable send button
                    that.$('.send-button').attr('data-status', 'green');
                    that.disable_buttons = false;

                },
                error: function(response){
                    alert('Failed canceling!');
                }
            });

            return false;
        },

        after_sent: function(sendingServerResponse, emailObj){
            // Update Thread with "sent" dialog
            // - todo: show that we are waiting for the email to actually be parsed by Gmail and "caught" by Emailbox
            var that = this;

            this.trigger('sent', sendingServerResponse, emailObj);

            // This guy gets killed and then re-created

            return false;
        },

    });

});