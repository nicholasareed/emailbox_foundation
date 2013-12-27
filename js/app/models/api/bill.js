define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Bill = Backbone.Model.extend({

            idAttribute: '_id',

            urlRoot: Credentials.server_root + "bill/",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id;
            },

            pay: function(){
                return $.ajax({
                    url: Credentials.server_root + "bill/pay/" + this.id,
                    method: 'POST',
                    cache: false
                });
            }

        }),

        BillCollection = Backbone.Collection.extend({

            model: Bill,

            urlRoot: Credentials.server_root + "bills",

            comparator: function(model1, model2){
                if (model1.get('_id') > model2.get('_id')){
                    return -1;
                }
                if (model1.get('_id') < model2.get('_id')){
                    return 1;
                }
                return 0;
            },

            initialize: function(models, options){

            },

            initialze: function(){
                this.url = this.urlRoot + '';
            },

            fetchForTrip: function(){
                var deferred = $.Deferred();

                // var val = {};
                // try {
                //     val = this.last();
                // } catch(err){
                //     deferred.reject();
                //     return deferred.promise();
                // }
                this.url = this.urlRoot + '/trip/' + this.trip_id;
                this.fetch({prefill: true, cache: true, reset: true});

                deferred.resolve(this); // resolve with "this" ??s
                
                return deferred.promise();
            },

            fetchForDriver: function(){
                var deferred = $.Deferred();

                // var val = {};
                // try {
                //     val = this.last();
                // } catch(err){
                //     deferred.reject();
                //     return deferred.promise();
                // }
                this.url = this.urlRoot + '/driver/' + this.driver_id;
                this.fetch({prefill: true, cache: true, reset: true});

                deferred.resolve(this); // resolve with "this" ??s
                
                return deferred.promise();
            },

            findForTrip: function(trip_id){

                this.url = Credentials.server_root + "bills/trip/" + trip_id;

                return this.fetch( { prefill: true, reset: true } );

                // var deferred = $.Deferred();


                // // var val = {};
                // // try {
                // //     val = this.last();
                // // } catch(err){
                // //     deferred.reject();
                // //     return deferred.promise();
                // // }
                // deferred.resolve(this.last());
                
                // return deferred.promise();
            }

        });

    return {
        Bill: Bill,
        BillCollection: BillCollection
    };

});