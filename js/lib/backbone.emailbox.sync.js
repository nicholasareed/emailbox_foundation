//     (c) 2012 Raymond Julin, Keyteq AS
//     Backbone.touch may be freely distributed under the MIT license.
(function (factory) {

    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone'], factory);
    } else {
        // Browser globals
        factory(_, Backbone);
    }
}(function (_, Backbone) {

    "use strict";



    /**
     * Semaphore mixin; can be used as both binary and counting.
     **/
    Backbone.Semaphore = {
        _permitsAvailable: null,
        _permitsUsed: 0,

        acquire: function() {
            if ( this._permitsAvailable && this._permitsUsed >= this._permitsAvailable ) {
                throw new Error( 'Max permits acquired' );
            }
            else {
                this._permitsUsed++;
            }
        },

        release: function() {
            if ( this._permitsUsed === 0 ) {
                throw new Error( 'All permits released' );
            }
            else {
                this._permitsUsed--;
            }
        },

        isLocked: function() {
            return this._permitsUsed > 0;
        },

        setAvailablePermits: function( amount ) {
            if ( this._permitsUsed > amount ) {
                throw new Error( 'Available permits cannot be less than used permits' );
            }
            this._permitsAvailable = amount;
        }
    };

    /**
     * A BlockingQueue that accumulates items while blocked (via 'block'),
     * and processes them when unblocked (via 'unblock').
     * Process can also be called manually (via 'process').
     */
    Backbone.BlockingQueue = function() {
        this._queue = [];
    };
    _.extend( Backbone.BlockingQueue.prototype, Backbone.Semaphore, {
        _queue: null,

        add: function( func ) {
            if ( this.isBlocked() ) {
                this._queue.push( func );
            }
            else {
                func();
            }
        },

        // Some of the queued events may trigger other blocking events. By
        // copying the queue here it allows queued events to process closer to
        // the natural order.
        //
        // queue events [ 'A', 'B', 'C' ]
        // A handler of 'B' triggers 'D' and 'E'
        // By copying `this._queue` this executes:
        // [ 'A', 'B', 'D', 'E', 'C' ]
        // The same order the would have executed if they didn't have to be
        // delayed and queued.
        process: function() {
            var queue = this._queue;
            this._queue = [];
            while ( queue && queue.length ) {
                queue.shift()();
            }
        },

        block: function() {
            this.acquire();
        },

        unblock: function() {
            this.release();
            if ( !this.isBlocked() ) {
                this.process();
            }
        },

        isBlocked: function() {
            return this.isLocked();
        }
    });


    function emailbox_sync_model(method, model, options) {

        // console.log('backbone model sync overwritten');
        // console.log('options');
        // console.log(options);

        var dfd = $.Deferred();

        options || (options = {});

        switch (method) {
            case 'create':
                break;

            case 'update':
                break;

            case 'delete':
                break;

            case 'read':
                // read/search request

                // console.info('sync reading model');
                // console.log(options);

                var modelName = model.__proto__.modelName;
                var data = {
                    model: modelName,
                    conditions: {
                        _id: model.get('_id') 
                    },
                    fields: this.search_fields,
                    limit: 1
                };

                options.data = options.data || {}; // set default options data, and overwrite

                _.extend(data, options.data);

                Api.search({
                    data: data,
                    success: function(response){ // ajax arguments

                        if(response.code != 200){
                            console.log('=error');
                            model._errLast = true;
                            if(options.error) options.error(this,response);
                            dfd.reject();
                            return;
                        }

                        model._fetched = true;
                        model._errLast = false;

                        // console.log('Calling success');

                        // After patching (if any occurred)

                        // Return data without the 'Model' lead
                        var tmp = [];
                        var tmp = _.map(response.data,function(v){
                            return v[modelName];
                        });

                        // Did we only get a single value?
                        if(_.size(tmp) != 1){
                            // Shoot
                            dfd.reject(); // is this correct, to reject? 
                            if(options.error){
                                options.error();
                            }
                            return;
                        }

                        // Return single value
                        window.setTimeout(function(){

                            // Resolve
                            dfd.resolve(tmp[0]);

                            // Fire success function
                            if(options.success){
                                options.success(tmp[0]);
                            }
                        },1);
                    
                    }
                });



                // // Emailbox search
                // Api.search({
                //     data: options.data,
                //     success: function(response){ // ajax arguments

                //         response = JSON.parse(response);

                //         if(response.code != 200){
                //             console.log('=error');
                //             if(options.error) options.error(this,response);
                //             dfd.reject();
                //             return;
                //         }
                //         // console.log('Calling success');

                //         // data or patch?
                //         if(response.hasOwnProperty('patch')){
                //             // returned a patch

                //             // do the patching
                //             // - need to get our previous edition
                //             // - apply the patch
                //             // - re-save the data

                //             // Get previous version of data
                //             // - stored in memory, not backed up anywhere
                //             // - included hash+text
                //             try {
                //                 // console.log(model.internalModelName + '_' + model.id);
                //                 if(App.Data.Store.ModelCache[model.internalModelName + '_' + model.id].text.length > 0){
                //                     // ok
                //                 }
                //             } catch(err){
                //                 // No previous cache to compare against!
                //                 // - this should never be sent if we're sending a valid hash
                //                 console.error('HUGE FAILURE CACHING!');
                //                 console.log(err);
                //                 return false;
                //             }

                //             // Create patcher
                //             var dmp = new diff_match_patch();

                //             // Build patches from text
                //             var patches = dmp.patch_fromText(response.patch);

                //             // get our result text!
                //             var result_text = dmp.patch_apply(patches, App.Data.Store.ModelCache[model.internalModelName + '_' + model.id].text);

                //             // Convert text to an object
                //             try {
                //                 response.data = JSON.parse(result_text[0]); // 1st, only 1 patch expected
                //             } catch(err){
                //                 // Shoot, it wasn't able to be a object, this is kinda fucked now
                //                 // - need to 
                //                 console.log('Failed recreating JSON');
                //                 console.log(response.data);
                //                 return false;
                //             }

                //         }

                //         // After patching (if any occurred)

                //         // Return data without the 'Model' lead
                //         var tmp = [];
                //         var tmp = _.map(response.data,function(v){
                //             return v[options.data.model];
                //         });

                //         // Did we only get a single value?
                //         if(_.size(tmp) != 1){
                //             // Shoot
                //             dfd.reject(); // is this correct, to reject? 
                //             if(options.error){
                //                 options.error();
                //             }
                //             return;
                //         }

                //         // Return single value
                //         window.setTimeout(function(){

                //             // Resolve
                //             dfd.resolve(tmp[0]);

                //             // Fire success function
                //             if(options.success){
                //                 options.success(tmp[0]);
                //             }
                //         },1);

                //         // Update cache with hash and text
                //         App.Data.Store.ModelCache[model.internalModelName + '_' + model.id] = {
                //             hash: response.hash,
                //             text: JSON.stringify(response.data)
                //         };

                //     }
                // });

                break;
        }

        return dfd.promise();

    }

    function emailbox_sync_collection(method, model, options) {

        console.log('backbone collection sync overwritten');

        var dfd = $.Deferred();

        options || (options = {});

        switch (method) {
            case 'create':
                break;

            case 'update':
                break;

            case 'delete':
                break;

            case 'read':
                // // read/search request
                // // console.log('sync reading');
                // // console.log(options);
                // // console.log(model); // or collection
                // // console.log(model.model.prototype.fields);

                // // turn on caching for fucking everything yeah
                // // - fuck it why not?
                // if(App.Credentials.usePatching){
                //     options.data.cache = true;
                // }

                // // Create namespace for storing
                // // console.info(model);
                // var ns = model.model.prototype.internalModelName + '_';

                // // Need to include a passed new cachePrefix for some collections
                // if(options.ns){
                //     // console.warn('cachePrefix');
                //     ns = ns + options.ns + '_';
                // }

                // // Collection namespace?
                // // - for ids
                // if(options.options && options.options.collectionCachePrefix){
                //     ns = ns+ options.options.collectionCachePrefix + '_';
                // }
                // // console.log('ns');
                // // console.log(ns);
                // // console.log(options);
                // // return false;

                // // Get previous cache_hash
                // // - just stored in memory for now
                // try {
                //     options.data.hash = App.Data.Store.CollectionCache[ns].hash;
                // } catch(err){
                //     // no hash exists
                // }

                var modelName = model.__proto__.model.prototype.modelName;
                var data = {
                    model: modelName,
                    conditions: this.search_conditions,
                    fields: this.search_fields,
                    limit: 10,
                    sort: {
                        '_id' : -1
                    }
                };

                options.data = options.data || {}; // set default options data, and overwrite

                _.extend(data, options.data);

                Api.search({
                    data: data,
                    success: function(response){ // ajax arguments

                        if(response.code != 200){
                            console.log('=error');
                            model._errLast = true;
                            if(options.error) options.error(this,response);
                            dfd.reject();
                            return;
                        }

                        model._errLast = false;
                        model._fetched = true;
                        
                        // console.log('Calling success');

                        // After patching (if any occurred)

                        // Return data without the 'Model' lead
                        var tmp = [];
                        var tmp = _.map(response.data,function(v){
                            return v[modelName];
                        });

                        // Return single value
                        window.setTimeout(function(){

                            // Resolve
                            dfd.resolve(tmp);

                            // Fire success function
                            if(options.success){
                                options.success(tmp);
                            }
                        },1);
                    
                    }
                });

                break;
        }

        return dfd.promise();

    }

    _.extend( Backbone.Model.prototype, Backbone.Semaphore );

    var remoteToJSON = Backbone.Model.prototype.toJSON;
    _.extend(Backbone.Model.prototype, {
        search_conditions: {},
        search_fields: []
    });

    Backbone.Model.prototype.toJSON = function( options ) {
        var that = this;
        // If this Model has already been fully serialized in this branch once, return to avoid loops

        // var json = Backbone.Model.prototype.toJSON.call( this, options );
        var json = remoteToJSON.call(this, options);
        _.each( this.related, function( rel ) {
            // var related = json[ rel.key ],
            //     includeInJSON = rel.options.includeInJSON,
            //     value = null;

            // Already got model?
            if(!that._related.hasOwnProperty( rel.key )){
                return;
            }

            // JSON related models
            var j = that._related[ rel.key].toJSON();
            json[ rel.key ] = j;

            // if ( includeInJSON === true ) {
            //     if ( related && _.isFunction( related.toJSON ) ) {
            //         value = related.toJSON( options );
            //     }
            // }
            // else if ( _.isString( includeInJSON ) ) {
            //     if ( related instanceof Backbone.Collection ) {
            //         value = related.pluck( includeInJSON );
            //     }
            //     else if ( related instanceof Backbone.Model ) {
            //         value = related.get( includeInJSON );
            //     }

            //     // Add ids for 'unfound' models if includeInJSON is equal to (only) the relatedModel's `idAttribute`
            //     if ( includeInJSON === rel.relatedModel.prototype.idAttribute ) {
            //         if ( rel instanceof Backbone.HasMany ) {
            //             value = value.concat( rel.keyIds );
            //         }
            //         else if  ( rel instanceof Backbone.HasOne ) {
            //             value = value || rel.keyId;
            //         }
            //     }
            // }
            // else if ( _.isArray( includeInJSON ) ) {
            //     if ( related instanceof Backbone.Collection ) {
            //         value = [];
            //         related.each( function( model ) {
            //             var curJson = {};
            //             _.each( includeInJSON, function( key ) {
            //                 curJson[ key ] = model.get( key );
            //             });
            //             value.push( curJson );
            //         });
            //     }
            //     else if ( related instanceof Backbone.Model ) {
            //         value = {};
            //         _.each( includeInJSON, function( key ) {
            //             value[ key ] = related.get( key );
            //         });
            //     }
            // }
            // else {
            //     delete json[ rel.key ];
            // }

            // if ( includeInJSON ) {
            //     json[ rel.keyDestination ] = value;
            // }

            // if ( rel.keyDestination !== rel.key ) {
            //     delete json[ rel.key ];
            // }
        });
        
        return json;
    };

    _.extend(Backbone.Collection.prototype, {
        search_conditions: {},
        search_fields: []
    });


    Backbone.Model.emailbox_sync = emailbox_sync_model;
    Backbone.Collection.emailbox_sync = emailbox_sync_collection;


    // Views

    _.extend(Backbone.View.prototype, {

        _apiEvents: [],
        _removeApiEvents: function(){
            _.each(this._apiEvents, function(ev){
                Api.Events.off(ev);
            });
        }

    });

    return Backbone;
}));