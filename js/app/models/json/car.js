define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Car = Backbone.Model.extend({

            urlRoot: Credentials.server_root + "car.",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id + ".json";
            }

        }),

        CarCollection = Backbone.Collection.extend({

            model: Car,

            url: Credentials.server_root + "cars.json",

        });

    return {
        Car: Car,
        CarCollection: CarCollection
    };

});