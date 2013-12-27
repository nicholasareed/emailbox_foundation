define(function (require) {

    "use strict";
    
    var CredsText       = require('text!app/utils/credentials.json');

    App.Credentials         = JSON.parse(CredsText);
    
    return App.Credentials;

});