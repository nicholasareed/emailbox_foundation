define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Api                 = require('api'),
        ModelEmail          = require('app/models/email'),

        Thread = Backbone.DeepModel.extend({

            idAttribute: '_id',
            modelName: 'Thread',
            url: App.Credentials.base_api_url,

            _related: {},
            related: [
                {
                    key: 'Email',
                    type: 'hasMany',
                    collection: ModelEmail.EmailCollection,
                    path: 'attributes.thread_id',
                    comparator: 'comparator_reverse'
                }
            ],

            sync: Backbone.Model.emailbox_sync,

            initialize: function () {
                _.bindAll(this, 'fetchRelated');
                this._related = {};
            },

            fetchRelated: function(options){
                var that = this,
                    defaultOptions = {
                        reset: false
                    };
                options = _.extend(defaultOptions, options || {});
                // console.log(this.related.length);
                _.each(this.related, function(related){
                    var collection;
                    if(that._related[related.key] == undefined){

                        collection = new related.collection;
                        that._related[ related.key ] = collection;
                        collection.search_conditions = {};
                        collection.search_conditions[ related.path ] = that.attributes._id

                        // comparator
                        if(related.comparator){
                            collection.comparator = collection[related.comparator];
                        }

                        collection.on('all', function(eventName, coll){
                            // console.log(eventName);
                            // this._related[ related.key ] = collection; // removing this line causes a fuckup!
                            this.trigger('related:' + eventName,coll);
                            this.trigger('related:' + related.key +':' + eventName,coll);
                            console.log('related:' + related.key +':' + eventName,coll);
                            // console.log('was reset');
                        },that);

                        // collection.on('add', function(model){
                        //     model.on('change', function(){
                        //         // this.trigger('related:' + eventName,coll);
                        //         // this.trigger('related:' + related.key +':' + eventName,coll);
                        //         console.log('ChANGED');
                        //     }, that);
                        // }, that);

                    } else {
                        collection = that._related[related.key];
                    }

                    collection.fetch(options);
                });

            },

            fetchRelated2: function(options){
                var that = this,
                    defaultOptions = {
                        reset: false
                    };
                options = _.extend(defaultOptions, options || {});
                _.each(this.related, function(related){
                    if(that._related[ related.key ] == undefined){

                        // Create the collection and store it

                        var collection = new related.collection;
                        that._related[ related.key ] = collection;

                        collection.search_conditions = {};
                        collection.search_conditions[ related.path ] = that.attributes._id

                        // comparator
                        if(related.comparator){
                            collection.comparator = collection[related.comparator];
                        }

                        collection.on('reset', function(coll){
                            this._related[ related.key ] = collection; // removing this line causes a fuckup!
                            this.trigger('related:reset',coll);
                            this.trigger('related:' + related.key +':reset',coll);
                            // console.log('was reset');
                        },that);

                        // collection.on('all', function(eventName, coll){
                        //     this._related[ related.key ] = collection; // removing this line causes a fuckup!
                        //     this.trigger('related:' + eventName,coll);
                        //     this.trigger('related:' + related.key +':' + eventName,coll);
                        //     // console.log('was reset');
                        // },that);

                    }

                    // Fetch with options
                    that._related[ related.key ].fetch(options);
                });

            }


        }),

        ThreadCollection = Backbone.Collection.extend({

            model: Thread,
            url: App.Credentials.base_api_url,

            search_conditions: {},

            sync: Backbone.Collection.emailbox_sync,
            comparator: function(model1, model2){
                var m1 = moment(model1.attributes.attributes.last_message_datetime),
                    m2 = moment(model2.attributes.attributes.last_message_datetime);
                if(m1 > m2){
                    return -1;
                }
                if(m1 == m2){
                    return 0;
                }
                return 1;
            },

            initialize: function(models, options){
                options = options || {};
                this.options = options;
                
                if(options.type == 'label'){
                    var key = 'attributes.labels.' + options.text;
                    this.search_conditions[key] = 1;
                }

            }

        });

    return {
        Thread: Thread,
        ThreadCollection: ThreadCollection
    };

});