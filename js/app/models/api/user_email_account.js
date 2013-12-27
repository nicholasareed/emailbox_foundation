define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Api                 = require('api'),

        UserEmailAccount = Backbone.DeepModel.extend({

            idAttribute: '_id',
            modelName: 'UserEmailAccount',
            url: App.Credentials.base_api_url,

            sync: Backbone.Model.emailbox_sync,

            initialize: function () {
                
            }

        }),

        UserEmailAccountCollection = Backbone.Collection.extend({

            model: UserEmailAccount,
            url: App.Credentials.base_api_url,

            search_conditions: {},

            sync: Backbone.Collection.emailbox_sync,

            initialize: function(models, options){
                options = options || {};
                this.options = options;
            },

        });

    return {
        UserEmailAccount: UserEmailAccount,
        UserEmailAccountCollection: UserEmailAccountCollection
    };

});