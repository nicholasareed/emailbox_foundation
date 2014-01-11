require.config({

	baseUrl: 'js/lib',

	paths: {
		app: '../app',
		tpl: '../tpl',
		'backbone.touch' : 'backbone.touch',
		'backbone.deep-model' : 'backbone.deep-model',
		'backbone.quicklink' : 'backbone.quicklink',
		'backbone.fetch-cache' : 'backbone.fetch-cache',
		'backbone.relational' : 'backbone.relational',
		'backbone.email.sync' : 'backbone.email.sync',
		'handlebars-helpers' : '../app/utils/handlebars-helpers',
		'socketio' : 'local_socketio',
		'dmp' : 'diff_match_patch_uncompressed'
	},

	map: {
		'*': {
			'app/models/car': 'app/models/api/car',
			'app/models/driver': 'app/models/api/driver',
			'app/models/error': 'app/models/api/error',
			'app/models/trip': 'app/models/api/trip',
			'app/models/leg': 'app/models/api/leg',
			'app/models/bill': 'app/models/api/bill',
			'app/models/user': 'app/models/api/user',

			'app/models/user_email_account': 'app/models/api/user_email_account',
			'app/models/thread': 'app/models/api/thread',
			'app/models/email': 'app/models/api/email',
			'app/models/contact': 'app/models/api/contact',
			'app/models/attachment': 'app/models/api/attachment',

			'api' : 'app/utils/api',
			'utils' : 'app/utils/utils',
			'credentials' : 'app/utils/credentials'
		}
	},

	shim: {
		'socketio' : {
			exports: 'io'
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'hammer' : {
			deps: ['jquery'],
			exports: 'Hammer'
		},
		'dmp' : {
			deps: [],
			exports: 'diff_match_patch'
		},
		'jquery-adapter': {
			deps: ['jquery'],
			exports: 'jquery'
		},
		'backbone-adapter': {
			deps: ['backbone'],
			exports: 'Backbone'
		},
		'handlebars' : {
			exports: 'Handlebars'
		},
		'handlebars-adapter' : {
			deps: ['handlebars'],
			exports: 'Handlebars'
		},
		'jquery-adapter' : {
			deps: ['jquery'],
			exports: 'jquery'
		},
		'bigtext' : {
			deps: ['jquery'],
			exports: 'bigtext'
		},
		'credentials' : {
			deps: [],
			exports: 'Credentials',
		},
		'utils' : {
			deps: ['jquery','underscore','credentials2'],
			exports: ['Utils']
		},
		'api' : {
			deps: ['jquery','underscore','utils'],
			exports: ['Api']
		}
	},

	urlArgs: "v=" +  (new Date()).getTime()
});

// global data storage if invoked here?
var App = {
	Data: {
		Store: {
			Contact: null
		},
		Cache: {
			ModelReplacers: {},
			Patching: {} // backbone.emailboxsync
		},
		notifications_queue: [],
		xy: {
			window: {
				height: null,
				width: null
			}
		}
	}
};
var Api = null;

require(['jquery', 'backbone-adapter', 'app/router', 'credentials', 'utils', 'api','hammer','dmp'], function ($, Backbone, Router, credentials, Utils, LocalApi, Hammer, diff_match_patch) {

    // // Test saving a user...
    // require(["app/models/user"], function (models) {
    //     var user = new models.User();
    //     user.fetch();
    //     console.log('USER');
    //     console.log(user);
    //     user.set('android',[{ reg_id : '', last: new Date()}]);
    //     user.save();
    // });

	App.Events 			 	= _.extend({}, Backbone.Events);
	Api 					= LocalApi;

	// var models_UserEmailAccount = require('app/models/user_email_account');

	// phonegap/cordova usage
	App.Data.usePg = false;
	try {
		if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
			console.log('Using PhoneGap/Cordova!');
			App.Data.usePg = true;
		}
	} catch(err){

	}

	// Browser (development)
	if(!App.Data.usePg){
		console.log('Using Browser');
		onReady();
	}

	// listener for phonegap
	document.addEventListener("deviceready", function(){
		console.log('deviceready');
		// alert('device ready');
		onReady();
	}, false);


	function onReady(){

		$(document).ready(function(){

            // Enable swiping on the global <body>
            Hammer($('body').get(0), {
                swipe_velocity : 0.5
            });

			App.Data.xy.window.height = $(window).height();
			App.Data.xy.window.width = $(window).width();
			window.onresize = function(){
				if($(window).height() < App.Data.xy.window.height){
					// Keyboard is probably out
					// - add the class to the <body> and emit an event on <body> too
					if(!$('body').hasClass('keyboard-enabled')){
						console.log('enabling keyboard');
						$('body').addClass('keyboard-enabled');
						var normal_height = $('.scroller').height();
						// $('.scroller').css('height', (normal_height - ($(window).height() - App.Data.xy.window.height)) + 'px');
						$('.scroller').css('height', normal_height + 'px');
						$('.scroller').attr('data-old-height', normal_height);
						App.Events.trigger('keyboard-enabled');
					}
				} else {
					// Keyboard is not out (probably minimized)
					$('body').removeClass('keyboard-enabled');
					// $('.scroller').height( $('.scroller').attr('data-old-height') + 'px');
					$('.scroller').css('height','auto');
					App.Events.trigger('keyboard-disabled');
					console.log('disabling keyboard');
					// $('<style></style>').appendTo($(document.body)).remove();
				}
				$('<style></style>').appendTo($(document.body)).remove();

			}

			// Instantiate Router
			var router = new Router();
			App.router = router;

			// Initiate storage engine
			Utils.Storage.init()
				.then(function(){

					console.log('Loaded Storage.init');

					// Get access_token if it exists
					var oauthParams = Utils.getOAuthParamsInUrl();

					if(typeof oauthParams.access_token == "string"){

						// Have an access_token
						// - save it to localStorage
						Utils.Storage.set(App.Credentials.prefix_access_token + 'user', oauthParams.user_identifier, 'critical');
						Utils.Storage.set(App.Credentials.prefix_access_token + 'access_token', oauthParams.access_token, 'critical');

						// Save
						App.Events.trigger('saveAppDataStore',true);

						// Reload page, back to #
						window.location = [location.protocol, '//', location.host, location.pathname].join('');
						return;
					}

					// // Continue loading router
					// Backbone.history.start({silent: true}); // Launches "" router

					// Begin at the begining of the application
					// - router_hash: ""
					// with "silent:true" we need to trigger a router to run at some point, otherwise no route is followed by default
					Backbone.history.start({silent: true}); 
					Backbone.history.navigate('',{trigger: false});


					// Get user and set to app global
					Utils.Storage.get(App.Credentials.prefix_access_token + 'user', 'critical')
						.then(function(user){
							App.Credentials.user = user;
						});

					// Get access_token, set to app global, login to server (doesn't allow offline access yet)
					// - switch to be agnostic to online state (if logged in, let access offline stored data: need better storage/sync mechanisms)
					Utils.Storage.get(App.Credentials.prefix_access_token + 'access_token', 'critical')
						.then(function(access_token){

							console.log('Stored access_token:' + access_token);	

							// Make available to requests
							App.Credentials.access_token = access_token;

							// Run login script from body_login page if not logged in
							if(typeof App.Credentials.access_token != 'string' || App.Credentials.access_token.length < 1){
								// App.router.navigate("body_login", true);

								Backbone.history.navigate('login',{trigger: true})
								return;
							}

							// Validate credentials with mailstats server and emailbox 
							// - make an api request to load my email address

							var dfd = $.Deferred();

							// Logged in on mailstats server
							App.Data.LoggedIn = true;

							// Start api listener
							// socket.io
							Api.Event.start_listening();

							// Load login
							// Api.Event.start_listening();
							Backbone.history.navigate('home',{trigger: true})

						});

			}); // end App.Utils.Storage.init().then...

			var lastClicks = {};
			$("body").on("click", ".back-button", function (event) {
				console.log('.back-button clicked');
				// global "back" handler
				// - merge into our custom "back" handler
				var elem = event.currentTarget;
				// var lastclick = parseInt($(elem).attr('lastclick'),10),
				//     nowclick = new Date().getTime();

				// $(elem).attr('lastclick',nowclick);
				// if(lastclick > 0 || (lastclick + 500) > nowclick){
				//     // Was clicked previously, so don't let it re-fire
				//     event.stopPropagation();
				//     event.preventDefault();
				//     return false;
				// }

				event.stopPropagation();
				event.preventDefault();
				if($(elem).hasClass('reverse-page')){
					$("body").attr('reverse-page',"1");
					router.slider.force_reverse = true;
				}
				window.history.back();

				return false;
			});



			// Push notifications
			try { 
				App.Data.pushNotification = window.plugins.pushNotification;
				if (device.platform == 'android' || device.platform == 'Android') {
					// alert('android push');

					App.Data.pushNotification.register(function(result){
						console.log('Push Setup OK');
						// alert('success w/ Push Notifications');
						// alert('Push setup ok');
						// App.Utils.Notification.debug.temporary('Push Setup OK'); // not actually ok, not registering, nothing sending to it

					}, function(err){
						// alert('failed Push Notifications');
						// App.Utils.Notification.debug.temporary('Failed Push Notification Setup');
						console.error(err);
						// alert(err);
					}, 
					{
						"senderID":"501320483836", //"312360250527",
						"ecb":"onNotificationGCM"
					});
				} else {
					// // alert('not');
					// pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
				}
			}
			catch(err) { 
				// txt="There was an error on this page.\n\n"; 
				// txt+="Error description: " + err.message + "\n\n"; 
				// alert(txt); 
				// alert('Push Error2');
				console.error('Push Error 2');
				// console.log(err);
				// App.Utils.Notification.debug.temporary('Push Error');
			}

			// Pausing (exiting)
			document.addEventListener("pause", function(){
				// Mark as Paused
				// - this prevents Push Notifications from activating all at once when Resuming

				App.Data.paused = true;
				App.Data.was_paused = true;

			}, false);

			// Resume
			// - coming back to application
			document.addEventListener("resume", function(){
				// Gather existing Push Notifications and see if we should summarize them, or show individually (confirm, etc.)
				
				App.Data.paused = false;
				App.Data.was_paused = true;

				// Run 1 second after returning
				// - collecting all the Push Notifications into a queue
				// - enough time for all Push events to be realized
				setTimeout(function(){

					App.Data.paused = false;
					App.Data.was_paused = false;

					// Get queue
					// - more than 1 item in queue?
					// - different types of items?
					switch (App.Data.notifications_queue.length){
						case 0:
							// No messages
							break;
						case 1:
							// Only a single message, use normal
							Utils.process_push_notification_message(App.Data.notifications_queue.pop());
							break;
						default:
							// Multiple notifications
							// - get last added
							// alert(App.Data.notifications_queue.length + ' Push Notifications Received. Latest Processed');
							Utils.process_push_notification_message(App.Data.notifications_queue.pop());
							App.Data.notifications_queue = [];
							break;
					}
					var queue = App.Data.notifications_queue.concat([]);

					// - assuming 1 type of Push Notification only at this time

				},1000);

			}, false);


			// Init MENU button on Android (not always there?)
			document.addEventListener("menubutton", function(){
				// - only launches the settings if we're on the main view
				Backbone.history.loadUrl('launch_settings');
			}, false);

			// // Init BACK button on Android
			// // - disable default first
			// document.addEventListener("backbutton", function(killa){
			// 	// Any entries in the list?
			// 	if(App.Data.backbutton_functions.length < 1){

			// 		var a = confirm('Close minimail? ');
			// 		if(a){
			// 			navigator.app.exitApp();
			// 		}
			// 		return;
			// 	} else {
			// 		// Run the highest-bubbled function
			// 		App.Data.backbutton_functions[0].func();
			// 	}
			// }, false);

			// // Online/Offline state

			// //Create the View
			// // - render too
			// App.Data.GlobalViews.OnlineStatus = new App.Views.OnlineStatus();
			// App.Data.GlobalViews.OnlineStatus.render();

			// // Online
			// // - remove "not online"
			// document.addEventListener("online", function(){
			// 	// Am now online
			// 	// - emit an event?
			// 	App.Data.GlobalViews.OnlineStatus.trigger('online');

			// }, false);
			// document.addEventListener("offline", function(){
			// 	// Am now online
			// 	// - emit an event?
			// 	App.Data.GlobalViews.OnlineStatus.trigger('offline');

			// }, false);
			



		});
	}
	
});




