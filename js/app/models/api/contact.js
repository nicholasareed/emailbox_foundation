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
                var fullName = model1.common.name,
                    realFullName = fullName ? fullName : false,
                    useAddr = realFullName ? false : true,
                    result = useAddr && model1.common.emails.length() ? model1.common.emails[0].address : realFullName;

                return result;
            },

            initialize: function(models, options){
                options = options || {};
                this.options = options;
            }

        });

    return {
        Contact: Contact,
        ContactCollection: ContactCollection
    };

});