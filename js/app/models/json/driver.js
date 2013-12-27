define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Driver = Backbone.Model.extend({

            urlRoot: "http://localhost/~nreed/wehicle_app/www/json/driver.",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id + ".json";
            }

        }),

        DriverCollection = Backbone.Collection.extend({

            model: Driver,

            url: Credentials.server_root + "drivers.json",

        });

    return {
        Driver: Driver,
        DriverCollection: DriverCollection
    };

});