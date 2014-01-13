$.fn.youtube = function(options) {
    return this.each(function() {
      var options = $.extend({width:570, height:416}, options);
      var tmp_text = $(this).html();
      var text = tmp_text + "";
      var regex = /http:\/\/(www.)?youtube\.com\/watch\?v=([A-Za-z0-9._%-]*)(\&\S+)?/  
      var html = text.replace(regex, '<iframe class="youtube-player" type="text/html" width="' + options.width + '" height="' + options.height + '" src="http://www.youtube.com/embed/$2" frameborder="0"></iframe>');
      $(this).html(html);
    });
}

if(!String.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, '<a href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}