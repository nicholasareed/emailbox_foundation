define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Driver = Backbone.Model.extend({

            idAttribute: '_id',
            
            urlRoot: Credentials.server_root + "driver/",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id;
            }

        }),

        DriverCollection = Backbone.Collection.extend({

            model: Driver,

            url: Credentials.server_root + "drivers",

            comparator: function(model){
                return model.get('is_me');
            }

        });

    return {
        Driver: Driver,
        DriverCollection: DriverCollection
    };

});