define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Credentials         = JSON.parse(require('text!app/utils/credentials.json')),

        Car = Backbone.Model.extend({

            idAttribute: '_id',
            
            urlRoot: Credentials.server_root + "car/",

            initialize: function () {
                // ok
                this.url = this.urlRoot + this.id;
            }

        }),

        CarCollection = Backbone.Collection.extend({

            model: Car,

            url: Credentials.server_root + "cars",

            findDefault: function(){

                var deferred = $.Deferred();

                // console.log(this.toJSON());
                var last_running = null,
                    last_id = null;
                this.each(function(item){
                    // console.log(item.toJSON().latest_data.lastRunningTimestamp);
                    var m = moment(item.toJSON().latest_data.lastRunningTimestamp, "YYYYMMDD HHmmss"); // 20131106T230554+0000
                    if (m > last_running){
                        last_running = m;
                        last_id = item.toJSON()._id;
                    }
                });

                // var val = {};
                // try {
                //     val = this.last();
                // } catch(err){
                //     deferred.reject();
                //     return deferred.promise();
                // }
                deferred.resolve(last_id);
                
                return deferred.promise();
            }

        });

    return {
        Car: Car,
        CarCollection: CarCollection
    };

});