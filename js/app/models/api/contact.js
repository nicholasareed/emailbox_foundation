define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Api                 = require('api'),
        // ModelThread         = require('app/models/thread'),

        Contact = Backbone.DeepModel.extend({

            idAttribute: '_id',
            modelName: 'Contact',
            url: App.Credentials.base_api_url,

            sync: Backbone.Model.emailbox_sync,

            initialize: function () {
                
            }

        }),

        ContactCollection = Backbone.Collection.extend({

            model: Contact,
            url: App.Credentials.base_api_url,

            search_conditions: {},

            sync: Backbone.Collection.emailbox_sync,
            comparator: function(model1){
                try {
                    var fullName = model1.attributes.common.name,
                        realFullName = fullName ? fullName : false,
                        useAddr = realFullName ? false : true,
                        result = useAddr && model1.attributes.common.emails.length ? model1.attributes.common.emails[0].address : realFullName;
                } catch(err){
                    return "";
                }

                return result;
            },

            initialize: function(models, options){
                options = options || {};
                this.options = options;
            },

            parse_and_sort_contacts: function(){

                // eh, need to make this work with newer contact searching and adding

                var contacts = _.map(this.toJSON(),function(contact){
                    // Iterating over every contact we have
                    // - returning an array of emails, with each email having the contact data included
                    // - instead of sorting by contact, we go by email address as the primary display
                    
                    var data = {
                        id: contact._id, 
                        name: contact.common.name,
                        email: ''
                    };

                    var tmp_emails = [];

                    // Iterate over emails for contact
                    // - remove emails we do not care about, like @craigslist
                    _.each(contact.common.emails,function(email, index){
                        var tmp_data = _.clone(data);

                        // Don't use contacts that are from craigslist (too many sale- emails that we don't care about)
                        if(email.address.indexOf('@craigslist') != -1){
                            // return out of _.each
                            return;
                        }

                        // Set email value
                        tmp_data.email = email.address;

                        // console.log('adding');
                        tmp_emails.push(tmp_data);
                    })

                    if(tmp_emails.length < 1){
                        return [];
                    }

                    // console.log('return: ' + tmp_emails.length);
                    return tmp_emails;

                });
                contacts = _.reduce(contacts,function(contact,next){
                    return contact.concat(next);
                });
                contacts = _.compact(contacts); // get rid of empty arrays
                contacts = _.uniq(contacts);

                // // // Sort
                // // contacts = App.Utils.sortBy({
                // //  arr: contacts,
                // //  path: 'email',
                // //  direction: 'desc', // desc
                // //  type: 'string'
                // // });
                // console.log(contacts.length);

                this._parsed = contacts;

            }

        });

    return {
        Contact: Contact,
        ContactCollection: ContactCollection
    };

});