define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Error = Backbone.Model.extend({

            urlRoot: Credentials.server_root + "error.",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id + ".json";
            }

        }),

        ErrorCollection = Backbone.Collection.extend({

            model: Error,

            url: Credentials.server_root + "errorcodes.json"

        });

    return {
        Error: Error,
        ErrorCollection: ErrorCollection
    };

});