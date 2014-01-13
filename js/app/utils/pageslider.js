define(function (require) {

    "use strict";

    var $ = require('jquery');

    return function PageSlider(container) {

        var currentPage,
            stateHistory = [];

        this.lastPage = null;

        this.force_reverse = false;

        this.back = function () {
            location.hash = stateHistory[stateHistory.length - 2];
        };

        // Use this function if you want PageSlider to automatically determine the sliding direction based on the state history
        this.slidePage = function (page) {

            var l = stateHistory.length,
                state = window.location.hash;

            if (l === 0) {
                stateHistory.push(state);
                this.slidePageFrom(page);
                return;
            }
            if (state === stateHistory[l - 2]) {
                stateHistory.pop();
                this.slidePageFrom(page, 'page-left');
            } else {
                stateHistory.push(state);
                this.slidePageFrom(page, 'page-right');
            }

        };

        // Use this function directly if you want to control the sliding direction outside PageSlider
        this.slidePageFrom = function (page, from) {
            var that = this;
            this.lastPage = _.extend({}, currentPage);

            if(this.force_reverse){
                from = 'page-right';
                this.force_reverse = false;
            }
            
            container.append(page.$el);

            if (!currentPage || !from) {
                page.$el.attr("class", "page page-center");
                currentPage = page;
                return;
            }

            if(typeof this.lastPage._close == 'function'){
                that.lastPage._close(); // closes out events
            }

            // Position the page at the starting position of the animation
            page.$el.attr("class", "page " + from);

            currentPage.$el.one('webkitTransitionEnd', function (e) {
                // remove el (should be removing the View!, not just the el?)
                $(e.target).remove();
            });

            // Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
            container[0].offsetWidth;

            // Position the new page and the current page at the ending position of their animation with a transition class indicating the duration of the animation
            page.$el.attr("class", "page transition page-center");
            currentPage.$el.attr("class", "page transition " + (from === "page-left" ? "page-right" : "page-left"));
            currentPage = page;
        };

    };

});