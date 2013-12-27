define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        tpl                 = require('text!tpl/Search.html'),

        template = _.template(tpl);

    return Backbone.View.extend({

        initialize: function () {
            this.render();
            // this.collection.on("reset", this.render, this);
        },

        events: {
            'click .quicklink' : 'quicklink'
        },

        render: function () {
            this.$el.html(template());
            return this;
        }

    });

});