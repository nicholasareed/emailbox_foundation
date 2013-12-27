define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Leg = Backbone.Model.extend({

            idAttribute: '_id',
            
            urlRoot: Credentials.server_root + "leg/",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id;
            }

        }),

        LegCollection = Backbone.Collection.extend({

            model: Leg,

            urlRoot: Credentials.server_root + "trips/",

            initialze: function(){
                this.url = this.urlRoot + '';
            },

            fetchbyTrip: function(){
                var deferred = $.Deferred();

                // var val = {};
                // try {
                //     val = this.last();
                // } catch(err){
                //     deferred.reject();
                //     return deferred.promise();
                // }
                this.url = this.urlRoot + this.trip_id + '/legs';
                this.fetch({prefill: true, cache: true, reset: true});

                deferred.resolve(this); // resolve with "this" ??s
                
                return deferred.promise();
            }

        });

    return {
        Leg: Leg,
        LegCollection: LegCollection
    };

});