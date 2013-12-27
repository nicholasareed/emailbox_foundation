define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),

        // AppData             = require(''),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        User = Backbone.Model.extend({

            idAttribute: '_id',
            
            urlRoot: Credentials.server_root + "user",

            initialize: function () {
                this.url = this.urlRoot;
            },

            login: function(){
                // Log in a user with credentials
                // - store login information in the global scope
            }

        });

    return {
        User: User
    };

});