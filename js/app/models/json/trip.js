define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Trip = Backbone.Model.extend({

            urlRoot: Credentials.server_root + "trip.",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id + ".json";
            }

        }),

        TripCollection = Backbone.Collection.extend({

            model: Trip,

            url: Credentials.server_root + "trips.json",

            findByLastTrip: function(){
                var deferred = $.Deferred();

                // var val = {};
                // try {
                //     val = this.last();
                // } catch(err){
                //     deferred.reject();
                //     return deferred.promise();
                // }
                deferred.resolve(this.last());
                
                return deferred.promise();
            }

        });

    return {
        Trip: Trip,
        TripCollection: TripCollection
    };

});