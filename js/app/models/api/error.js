define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Error = Backbone.Model.extend({

            idAttribute: '_id',
            
            urlRoot: Credentials.server_root + "error/",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id;
            }

        }),

        ErrorCollection = Backbone.Collection.extend({

            model: Error,

            url: Credentials.server_root + "errors",

            initialize: function(models, options){
                if(options.car_id){
                    this.url = this.url + '/' + options.car_id;
                }
            }

        });

    return {
        Error: Error,
        ErrorCollection: ErrorCollection
    };

});