define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        ComposeContactsView = require('app/views/ComposeContacts'),
        tpl                 = require('text!tpl/Compose.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);

    return Backbone.View.extend({

        initialize: function () {
            this.render();
            // this.collection.on("reset", this.render, this);
        },

        events: {
            'click .quicklink' : 'quicklink'
        },

        render: function () {
            // Base HTML
            this.$el.html(template());

            // Render Contacts SubView
            this._contactsSubView = new ComposeContactsView({
                el: this.$('.compose_contacts').get(0),
                model: this.model
            });

            return this;
        }

    });

});