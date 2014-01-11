(function (factory) {

    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['handlebars'], factory);
    } else {
        // Browser globals
        factory(Handlebars);
    }
}(function (Handlebars) {

    "use strict";


    var Utils               = require('utils');


    Handlebars.registerHelper('print', function(data) {
        window.console.info(data);
        return "";
    });


    Handlebars.registerHelper('length', function(val, addition) {
        var tmp;
        try {
            tmp = val.length;
        } catch(err) {
            // invalid length attempt (probably undefined)
            tmp = 0;
        }

        if(addition != undefined){
            tmp += parseInt(addition, 10);
        }

        // Should never be below zero
        if(tmp < 0){
            tmp = 0;
        }

        return tmp;

    });

    Handlebars.registerHelper('size', function(val) {
        return _.size(val);
    });

    Handlebars.registerHelper('plusone', function(val) {
        return val + 1;
    });

    Handlebars.registerHelper('toFixed', function(val, len) {
        var tmp = parseFloat(val).toFixed(len);
        return isNaN(tmp) ? '--' : tmp;
    });

    Handlebars.registerHelper('toFixedOrNone', function(val, len) {
        var tmp = parseFloat(val).toFixed(len).toString();
        // console.log(tmp);
        // console.log(parseInt(tmp, 10).toString());
        if (parseInt(tmp, 10).toString() == tmp){
            return isNaN(tmp) ? '--' : parseInt(tmp, 10).toString();
        }
        return isNaN(tmp) ? '--' : tmp;
    });

    Handlebars.registerHelper('shorttime', function(datetime) {
        // return Today, Yesterday, or the actual date
        var date_string = '';
        var m = moment(datetime);
        
        if(!m.isValid()){
            return "-inv-"
        }

        var now = moment(),
            today = moment().format('D'),
            yesterday = moment().subtract('days',1).format('D');

        if(m.format('D') == today){
            return m.format("h:mma");
        }
        if(m.format('D') == yesterday){
            return "Y " + m.format("h:mma");
        }

        return m.format("MMM Do");

    });


    Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
        // Able to do things like:
        /*

        {{#compare Database.Tables.Count ">" 5}}
            There are more than 5 tables
        {{/compare}}

        {{#compare "Test" "Test"}}
            Default comparison of "==="
        {{/compare}}

        */

        var operators, result;
        
        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
        
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }
        
        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };
        
        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
        
        result = operators[operator](lvalue, rvalue);
        
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });



    Handlebars.registerHelper('compare_length', function (lvalue, operator, rvalue, options) {
        // Able to do things like:
        /*

        {{#compare Database.Tables.Count ">" 5}}
            There are more than 5 tables
        {{/compare}}

        {{#compare "Test" "Test"}}
            Default comparison of "==="
        {{/compare}}

        */

        var operators, result;

        if(lvalue == "undefined" || lvalue == null){
            return options.inverse(this);
        }
        
        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
        
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }
        
        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };
        
        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
        
        result = operators[operator](lvalue.length, rvalue);
        
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });



    Handlebars.registerHelper('compare_size', function (lvalue, operator, rvalue, options) {
        // Able to do things like:
        /*

        {{#compare Database.Tables.Count ">" 5}}
            There are more than 5 tables
        {{/compare}}

        {{#compare "Test" "Test"}}
            Default comparison of "==="
        {{/compare}}

        */

        var operators, result;
        
        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
        
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }
        
        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };
        
        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
        
        result = operators[operator](_.size(lvalue), rvalue);
        
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });
    

    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });

    
    Handlebars.registerHelper("count", function(list) {
        // Figure out how many unread there are
        try {
            return list.length;
        } catch(err){
            return 0;
            // return _.size(list);
        }

    });


    /**
     * Convert new line (\n\r) to <br>
     * from http://phpjs.org/functions/nl2br:480
     */
    Handlebars.registerHelper('nl2br', function(text) {
        var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        return new Handlebars.SafeString(nl2br);
    });



    var nl2br  = function(str, is_xhtml) {
        // http://kevin.vanzonneveld.net
        // - nl2br() => php.js
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    };

    Handlebars.registerHelper("ifCondIn", function(value, array, options) {
        // Doesn't work, not sure how to pass in values as an array!
        // - seems to only accept strings? Should I stringify them?
        if ($.inArray(value, array) > -1){
            return options.fn(this);
        } else if(options.inverse != undefined) {
            return options.inverse(this);
        } else {
            return null;
        }
    });

    Handlebars.registerHelper("ifOr", function(val1, val2, options) {
        // Doesn't work, not sure how to pass in values as an array!
        // - seems to only accept strings? Should I stringify them?
        if (val1 || val2){
            return options.fn(this);
        } else if(options.inverse != undefined) {
            return options.inverse(this);
        } else {
            return null;
        }
    });

    Handlebars.registerHelper("ifAny", function(arrValues, options) {
        // Doesn't work, not sure how to pass in values as an array!
        // - seems to only accept strings? Should I stringify them?
        var t = false;
        _.each(arrValues, function(v){
            if(v){
                t = true;
            }
        });

        if (t == true){
            return options.fn(this);
        } else if(options.inverse != undefined) {
            return options.inverse(this);
        } else {
            return null;
        }
    });




    /* Email-specific helpers */


    Handlebars.registerHelper("attachment_small_preview", function(attachment) {
        // Return preview of image
        // - used in SearchFiles
        // - or nothing

        try {
            if(attachment.thumbs.basewidth300){
                return '<img src="'+ attachment.thumbs.basewidth300.path +'" max-width2="16px" max-height2="16px" />';
            }
        } catch(err){
            // pass
        }

        return "&nbsp;";

    });


    Handlebars.registerHelper("ifEmailAction", function(emails, options) {
        var email = _.first(emails);

        var actions = email.original.actions;
        try {
            if(actions.length > 0){
                var action = actions[0];
                if(action.obj['@type'] == "EmailMessage"){
                    switch(action.obj.action['@type']){
                        case 'ViewAction':
                        case 'ConfirmAction':
                            return options.fn(this);
                        default:
                            break;
                    }
                }
            }
        }catch(err){

        }

        // Happens if we never should have continued
        if(options.inverse != undefined) {
            return options.inverse(this);
        } else {
            return null;
        }
    });

    Handlebars.registerHelper("email_action", function(emails) {
        var email = _.first(emails);

        var actions = email.original.actions;
        if(actions.length > 0){
            var action = actions[0];
            if(action.obj['@type'] == "EmailMessage"){
                switch(action.obj.action['@type']){
                    case 'ViewAction':
                        if(action.obj.action['name']){
                            return action.obj.action['name']
                        }
                        return "View";
                    case 'ConfirmAction':
                        if(action.obj.action['name']){
                            return action.obj.action['name']
                        }
                        return "Confirm";
                    case 'SaveAction':
                        if(action.obj.action['name']){
                            return action.obj.action['name']
                        }
                        return "Save";
                    default:
                        break;
                }
            }
        }

        // Happens if we never should have continued
        if(options.inverse != undefined) {
            return options.inverse(this);
        } else {
            return null;
        }
    });

    Handlebars.registerHelper("email_action_complete", function(emails) {
        var email = _.first(emails);

        var actions = email.original.actions;
        if(actions.length > 0){
            var action = actions[0];
            if(action.obj['@type'] == "EmailMessage"){
                switch(action.obj.action['@type']){
                    case 'ViewAction':
                        return "View";
                    case 'ConfirmAction':
                        return "Confirmed";
                    case 'SaveAction':
                        return "Saved";
                    default:
                        break;
                }
            }
        }

        // Happens if we never should have continued
        if(options.inverse != undefined) {
            return options.inverse(this);
        } else {
            return null;
        }
    });

    Handlebars.registerHelper('receivedDatetime', function(datetime) {
        // return Today, Yesterday, or the actual date
        var date_string = '';
        var m = moment(datetime);
        
        if(!m.isValid()){
            return "-inv-"
        }



        var now = moment(),
            today = moment().format('D'),
            yesterday = moment().subtract('days',1).format('D');

        if(m.format('D') == today){
            return m.format("h:mma");
        }
        if(m.format('D') == yesterday){
            return "Y " + m.format("h:mma");
        }

        return m.format("ddd MMM Do, h:mma");

    });

    Handlebars.registerHelper('receivedDatetimeTiny', function(datetime) {
        // return Date or Time
        var date_string = '';
        var m = moment(datetime);
        
        if(!m.isValid()){
            return "-inv-"
        }

        var now = moment(),
            today = moment().format('D'),
            yesterday = moment().subtract('days',1).format('D');

        if(m.format('D') == today){
            return m.format("h:mma");
        }
        if(m.format('D') == yesterday){
            return "Y " + m.format("h:mma");
        }

        return m.format("MMM Do");


    });

    Handlebars.registerHelper('senderName', function(sender_parsed) {
        
        return sender_parsed[0][0];

    });

    Handlebars.registerHelper('senderEmail', function(sender_parsed) {
        
        return sender_parsed[0][1];

    });

    Handlebars.registerHelper('personName', function(sender_parsed) {
        // If name doesn't exist, then don't include it
        if(sender_parsed[0] == ''){
            return sender_parsed[1];
        }
        return sender_parsed[0];

    });

    Handlebars.registerHelper('personEmail', function(sender_parsed) {
        // ony email
        return sender_parsed[1];

    });

    Handlebars.registerHelper('personNameAndEmail', function(sender_parsed) {
        // If name doesn't exist, then don't include it
        if(sender_parsed[0] == ''){
            return sender_parsed[1];
        }
        return sender_parsed[0] + ', ' + sender_parsed[1];

    });

    Handlebars.registerHelper('simpleRecipients', function(headers) {
        // a simple representation of recipients in the email
        // - only shown if there are multiple To, or any CC or BCC

        var showWith = s;

        if(headers.To_Parsed.length > 1){

        }
        if(sender_parsed[0] == ''){
            return sender_parsed[1];
        }
        return sender_parsed[0] + ', ' + sender_parsed[1];

    });

    Handlebars.registerHelper('lastReadStatus', function(Email) {
        // Get the read/unread status of the last email
        Email = Email || [];
        var tmp  = [].concat(Email),
            tmp2 = _.last(tmp);

        if(tmp2 == undefined){
            return 0;
        }

        // var x = _.map(Email, function(email){
        //     console.log(email.original.flags);
        //     console.log(email.original.TextBody);
        //     return email.original.flags;
        // });
        // window.console.log('FUCKFUCKUFUCK');
        // window.console.log(tmp2.original.TextBody);
        // // if($.inArray("\\Seen", tmp2.original.flags) > -1){
        // //     console.log('READ');
        // // }
        // // debugger;
        // console.log(tmp2.original.flags);

        try {
            if($.inArray("\\Seen", tmp2.original.flags) > -1){
                return 1;
            }
        } catch(err){
            console.log(err);
        }

        return 0;

    });

    Handlebars.registerHelper("display_bodies", function(Email, no_nl2br) {
        // Display the first ParsedData entry
        // - hide any additional entries

        no_nl2br = no_nl2br == true ? true : false;

        var parsedData = Email.original.ParsedData;
        // console.dir(Email.original.ParsedData);
        var tmp = '';

        // Building sections
        // - now incorporates Edited Emails (minimail only)
        var i = 0;
        // for (x in parsedData){
        _.each(parsedData,function(pieceOfData, index){
            i++;
            var content = '';
            // console.log(pieceOfData);
            try {
                if(pieceOfData.Body.length > 0){
                    content = no_nl2br ? pieceOfData.Body : nl2br(pieceOfData.Body, false);

                    if($.trim(content) == ""){
                        // Missing content, probably HTML content
                        // content = "[Email Content as HTML]"; // content non-existant, need to show a button for HTML view?
                        content = '<button class="btn btn-info view-html-email">View Fancy Email</button>';
                    }

                    tmp += '<div class="ParsedDataContent" data-level="'+index+'">'+content+'</div>';
                    // tmp += '<div class="signature">' + nl2br(pieceOfData.Signature) + '</div>';
                    // content += '<div class="signature">' + nl2br(pieceOfData.Signature) + '</div>';
                    // go to next parsedData
                    return;
                } else {
                    content = pieceOfData.Data;
                    content = no_nl2br ? content : nl2br(content,false);
                }
            } catch(err){
                // console.log(parsedData[x]);
                content = pieceOfData.Data;
                content = no_nl2br ? content : nl2br(content,false);

                if($.trim(content) == ""){
                    // Missing content, probably HTML content
                    // content = "[Email Content as HTML]";  // content non-existant, need to show a button for HTML view?
                    content = '<button class="btn btn-info view-html-email">View Fancy Email</button>';
                }
            }

            tmp += '<div class="ParsedDataContent" data-level="'+index+'">'+content+'</div>';
            
        });

        // Clickable selector to see the rest of the conversation
        // - only if the conversation is much longer
        if (i > 1){
            //tmp += '<div class="ParsedDataShowAll"><span>show '+ (i-1) +' previous</span></div>';
            tmp += '<div class="ParsedDataShowAll clearfix"><span class="expander">...</span><span class="edit">E</span></div>';
        }

        return new Handlebars.SafeString(tmp);

    });


    Handlebars.registerHelper("thread_participants_pretty", function(Email) {
        
        var all_names = [];

        // Received or Sent?
        var email_address = '';
        
        // Doesn't matter, just summarize everybody
        var to_search = ['From'];

        _.each(Email, function(email){

            _.each(to_search,function(search_val, i){
                var tmp = search_val + '_Parsed';
                if(typeof email.original.headers[tmp] == 'undefined'){
                    return;
                }
                // Parse search values
                _.each(email.original.headers[tmp],function(person, k){
                    var name = person[0],
                        email = person[1];

                    if(name.substr(0,7) == '=?utf-8'){
                        console.log('Odd name:', name);
                        name = Utils.utf8.decode(name);
                    }

                    var tmp_isme = false;
                    // _.each(App.Data.UserEmailAccounts.toJSON(),function(acct, l){
                    //     if(acct.email == email){
                    //         tmp_isme = true;
                    //     }
                    // });

                    if(tmp_isme){
                        if(search_val == 'To'){
                            return;
                        }
                        all_names.push('Me');
                        return;
                    }

                    if(name.length < 1 || name.length > 50){
                        // clog('Too short, or too long of name');
                        // clog(name);
                        all_names.push('Unknown');
                        return;
                    }
                    all_names.push(name);
                });
            });

        });

        // Re-order so that the order of the names matches...
        // - what makes sense to match? What order? Latest entry?

        all_names = _.uniq(all_names);
        all_names = all_names.reverse(); // todo - make sure getting valid/ordered results here

        return all_names.join(', ');

    });



    return Handlebars;
}));