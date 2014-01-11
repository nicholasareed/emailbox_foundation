define(function (require) {

    "use strict";

    var $                   = require('jquery-adapter'),
        _                   = require('underscore'),
        Backbone            = require('backbone-adapter'),

        ical                = require('ical'),

        models              = require('app/models/attachment'),
        tpl                 = require('text!tpl/SearchFileList.html'),

        Handlebars          = require('handlebars'),
        template            = Handlebars.compile(tpl);


    return Backbone.View.extend({

        className: 'search-list',

        initialize: function (options) {
            var that = this;
            _.bindAll(this, 
                'appendSubview',
                'clearSubviews',
                '_redelegate',
                'update_result_count');

            this.options = options;

            // Conduct the search, and then gather the related Threads into a collection (also fetchRelated Emails for Thread)
            var text = this.search_text = options.text;

            // Init collection (not fetching until later)
            this.collection = new models.AttachmentCollection();

            this.collection.fetch_search_results({
                text: this.search_text,
                options: {
                    reset: true
                }
            });

            // this.collection.on('all', function(e){
            //     console.log('Event:', e);
            // });
            this.collection.on('reset', function(collection){

                // Re-render base view
                that.render();

                // // Fetch the emails for this Thread
                // collection.each(function(model){

                //     // Setup the subview for this model
                //     that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
                //         model: model
                //     }));

                // });

                // Update count for results
                that.update_result_count();

            }, this);
            // this.collection.on('add', function(model){

            //     // Make sure element doesn't already exist in the list
            //     var found = false;
            //     _.each(that._subViews, function(sv){
            //         if(sv.model.get('_id') == model.get('_id')){
            //             found = true;
            //         }
            //     });

            //     // Setup the subview for this model
            //     if(!found){
            //         that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
            //             model: model
            //         }));
            //     }

            //     // that.sort_list_elem();

            //     // Update count for results
            //     that.update_result_count();

            // });
            // this.collection.on('remove', function(model){
            //     // Model has been removed from collection
            //     // - might still have an "Undo" option and we don't want to immediately remove it
                
            //     var subView = _.find(that._subViews, function(elem){
            //         if(elem.model == model){
            //             return true;
            //         }
            //     });

            //     if(subView.$el.hasClass('slider-complete') || subView.actedOn == true){
            //         // has been slid, don't remove it right now
            //         console.log("DO NOT REMOVE IT! (has been slid)");
            //         return false;
            //     }

            //     // Remove subview
            //     subView.remove();
            //     that._subViews = _.without(that._subViews, subView);

            //     // // Setup the subview for this model
            //     // that.appendSubview(that.$('.slide-list-items'), new ThreadSlideView({
            //     //     model: model
            //     // }));

            //     // that.sort_list_elem();

            // });
            // this.collection.on('sort', function(collection){
            //     // Update the sort values for each model
            //     collection.each(function(model, index){
            //         // Emit event on model (tell it the new position)
            //         model.trigger('resorted', index); // the subView is listening on the model
            //     });

            //     that.sort_list_elem();
            // });

            this.render();

        },

        _subViews: [],
        appendSubview: function($elem, subView){
            this._subViews.push(subView);
            $elem.append(subView.$el);
            // $el.html(subView.render().$el);
        },
        clearSubviews: function(){
            // Clear subviews
            _.each(this._subViews, function(subView){
                // subView.close();
                subView.remove();
            });

            this._subViews = [];
        }, 

        _redelegate: function(){

            // Remove events
            this.undelegateEvents();
            this.delegateEvents();

            // Custom delegation (if exists)
            if(this.delegateEventsCustom != undefined){
                this.delegateEventsCustom();
            }

            // Initiate _redelegate on child views
            _.each(this._subViews, function(subView){
                subView._redelegate();
            });
        },

        render: function () {

            // Rendering the entire search at once

            this.clearSubviews();

            // Write html through Template
            this.$el.html(template({
                files: this.collection.toJSON()
            }));

            return this;
        },

        events: {
            'click .quicklink' : 'quicklink',

            'click .attachment' : 'attachment_action'
        },

        update_result_count: function(){
            var that = this;

            that.$('.result-count').removeClass('searching');
            that.$('.result-count .rcount').text( this.collection.length );

        },

        sort_list_elem: function(){
            this.$('.slide-list-items > li').tsort({
                attr: 'data-sort-num',
                order: 'desc' // reverse
            });
        },

        attachment_action: function(ev){
            // Act on this collection element
            var that = this,
                elem = ev.currentTarget,
                attachment_id = $(elem).attr('data-tmp-id');

            // Action depends on attachment type (media, pic, video, ical, etc.)
            var model = this.collection.get(attachment_id);

            switch(model.attributes.attachment.type){
                case 'image/jpeg':
                case 'image/png':
                    // Open media in a different app
                    var ref = window.open(model.attributes.attachment.path, '_system');
                    break;
                case 'text/calendar':
                    // Download and parse the ical invitation
                    // - should already be parsed by Emailbox?...
                    $.ajax({
                        url: model.attributes.attachment.path,
                        cache: false,
                        success: function(response){
                            // Parse ical
                            var icalParsed = ical.parseICS(response);
                            for (var k in icalParsed){
                                if (icalParsed.hasOwnProperty(k)) {
                                    var ev = icalParsed[k];
                                    // console.log("Conference",
                                    //     ev.summary,
                                    //     'is in',
                                    //     ev.location,
                                    //     'on the', ev.start.getDate(), 'of', months[ev.start.getMonth()]);
                                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    // Is this an event? 
                                    if(ev.type == 'VEVENT'){
                                        console.log('Event:');
                                        console.log(ev);
                                        alert(ev.summary + ' is at ' + ev.location + ' on the ' + ev.start.getDate() + ' of ' + months[ev.start.getMonth()]);
                                    }

                                }
                            }
                        }
                    });
                    break;
            }

            return false;
        }

    });

});