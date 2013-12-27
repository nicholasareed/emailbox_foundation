define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Trip = Backbone.Model.extend({

            idAttribute: '_id',

            urlRoot: Credentials.server_root + "trip/",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id;
            },

            requestFunds: function(){
                return $.ajax({
                    url: Credentials.server_root + "bill/add/" + this.id,
                    cache: false
                });
            },

            payBills: function(){
                return $.ajax({
                    url: Credentials.server_root + "trip/billpay/" + this.id,
                    method: 'POST',
                    cache: false
                });
            }

        }),

        TripCollection = Backbone.Collection.extend({

            model: Trip,

            url: Credentials.server_root + "trips",
            urlRoot: Credentials.server_root + "trips",

            initialize: function(models, options){
                options = options || {};
                this.options = options;
                if(options.car_id){
                    this.url = this.url + '/car/' + options.car_id;
                }
                if(options.driver_id){
                    this.url = this.url + '/driver/' + options.driver_id;
                }
            },

            comparator: function(model){
                return -1 * moment(model.get('start_time'), "YYYYMMDD HHmmss"); // 20131106T230554+0000
            },

            findByLastTrip: function(){
                var deferred = $.Deferred();

                // var val = {};
                // try {
                //     val = this.last();
                // } catch(err){
                //     deferred.reject();
                //     return deferred.promise();
                // }
                deferred.resolve(this.first());
                
                return deferred.promise();
            }

        });

    return {
        Trip: Trip,
        TripCollection: TripCollection
    };

});