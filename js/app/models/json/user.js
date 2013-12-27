define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        User = Backbone.Model.extend({

            urlRoot: Credentials.server_root + "user.1.json",

            initialize: function () {
                this.url = this.urlRoot;
            }

        });

    return {
        User: User
    };

});