define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),

        tpl                 = require('text!tpl/FullLoading.html'),
        
        Handlebars          = require('handlebars-adapter'),
        template = Handlebars.compile(tpl);


    return Backbone.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            // Write html
            this.$el.html(template());
            return this;
        }

    });

});