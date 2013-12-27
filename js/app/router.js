define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Backbone        = require('backbone'),
        // HomeView        = require('app/views/Home'),
        FullLoadingView = require('app/views/FullLoading'),

        PageSlider      = require('app/utils/pageslider'),
        slider          = new PageSlider($('body')),

        // homeView        = new HomeView(),
        loadingView     = new FullLoadingView();

    App.slider = slider;

    // Fastclick
    // - works wonderfully, far as I can tell, more reliable than backbone.touch (which causes phantom double-clicks after animations)
    var FastClick = require('app/utils/fastclick');
    new FastClick($('body').get(0));
    
    return Backbone.Router.extend({

        routes: {
            "": "home",
            "home" : "home",
            "home/:type/:text" : "home",

            "dash" : "dash",

            "thread/:id" : "thread",

            "reply" : "reply",
            "compose" : "compose",

            "search" : "search",

            "settings" : "settings",

            "login" : "login",
            "logout" : "logout"
        },

        slider: slider,

        login: function () {
            require(["app/views/Login"], function (LoginView) {
                slider.slidePage(new LoginView({}).$el);
            });
        },

        logout: function(){
            localStorage.setItem('user_v2_', false);
            Backbone.history.navigate('login', {trigger: true});
        },

        home: function (type, text) {
            if(type == undefined){
                type = 'label';
                text = 'Inbox';
            }
            require(["app/models/thread", "app/views/Home"], function (models, HomeView) {
                var homeView = new HomeView({
                    collection: new models.ThreadCollection([],{
                        type: type,
                        text: text
                    })
                });
                // homeView.delegateEvents();
                // homeView.delegateEventsCustom();
                slider.slidePage(homeView.$el);
            });
        },

        dash: function () {
            require(["app/views/Dash"], function (DashView) {
                slider.slidePage(new DashView({}).$el);
            });
        },

        thread: function (id) {
            require(["app/models/thread", "app/views/Thread"], function (models, ThreadView) {
                var threadModel = new models.Thread({
                    _id: id
                });
                slider.slidePage(new ThreadView({
                    model: threadModel
                }).$el);
            });
        },

        search: function () {
            require(["app/views/Search"], function (SearchView) {
                slider.slidePage(new SearchView({}).$el);
            });
        },

        reply: function (id) {
            require(["app/views/Reply"], function (ReplyView) {
                slider.slidePage(new ReplyView({}).$el);
            });
        },

        compose: function () {
            require(["app/views/Compose"], function (ComposeView) {
                slider.slidePage(new ComposeView({}).$el);
            });
        },

        settings: function () {
            require(["app/views/Settings"], function (SettingsView) {
                slider.slidePageFrom(new SettingsView({}).$el, 'page-left');
            });
        }




        // routes: {
        //     "": "home",
        //     "home" : "home",
        //     "home/:id": "home",

        //     "body" : "body",

        //     "login" : "login",
        //     "logout" : "logout",

        //     "driverselect" : "driverSelect",
        //     "drivers" : "driverList",
        //     "driver/edit/:id" : "driverEdit",
        //     "driver/:id" : "driverDetails",
        //     "driver" : "driverDetails",

        //     "trips" : "tripList",
        //     "trip/:id" : "tripDetails",
        //     "trips/car/:id" : "tripListCar",
        //     "trips/driver/:id" : "tripListDriver",

        //     "errors" : "errorList",
        //     "errors/:car_id" : "errorListForCar",
        //     "error/:id" : "error",

        //     "cars" : "carList",
        //     "car/edit/:id" : "car_edit",
        //     "car/:id" : "car",

        //     "settings/cars" : "settings_cars",
        //     "settings" : "settings"

        // },
        // slider: slider,

        // refresh: function (id) {
        //     loadingView.delegateEvents();
        //     slider.slidePage(loadingView.$el);
        //     window.setTimeout(function(){
        //         Backbone.history.navigate('home/' + id, {trigger: true});
        //     }, 1000);
        // },


        // body: function(){
        //     // Loads the stats for the person

        //     require(["app/views/Body"], function (BodyView) {
        //         slider.slidePage(new BodyView({}).$el);
        //     });
        // },


        // home: function (id) {
        //     var user = localStorage.getItem('user_v2_');
        //     try {
        //         user = JSON.parse(user);
        //     } catch(err){}

        //     if(!user){
        //         Backbone.history.navigate('login', {trigger: true});
        //         return;
        //     }
            
        //     require(["app/models/car", "app/views/Home"], function (models, HomeView) {
        //         if(id && id != undefined && id != null && id != 'null'){
        //             localStorage.setItem('stored_last_car_id_v1_', id);
        //             var carModel = new models.Car({_id: id});
        //             slider.slidePage(new HomeView({model: carModel}).$el);
        //             // car.fetch({
        //             //     prefill: true,
        //             //     success: function (data) {
        //             //         slider.slidePage(new HomeView({model: data}).$el);
        //             //         // slider.slidePage(homeView.$el);
        //             //     }
        //             // });

        //         } else {
        //             // Get the default ID and redirect back here! 
        //             // - or the previous one

        //             var stored_id = localStorage.getItem('stored_last_car_id_v1_');
        //             if(typeof stored_id == 'string'){
        //                 Backbone.history.navigate('home/' + stored_id, {trigger: true});
        //             } else {

        //                 var cars = new models.CarCollection();
        //                 cars.fetch({
        //                     prefill: true, 
        //                     success: function (data) {
        //                         // console.info('data');
        //                         // console.log(data);

        //                         cars.findDefault()
        //                             .then(function(default_id){
        //                                 console.info('most_recent id');
        //                                 console.info(default_id);
        //                                 Backbone.history.navigate('home/' + default_id, {trigger: true});
        //                                 // slider.slidePage(new HomeView({model: data}).$el);
        //                             });
        //                         // slider.slidePage(homeView.$el);
        //                     }
        //                 });
        //             }
                    
        //         }
        //     });
        //     // homeView.delegateEvents();
        //     // slider.slidePage(homeView.$el);
        // },

        // login: function () {
        //     require(["app/views/Login"], function (LoginView) {
        //         slider.slidePage(new LoginView({}).$el);
        //     });
        // },

        // logout: function(){
        //     localStorage.setItem('user_v2_', false);
        //     Backbone.history.navigate('login', {trigger: true});
        // },

        // driverSelect: function (id) {
        //     require(["app/views/DriverSelect"], function (DriverSelectView) {
        //         slider.slidePage(new DriverSelectView({}).$el);
        //     });
        // },

        // driverList: function () {
        //     require(["app/models/driver", "app/views/DriverList"], function (models, DriverListView) {
        //         slider.slidePage(new DriverListView({}).$el);
        //     });
        // },

        // driverDetails: function (id) {
        //     require(["app/models/driver", "app/views/Driver"], function (models, DriverView) {

        //         // See if id is undefined
        //         if(id == undefined){
        //             // Figure out last driver_id
        //             // - or don't show any driver!
        //             if(App.Data.Cache['last_driver_home'] != undefined){
        //                 Backbone.history.navigate('driver/' + App.Data.Cache['last_driver_home'], {trigger: true});
        //                 return;
        //             }
        //         }

        //         App.Data.Cache['last_driver_home'] = id;

        //         var driver = new models.Driver({_id: id});
        //         slider.slidePage(new DriverView({model: driver}).$el);
        //     });
        // },

        // driverEdit: function (id) {
        //     require(["app/models/driver", "app/views/DriverEdit"], function (models, DriverEditView) {
        //         var driver = new models.Driver({_id: id});
        //         slider.slidePage(new DriverEditView({model: driver}).$el);
        //     });
        // },

        // tripList: function () {
        //     require(["app/models/trip", "app/views/TripList"], function (models, TripListView) {
        //         var collection = new models.TripCollection([], {});
        //         slider.slidePage(new TripListView({
        //             collection: collection
        //         }).$el);
        //     });
        // },

        // tripListCar: function (id) {
        //     require(["app/models/trip", "app/views/TripList"], function (models, TripListView) {
        //         var collection = new models.TripCollection([], {});
        //         slider.slidePage(new TripListView({
        //             collection: new models.TripCollection([], {car_id: id})
        //         }).$el);
        //     });
        // },

        // tripListDriver: function (id) {
        //     require(["app/models/trip", "app/views/TripList"], function (models, TripListView) {
        //         var collection = new models.TripCollection([], {});
        //         slider.slidePage(new TripListView({
        //             collection: new models.TripCollection([], {driver_id: id})
        //         }).$el);
        //     });
        // },

        // tripDetails: function (id) {
        //     require(["app/models/trip", "app/views/Trip"], function (models, TripView) {
        //         var trip = new models.Trip({_id: id});
        //         slider.slidePage(new TripView({model: trip}).$el);
        //         // trip.fetch({
        //         //     success: function (data) {
        //         //         slider.slidePage(new TripView({model: data}).$el);
        //         //     }
        //         // });
        //     });
        // },

        // carList: function () {
        //     require(["app/models/car", "app/views/CarList"], function (models, CarListView) {
        //         slider.slidePage(new CarListView({}).$el);
        //     });
        // },

        // car: function (id) {
        //     require(["app/models/car", "app/views/Car"], function (models, CarView) {
        //         // This shouldn't be behind a fetch!
        //         // - should move inside the view
        //         var car = new models.Car({_id: id});
        //         car.fetch({
        //             success: function (data) {
        //                 slider.slidePage(new CarView({model: data}).$el);
        //             }
        //         });
        //     });
        // },

        // car_edit: function (id) {
        //     require(["app/models/car", "app/views/CarEdit"], function (models, CarEditView) {
        //         var car = new models.Car({_id: id});
        //         slider.slidePage(new CarEditView({model: car}).$el);
        //     });
        // },

        // errorList: function () {
        //     require(["app/models/error", "app/views/ErrorList"], function (models, ErrorListView) {
        //         slider.slidePage(new ErrorListView({}).$el);
        //     });
        // },

        // errorListForCar: function (car_id) {
        //     require(["app/models/error", "app/views/ErrorList"], function (models, ErrorListView) {
        //         slider.slidePage(new ErrorListView({
        //             car_id: car_id
        //         }).$el);
        //     });
        // },

        // error: function (error_code) {
        //     require(["app/views/Error"], function (ErrorView) {
        //         slider.slidePage(new ErrorView({
        //             errorCode: error_code
        //         }).$el);
        //     });
        // },

        // settings: function () {
        //     require(["app/views/Settings"], function (SettingsView) {
        //         slider.slidePageFrom(new SettingsView({}).$el, 'page-left');
        //     });
        // },

        // settings_cars: function () {
        //     require(["app/models/car", "app/views/SettingsCarList"], function (models, SettingsCarListView) {
        //         slider.slidePage(new SettingsCarListView({}).$el);
        //     });
        // }

    });

});