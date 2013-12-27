define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        tpl                 = require('text!tpl/ComposeContacts.html'),
        Utils               = require('utils'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        initialize: function () {

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
            'click .addresses .shrink' : 'hide_all_addresses'

        },

        render: function () {

            // Figure out who I'm replying to
            // - inlcude everybody in the email that isn't myself
            // - by default, because it is easier to remove than to add people
            var data = this.getParticipants();

            // Base HTML
            this.$el.html(template(data));

            return this;
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
            // Removes a participant from the HTML
            var elem = ev.currentTarget;

            $(elem).parents('.participant').slideUp();
            window.setTimeout(function(){
                $(elem).remove();
            },1000);
        },

        getParticipants: function(){
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