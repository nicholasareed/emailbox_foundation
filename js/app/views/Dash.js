define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone-adapter'),

        models_email        = require('app/models/email'),
        tpl                 = require('text!tpl/Dash.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);


    return Backbone.View.extend({


        _odometers: {
            sent: {
                id: 'countSent',
                name: 'Sent Today',
                collectionQuery: 'countSent',
                event: 'CountSent',
                instance: null,
                collectionValueProp: '_countSentVal'
            },
            received: {
                id: 'countReceived',
                name: 'Received Today',
                collectionQuery: 'countReceived',
                event: 'CountReceived',
                instance: null,
                collectionValueProp: '_countReceivedVal'
            }
        },

        initialize: function () {
            var that = this;
            _.bindAll(this, 
                'refreshCounts',
                'refresh_odometer_elements'
                );

            this.render();

            // this.model.on("reset", this.render, this); 
            // this.model.on("sync", this.render, this); 
            this.collection = new models_email.EmailCollection();

            _.each(this._odometers, function(elem, key){
                that.collection.on('update:' + elem.event, that.refresh_odometer_elements, that); // like a 'fetch' except using Api.count
            }); // 'this' context

            // this.collection.on('update:CountSent', this.refresh_odometers, this);
            // this.collection.on('update:CountReceived', this.refresh_odometers, this); // necessary if already firing once when the odometers are updated?

            this.refreshCounts();

            // Listen for new emails to change the board
            Api.Event.on({
                event: ['Email.new','Email.send']
            },function(event){
                that.refreshCounts();
            });

        },

        events: {
            'click .trigger-refresh' : 'refreshCounts'
        },

        render: function (first_time) {
            var that = this;

            // Builds the outline basically
            this.$el.html(template({
                odometers: that._odometers
            }));

            // Create odometer instances
            _.each(this._odometers, function(elem, key){
                // that.collection[elem.collectionQuery](); // like a 'fetch' except using Api.count
                // console.log(elem);
                // console.log(key);
                // console.log(that._odometer
                 that._odometers[key].instance = new Odometer({
                    el: that.$('#' + elem.id).get(0)

                    // Any option (other than auto and selector) can be passed in here
                    // format: '',
                    // theme: 'plaza'
                });

                // that.od.update( this.collection.remoteCountVal );

            });

            // that.od = new Odometer({
            //   el: that.$('#odometer').get(0)

            //   // Any option (other than auto and selector) can be passed in here
            //   // format: '',
            //   // theme: 'plaza'
            // });

            //     // setTimeout(function(){
            //     //     that.od.update(900);
            //     // }, 2000);

            //     return this;
            // }

            // // Update values
            // that.od.update( this.collection.remoteCountVal );

            // // Write html
            // // - expecting a car to come in
            // this.$el.html(template({}));

            // // Enable swiping
            // Hammer(this.el, {
            //     swipe_velocity : 0.5
            // });


            return this;
        },

        refreshCounts: function(){
            var that = this;

            // Runs necessary Api.count() queries via collection
            
            _.each(this._odometers, function(elem, key){
                that.collection[elem.collectionQuery](); // like a 'fetch' except using Api.count
            });

        },
        
        refresh_odometer_elements: function(){
            var that = this;
            // Refresh the views for each of the _odometer elements
            _.each(this._odometers, function(elem, key){
                var diff = elem.instance.update(that.collection[elem.collectionValueProp]); // returns value property for count
                if(diff){
                    that.$('#' + elem.id).parents('.odometer-holder').css('background-color','#AD310B');
                    window.setTimeout(function(){
                        that.$('#' + elem.id).parents('.odometer-holder').css('background-color','#444');
                    }, 3000);
                }
            });
        }

    });

});