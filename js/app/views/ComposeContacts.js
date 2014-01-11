define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        tpl                 = require('text!tpl/ComposeContacts.html'),
        tpl_Searching       = require('text!tpl/ContactsQuickSearch.html'),
        tpl_Recipient       = require('text!tpl/ContactsRecipient.html'), // basically a partial, not a complete View
        Utils               = require('utils'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl),
        template_Searching  = Handlebars.compile(tpl_Searching),
        template_Recipient  = Handlebars.compile(tpl_Recipient);

    return Backbone.View.extend({

        initialize: function () {
            _.bindAll(this, 'checking_autocomplete', 'update_autocomplete');
            // expecting a complete Email list of participants (in thread)
            this.render();
            
            // also expects this.model to be a Thread model with fetchRelated available
            // - and toJSON() gets the related 'Email's

        },

        events: {
            'click .quicklink' : 'quicklink',
            'click .show_all_addresses' : 'show_all_addresses',
            'click .recipient-switcher' : 'switch_address_type',
            'click .addresses .participant' : 'remove_participant',
            'click .addresses .shrink' : 'hide_all_addresses',

            // 'click .address_list .add .closeButton' : 'close_dropdown',
            'click .address_list .add .openButton' : 'quick_add_address',
            // 'click .address_list .add .addEmail' : 'quick_add_email',
            // 'click .quick_contacts .btn-toolbar a' : 'tab_clicked',
            'click .addresses .contact' : 'chose_contact',

            'focus .add input' : 'focus_input_add_contact',
            'blur .add input' : 'blur_input_add_contact',
            // 'click .searching_contacts .contact' : 'chose_contact'

        },

        // // Add focus listener on autocomplete
        // this.$('.add input').on('focus', $.proxy(this.focus_input_add_contact, this));
        // this.$('.add input').on('blur', $.proxy(this.blur_input_add_contact, this));


        render: function () {

            // Figure out who I'm replying to
            // - inlcude everybody in the email that isn't myself
            // - by default, because it is easier to remove than to add people
            var data = this.getParticipants();

            // Base HTML
            this.$el.html(template(data));

            return this;
        },

        quick_add_address: function(ev){
            // Opens up the quick-add dialog
            var that = this,
                elem = ev.currentTarget;

            // Already displayed?
            // - remove it
            var $add = $(elem).parents('.add');
            if($add.next() && $add.next().hasClass('quick_contacts')){
                $add.next().remove();
                return false;
            }

            // Remove 'searching' box
            // - clearing the non-related elements out of the way basically (Search or QuickContacts)
            if($add.next() && $add.next().hasClass('searching_contacts')){
                $add.next().remove();
                return false;
            }


            // // Create template
            // var template = App.Utils.template('t_contacts_quick_add');

            // append after this .add element
            $(elem).parents('.add').after(template_Searching({
                show_quick: true,
                frequent: [],
                in_thread: that.getParticipants()
            }));

            return false;
        },

        focus_input_add_contact: function(ev){
            // Typing in the add contact input
            var that = this,
                elem = ev.currentTarget;

            // start autocompletetimeout
            that.current_autocomplete_elem = elem;

            // Already displayed?
            // - remove it
            var $add = $(elem).parents('.add');
            if($add.next() && $add.next().hasClass('searching_contacts')){
                // $add.next().remove();
                that.checking_autocomplete(); // run now (everything already exists though)
                return false;
            }

            // Remove 'quick_contacts' box
            // - only showing auto-complete or QuickContacts, not both at the same time
            if($add.next() && $add.next().hasClass('quick_contacts')){
                $add.next().remove();
                // return false;
            }

            // append after this .add element
            // - template already created
            $(elem).parents('.add').after(template_Searching({
                show_init: true
            }));

            // Already text typed in there?
            that.checking_autocomplete();


            return;
        },

        blur_input_add_contact: function(){
            // when leaving contact search box
            var that = this;

            // Clear the timeout
            window.clearTimeout(that.autocompleteTimeout);

            return;
        },

        checking_autocomplete: function(){
            var that = this;

            that.autocompleteTimeout = window.setTimeout(function(){
                // Check for updates to field
                that.update_autocomplete();
                that.checking_autocomplete();
            },100);
        },

        update_autocomplete: function(){
            // check for differences in input field
            var that = this,
                elem = that.current_autocomplete_elem,
                search_val = $.trim($(elem).val().toLowerCase());

            if(search_val == $(elem).attr('last-val')){
                return;
            }
            $(elem).attr('last-val', search_val);

            console.log(search_val);

            var total = null,
                return_result = null

            if(search_val != ''){
                var result = [];
                var Contacts = App.Data.Store.Contact._parsed;
                // console.log('Contacts length');
                // console.log(Contacts.length);
                // console.dir(Contacts.length);
                _.each(Contacts, function(contact){
                    // console.log(contact);
                    if(contact.name.toLowerCase().indexOf(search_val) != -1){
                        // found
                        result.push(contact);
                        return true;
                    }
                    if(contact.email.toLowerCase().indexOf(search_val) != -1){
                        // found
                        result.push(contact);
                        return true;
                    }
                    return false;
                });

                total = result.length;
                return_result = result.splice(0,5);

            }

            // Update template

            // append after this .add element
            $(elem).parents('.address_list').find('.searching_contacts').html(template_Searching({
                show_total: true,
                total: total,
                result: return_result,
                all_contacts: App.Data.Store.Contact.length
            }));
            // console.log(App.Data.Store.Contact);

            return;
        },

        chose_contact: function(ev){
            // add contact to To, Cc, or Bcc
            var that = this,
                elem = ev.currentTarget;

            var email = $(elem).attr('data-email');

            // Add email to html
            // - should highlight the email address after chosen

            // Remove if already in there?
            var $exists = $(elem).parents('.address_list').find('.participant[data-email="'+email+'"]');
            if($exists.length > 0){
                $exists.remove();
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }

            // If not exists, display it
            $(elem).parents('.address_list').find('.add').before(template_Recipient(email));

            return false;

        },

        show_all_addresses: function(ev){
            // Switch to "complex contacts" mode (multiple To, CC, Bcc)
            var that = this,
                elem = ev.currentTarget;

            this.$('.single_address').addClass('nodisplay');
            this.$('.addresses').removeClass('nodisplay');

            return false;

        },

        hide_all_addresses: function(ev){
            this.$('.address_list').removeClass('active');
            this.$('.recipient-switcher').removeClass('active');
        },

        switch_address_type: function(ev){
            // Switch showing one of To/CC/BCC
            var that = this,
                elem = ev.currentTarget;

            this.$('.addresses').removeClass('nodisplay');

            if($(elem).hasClass('active')){
                // already active
                return false;
            }

            // Add/remove tab classes
            this.$('.recipient-switcher').removeClass('active');
            $(elem).addClass('active');

            var attr = $(elem).attr('data-type');
            $('.address_list').removeClass('active');

            this.$('.address_list[data-type="'+attr+'"]').addClass('active');

            // // Remove currently active
            // var $addresses = $(elem).parents('.addresses');
            // $addresses.find('.address_list').removeClass('active');
            // $addresses.find('button').removeClass('btn-inverse').addClass('btn-info');

            // // Make current selection active
            // $(elem).removeClass('btn-info').addClass('btn-inverse');
            // var attr = $(elem).attr('data-type');
            // $addresses.find('.address_list[data-type="'+attr+'"]').addClass('active');

            return false;
        },

        remove_participant: function(ev){
            // Removes an email address
            var elem = ev.currentTarget;

            $(elem).parents('.participant').slideUp();
            window.setTimeout(function(){
                $(elem).remove();
            },1000);
        },

        getParticipants: function(){
            // Gets existing participants from the other emails in the thread
            var that = this;

            var json = this.model.toJSON(),
                data = {
                    Email: [],
                    Participants: []
                };

            if(json.Email && json.Email.length > 0){
                data.Email = json.Email;
                // debugger;
                var tmp_participants = _.map(data.Email, function(email){
                    // Get the From and Reply-To addresses
                    var get_from = ['To','From','Reply-To'];
                    var addresses = [];
                    _.each(get_from,function(address){
                        if(email.original.headers[address + '_Parsed'] != undefined){
                            _.each(email.original.headers[address + '_Parsed'],function(parsed_email){
                                // My email?
                                var ok = true;

                                // Sent from myself
                                // - disclude? (only if no others?)
                                // if($.inArray(parsed_email[1], App.Data.UserEmailAccounts_Quick) != -1){
                                //  return false;
                                // }

                                // Add address to list
                                addresses.push(parsed_email[1]);

                            });
                        }
                    });
                    return addresses;
                });
                // console.log(tmp_participants);
                // debugger;
                
                // merging participants? seems clumsy
                var tmp_participants2 = [];
                _.each(tmp_participants,function(p1){
                    _.each(p1,function(p2){
                        tmp_participants2.push(p2);
                    });
                });

                // Unique
                tmp_participants2 = _.uniq(tmp_participants2);

                // Filter to valid emails
                tmp_participants2 = _.filter(tmp_participants2,function(p){
                    // valid email?
                    if(Utils.Validate.email(p)){
                        return true;
                    }
                    return false;
                });

                // All participants
                data.Participants = tmp_participants2;

                // To
                // - either Reply-To or From
                // - if the last email is from me, then set the same info? (only go 2 deep before it breaks)
                var tmp_last = data.Email[data.Email.length - 1];
                var still_me = false;
                // console.log(tmp_last);
                try {
                    if($.inArray(tmp_last.original.headers.From_Parsed[0][1], App.Data.UserEmailAccounts_Quick) != -1){
                        // is me
                        // - try the next email
                        tmp_last = data.Email[data.Email.length - 2];
                        if($.inArray(tmp_last.original.headers.From_Parsed[0][1], App.Data.UserEmailAccounts_Quick) != -1){
                            // Is still me, just go with my same To address
                            still_me = true;
                        } else {

                        }
                    }
                } catch(err){

                }
                if(still_me){
                    // using my "To" data
                    data.Participants_To = tmp_last.original.headers['To_Parsed'];
                } else {
                    data.Participants_To = tmp_last.original.headers['Reply-To_Parsed'].length > 0 ? tmp_last.original.headers['Reply-To_Parsed'] : tmp_last.original.headers['From_Parsed'];
                }

                // Carbon Copies
                data.Participants.CC = tmp_last.original.headers['Cc_Parsed'];

                // Single email recipient (conversation with one person)
                // - mailing list?
                if(data.Participants_To.length == 1 && data.Participants.CC.length == 0){
                    data.only_single_address = data.Participants_To[0];
                    data.single_address_class = 'nodisplay';
                }

                // got all the participants!
                console.log('Participant data:');
                console.log(data);
                // debugger;

            }

            return data;
        }

    });

});