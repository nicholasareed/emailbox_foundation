define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone'),
        Api                 = require('api'),

        Attachment = Backbone.DeepModel.extend({

            sync: null


        }),

        AttachmentCollection = Backbone.Collection.extend({

            model: Attachment,
            sync: null,

            initialize: function(models, options){
            },

            fetch_search_results: function(options){
                var that = this;
                // Return attachments that meet search criteria

                // Doesn't do anything complex yet, just a regex search
                // - todo: links from contact, etc.

                // options.text

                var text = options.text;

                // escape regex characters
                var tmp_text = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

                Api.search({
                    data: {
                        model: 'Email',
                        conditions: {
                            'original.attachments.name' : {
                                '$regex' : '(' + tmp_text + ')',
                                '$options' : 'i'
                            }
                        },
                        fields: ['original.attachments','attributes.thread_id','common.date','original.headers.Subject'],
                        limit: 10,
                        sort: {"_id" : -1}
                    },
                    success: function(response, code, data, msg){
                        // response = JSON.parse(response);

                        // Parse out the attachments for each email
                        var attachments = [];
                        $.each(response.data,function(i,e){
                            $.each(e.Email.original.attachments,function(k,attachment){
                                // test the regex again
                                var tmp = new RegExp('(' + tmp_text + ')', 'i');
                                if(tmp.test(attachment.name)){
                                    attachments.push({
                                        id: e.Email._id + '-' + k.toString(),
                                        attachment: attachment,
                                        thread_id: e.Email.attributes.thread_id,
                                        email_id: e.Email._id,
                                        date: e.Email.common.date,
                                        subject: e.Email.original.headers.Subject
                                    });
                                }

                            });
                        });

                        // Call success
                        that.reset(attachments);

                        if(options.success) options.success(attachments);

                    }
                });

            }

        });

    return {
        Attachment: Attachment,
        AttachmentCollection: AttachmentCollection
    };

});