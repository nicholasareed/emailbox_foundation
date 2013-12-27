define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),

        _datas = [{
            id: 1,
            user_id : 1,
            driver_id : 1,
            car_id : 1, 
            miles : 24.5,
            drive_time: 2280, // 38 minutes * 60 seconds,
            start_time: "Sat Nov 09 2013 08:22:50 GMT-0800",
            end_time: "Sat Nov 09 2013 09:37:50 GMT-0800",
            created: "Sat Nov 09 2013 09:40:00 GMT-0800",
            legs: [
                {
                    id: 1,
                    trip_id: 1,
                    car_id: 1,
                    carvoyant_leg_id: 23,
                    user_id: 1,
                    driver_id : 1,
                    start_time: "Sat Nov 09 2013 08:22:50 GMT-0800",
                    end_time: "Sat Nov 09 2013 08:32:50 GMT-0800",
                    start_gps: "28.2135,-82.647656",
                    end_gps: "28.2068,-82.667691",
                    fuel: []
                },
                {
                    id: 2,
                    trip_id: 1,
                    car_id: 1,
                    carvoyant_leg_id: 24,
                    user_id: 1,
                    driver_id : 1,
                    start_time: "Sat Nov 09 2013 08:52:50 GMT-0800",
                    end_time: "Sat Nov 09 2013 09:13:50 GMT-0800",
                    start_gps: "28.2068,-82.667691",
                    end_gps: "28.20227,-82.664303",
                    fuel: [{
                        id: 1,
                        leg_id: 2,
                        trip_id: 1,
                        percent_diff: 72.2,
                        percent: 99.4,
                        type: 'unleaded',
                        amount: 23.8287,
                        per_gallon: 3.4999,
                        total_cost: 83.40 // taxes?
                    }]
                },
                {
                    id: 3,
                    trip_id: 1,
                    car_id: 1,
                    carvoyant_leg_id: 25,
                    user_id: 1,
                    driver_id : 1,
                    start_time: "Sat Nov 09 2013 09:22:50 GMT-0800",
                    end_time: "Sat Nov 09 2013 09:32:50 GMT-0800",
                    start_gps: "28.20227,-82.664303",
                    end_gps: "28.2135,-82.647656",
                    fuel: []
                },
            ]
        }],

        findById = function (id) {
            var deferred = $.Deferred(),
                _tmp_data = null,
                l = _datas.length,
                i;
            for (i = 0; i < l; i = i + 1) {
                if (_datas[i].id === id) {
                    _tmp_data = _datas[i];
                    break;
                }
            }
            deferred.resolve(_tmp_data);
            return deferred.promise();
        },


        _ModelName = Backbone.Model.extend({

            initialize: function () {

            },

            sync: function (method, model, options) {
                if (method === "read") {
                    findById(parseInt(this.id)).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        _NameCollection = Backbone.Collection.extend({

            model: _ModelName,

            sync: function (method, model, options) {
                if (method === "read") {
                    // findById(options.data.id).done(function (data) {
                    //     options.success(data);
                    // });
                    console.info('here');
                    console.log(_datas);
                    options.success(_datas) // all data
                }
            }

        });

    return {
        Trip: _ModelName,
        TripCollection: _NameCollection
    };

});