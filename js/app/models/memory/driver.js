define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),

        _datas = [{
            "id": 1,
            "user_id" : 1,
            "name": "Me-Personal",
            "is_default" : 0,
            "default_driver_id" : 1,
            "active" : 1
        },
        {
            "id": 2,
            "user_id" : 1,
            "name": "Me-Work",
            "is_default" : 0,
            "default_driver_id" : 1,
            "active" : 1
        },
        {
            "id": 3,
            "user_id" : 1,
            "name": "Girlfriend",
            "is_default" : 0,
            "default_driver_id" : 1,
            "active" : 1
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
                    findById(options.data.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Driver: _ModelName,
        DriverCollection: _NameCollection
    };

});