// GCM = Google Cloud Messag[something]
function onNotificationGCM(e){
	// Received a notification from GCM
	// - multiple types of notifications

	// App.Utils.Notification.debug.temp('New Notification: ' + e.event);
	// alert('onNotificationGCM');
	console.log('onNotificationGCM');

	switch( e.event ){
		case 'registered':
			// alert('registered');
			// Registered with GCM
			if ( e.regid.length > 0 ) {
				// Your GCM push server needs to know the regID before it can push to this device
				// here is where you might want to send it the regID for later use.
				// alert('registration id: ' + e.regid);
				// App.Utils.Notification.debug.temp('Reg ID:' + e.regid.substr(0,25) + '...');
				console.log('Android registration ID for device');
				console.log(e.regid);

				// // Got the registration ID
				// // - we're assuming this happens before we've done alot of other stuff
				// App.Credentials.android_reg_id = e.regid;

				// Write the key
				// - see if the user is logged in
				var i = 0;
				var pushRegInterval = function(){
					window.setTimeout(function(){
						// See if logged in
						if(App.Data.user.get('_id')){
							// Sweet, logged in, update user's android_reg_id
							// alert('saving user!'); // ...
							// alert(App.Data.user.get('_id'));
							// alert(e.regid);
							App.Data.user.set({android: [{reg_id: e.regid, last: new Date()}]});
							App.Data.user.save(); // update the user

							// App.Plugins.Minimail.updateAndroidPushRegId(App.Credentials.android_reg_id);
						} else {
							// Try running again
							// App.Utils.Notification.debug.temp('NLI - try again' + i);
							console.log('Not logged in - try android registration update again');
							console.log(App.Data.user.get('_id'));
							i++;
							pushRegInterval();
						}
					},3000);
				};
				pushRegInterval();

			}
		break;

		case 'message':
			// if this flag is set, this notification happened while we were in the foreground.
			// you might want to play a sound to get the user's attention, throw up a dialog, etc.

			// alert('message received');
			// alert(JSON.stringify(e.payload));

			// Capture and then wait for a half-second to see if any other messages are incoming
			// - don't want to overload the person
			
			// alert('Message!');
			console.log(e);
			console.log(JSON.stringify(e));

			if (e.foreground){
				// We were in the foreground when it was incoming
				// - process right away
				console.log('In FOREground');

			    var utilsLib            = require('app/utils/utils'),
			    	Utils               = new utilsLib();
				Utils.process_push_notification_message(e);

			} else {
				// Not in the foreground
				// - they clicked the notification
				// - process all of them at once
				console.log('In BACKground!');
				if (e.coldstart){
					// App wasn't previously running, so it is starting up
					console.log('In COLDstart');
				} else {
					// App is probably already displaying some other page
				}

				// add to process queue
				// - the last/latest one gets analyzed
				console.log('ADDING TO PUSH QUEUE');
				App.Data.notifications_queue.push(e);

			}



		break;

		case 'error':
			alert('GCM error');
			alert(e.msg);
		break;

		default:
			alert('An unknown GCM event has occurred');
		break;
	}
};
